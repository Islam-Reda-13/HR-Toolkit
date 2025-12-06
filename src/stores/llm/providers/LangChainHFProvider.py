from ..LLMInterface import LLMInterface
from ..LLMEnums import HuggingFaceEnums, DocumentTypeEnum
from langchain_community.embeddings import HuggingFaceEmbeddings
import logging

class LangChainHFProvider(LLMInterface):
    """
    Simplified HuggingFace provider using LangChain's HuggingFaceEmbeddings
    Works without PyTorch - uses transformers library directly
    """

    def __init__(self, api_key: str = None,
                       default_input_max_characters: int=1000,
                       default_generation_max_output_tokens: int=1000,
                       default_generation_temperature: float=0.1):
        
        self.api_key = api_key

        self.default_input_max_characters = default_input_max_characters
        self.default_generation_max_output_tokens = default_generation_max_output_tokens
        self.default_generation_temperature = default_generation_temperature

        self.generation_model_id = None

        self.embedding_model_id = None
        self.embedding_model = None
        self.embedding_size = None

        self.enums = HuggingFaceEnums
        self.logger = logging.getLogger(__name__)

    def set_generation_model(self, model_id: str):
        """Generation not implemented for this provider"""
        self.generation_model_id = model_id
        self.logger.warning("Text generation not implemented for LangChainHFProvider")

    def set_embedding_model(self, model_id: str, embedding_size: int):
        """Initialize embedding model using LangChain's HuggingFaceEmbeddings"""
        try:
            self.embedding_model_id = model_id
            self.embedding_size = embedding_size
            
            self.logger.info(f"Initializing embedding model: {model_id}")
            self.logger.info("Using CPU (no GPU/torch required)")
            
            # Simple initialization - no device specification needed
            # This will automatically use CPU via transformers library
            self.embedding_model = HuggingFaceEmbeddings(
                model_name=model_id,
                encode_kwargs={'normalize_embeddings': True}
            )
            
            # Test the model with a dummy embedding
            self.logger.info("Testing embedding model...")
            test_embedding = self.embedding_model.embed_query("test")
            
            if test_embedding and len(test_embedding) > 0:
                actual_size = len(test_embedding)
                self.logger.info(f"✓ Embedding model loaded successfully")
                self.logger.info(f"✓ Embedding dimension: {actual_size}")
                
                if actual_size != embedding_size:
                    self.logger.warning(
                        f"WARNING: Configured size ({embedding_size}) != actual size ({actual_size})"
                    )
                    self.logger.warning(f"Using actual size: {actual_size}")
                    self.embedding_size = actual_size
            else:
                raise Exception("Test embedding returned empty result")
                
        except Exception as e:
            self.logger.error(f"✗ Error loading embedding model: {e}")
            self.logger.exception("Full traceback:")
            self.embedding_model = None
            raise Exception(f"Failed to initialize embedding model: {e}")

    def process_text(self, text: str):
        return text[:self.default_input_max_characters].strip()

    def generate_text(self, prompt: str, chat_history: list=[], max_output_tokens: int=None,
                            temperature: float = None):
        """Text generation not supported by LangChainHFProvider"""
        self.logger.error("Text generation not supported by LangChainHFProvider")
        return None
    
    def embed_text(self, text: str, document_type: str = None):
        """Generate embeddings using LangChain's HuggingFaceEmbeddings"""
        if not self.embedding_model:
            self.logger.error("HuggingFace embedding model was not set")
            return None
        
        try:
            processed_text = self.process_text(text)
            
            if not processed_text:
                self.logger.error("Processed text is empty")
                return None
            
            # LangChain's embed_query returns a list directly
            embedding = self.embedding_model.embed_query(processed_text)
            
            if not embedding or len(embedding) == 0:
                self.logger.error("Embedding generation returned empty result")
                return None
                
            return embedding
            
        except Exception as e:
            self.logger.error(f"Error while embedding text: {e}")
            self.logger.exception("Full traceback:")
            return None
    
    def construct_prompt(self, prompt: str, role: str):
        return {
            "role": role,
            "content": self.process_text(prompt)
        }