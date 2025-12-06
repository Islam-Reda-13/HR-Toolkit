from .BaseController import BaseController
from models.db_schemes import Project, DataChunk
from stores.llm.LLMEnums import DocumentTypeEnum
from typing import List
import json

class NLPController(BaseController):

    def __init__(self, vectordb_client, generation_client, 
                 embedding_client, template_parser):
        super().__init__()

        self.vectordb_client = vectordb_client
        self.generation_client = generation_client
        self.embedding_client = embedding_client
        self.template_parser = template_parser

    def create_collection_name(self, project_id: str):
        return f"collection_{project_id}".strip()
    
    def reset_vector_db_collection(self, project: Project):
        collection_name = self.create_collection_name(project_id=project.project_id)
        return self.vectordb_client.delete_collection(collection_name=collection_name)
    
    def get_vector_db_collection_info(self, project: Project):
        collection_name = self.create_collection_name(project_id=project.project_id)
        collection_info = self.vectordb_client.get_collection_info(collection_name=collection_name)

        return json.loads(
            json.dumps(collection_info, default=lambda x: x.__dict__)
        )
    
    def index_into_vector_db(self, project: Project, chunks: List[DataChunk],
                                   chunks_ids: List[int], 
                                   do_reset: bool = False):
        
        # step1: get collection name
        collection_name = self.create_collection_name(project_id=project.project_id)

        # step2: manage items
        texts = [ c.chunk_text for c in chunks ]
        metadata = [ c.chunk_metadata for c in  chunks]
        vectors = [
            self.embedding_client.embed_text(text=text, 
                                             document_type=DocumentTypeEnum.DOCUMENT.value)
            for text in texts
        ]

        # step3: create collection if not exists
        _ = self.vectordb_client.create_collection(
            collection_name=collection_name,
            embedding_size=self.embedding_client.embedding_size,
            do_reset=do_reset,
        )

        # step4: insert into vector db
        _ = self.vectordb_client.insert_many(
            collection_name=collection_name,
            texts=texts,
            metadata=metadata,
            vectors=vectors,
            record_ids=chunks_ids,
        )

        return True

    def search_vector_db_collection(self, project: Project, text: str, limit: int = 10):

        # step1: get collection name
        collection_name = self.create_collection_name(project_id=project.project_id)

        # step2: get text embedding vector
        vector = self.embedding_client.embed_text(text=text, 
                                                 document_type=DocumentTypeEnum.QUERY.value)

        if not vector or len(vector) == 0:
            return False

        # step3: do semantic search with increased limit for re-ranking
        retrieval_limit = min(limit * 3, 50)
        results = self.vectordb_client.search_by_vector(
            collection_name=collection_name,
            vector=vector,
            limit=retrieval_limit
        )

        if not results:
            return False

        # step4: Apply simple re-ranking
        for result in results:
            text_length = len(result.text)
            length_bonus = min(text_length / 1000, 0.1)
            completeness_bonus = 0.05 if result.text.strip().endswith(('.', '!', '?')) else 0
            result.score = result.score + length_bonus + completeness_bonus

        results.sort(key=lambda x: x.score, reverse=True)
        return results[:limit]
    
    def deduplicate_results(self, results: List):
        """Remove duplicate or highly similar chunks"""
        if not results or len(results) <= 1:
            return results
        
        deduplicated = []
        seen_texts = set()
        
        for result in results:
            normalized = result.text.strip().lower()[:200]
            is_duplicate = False
            for seen in seen_texts:
                if normalized in seen or seen in normalized:
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                deduplicated.append(result)
                seen_texts.add(normalized)
        
        return deduplicated
    
    def answer_rag_question(self, project: Project, query: str, limit: int = 10):
        
        answer, full_prompt, chat_history = None, None, None

        # step1: retrieve related documents
        retrieval_limit = max(limit, 15)
        retrieved_documents = self.search_vector_db_collection(
            project=project,
            text=query,
            limit=retrieval_limit,
        )

        if not retrieved_documents or len(retrieved_documents) == 0:
            return answer, full_prompt, chat_history
        
        # step2: Deduplicate results
        retrieved_documents = self.deduplicate_results(retrieved_documents)
        
        # step3: Construct system prompt
        system_prompt = self.template_parser.get("rag", "system_prompt")

        # step4: Build document context - NO TRUNCATION
        documents_prompts = "\n\n".join([
            self.template_parser.get("rag", "document_prompt", {
                    "doc_num": idx + 1,
                    "chunk_text": doc.text.strip(),
            })
            for idx, doc in enumerate(retrieved_documents)
        ])

        footer_prompt = self.template_parser.get("rag", "footer_prompt")
        enhanced_footer = f"{footer_prompt}\n\nUser Question: {query}\n\nProvide a comprehensive answer based on the context above. If the context doesn't contain enough information to fully answer the question, say so and provide what information is available."

        # step5: Build full prompt without truncation
        full_prompt = "\n\n".join([documents_prompts, enhanced_footer])

        # step6: Manually construct chat history to avoid truncation
        chat_history = [
            self.generation_client.construct_prompt(
                prompt=system_prompt,
                role=self.generation_client.enums.SYSTEM.value,
            ),
            # Add user message directly without processing
            {
                "role": self.generation_client.enums.USER.value,
                "content": full_prompt  # Full content, no truncation
            }
        ]

        # step7: Call the API directly with pre-built chat history
        try:
            response = self.generation_client.client.chat.completions.create(
                model=self.generation_client.generation_model_id,
                messages=chat_history,
                max_tokens=500,
                temperature=0.3
            )
            
            if response and response.choices and len(response.choices) > 0:
                answer = response.choices[0].message.content
        except Exception as e:
            self.generation_client.logger.error(f"Error generating RAG answer: {e}")
            return None, full_prompt, chat_history

        return answer, full_prompt, chat_history