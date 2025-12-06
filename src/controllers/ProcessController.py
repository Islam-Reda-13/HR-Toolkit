from .BaseController import BaseController
from .ProjectController import ProjectController
import os
from langchain_community.document_loaders import TextLoader
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from models import ProcessingEnum
import logging

logger = logging.getLogger('uvicorn.error')

class ProcessController(BaseController):

    def __init__(self, project_id: str):
        super().__init__()

        self.project_id = project_id
        self.project_path = ProjectController().get_project_path(project_id=project_id)

    def get_file_extension(self, file_id: str):
        """Extract file extension from file_id (handles paths with folders)"""
        return os.path.splitext(file_id)[-1].lower()

    def get_file_loader(self, file_id: str):
        """Get appropriate file loader for the file"""
        
        file_ext = self.get_file_extension(file_id=file_id)
        
        # Normalize path separators for the OS
        normalized_file_id = file_id.replace('/', os.sep).replace('\\', os.sep)
        
        # Construct the full file path
        file_path = os.path.join(
            self.project_path,
            normalized_file_id
        )
        
        # Normalize the entire path to ensure consistency
        file_path = os.path.normpath(file_path)

        logger.info(f"Attempting to load file: {file_path}")

        # Check if file exists
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            logger.error(f"Original file_id: {file_id}")
            logger.error(f"Project path: {self.project_path}")
            return None

        # Check if it's actually a file (not a directory)
        if not os.path.isfile(file_path):
            logger.error(f"Path is not a file: {file_path}")
            return None

        # Return appropriate loader based on extension
        try:
            if file_ext == ProcessingEnum.TXT.value or file_ext == ProcessingEnum.MD.value:
                logger.info(f"Creating TextLoader for {file_id}")
                return TextLoader(file_path, encoding="utf-8")
            
            if file_ext == ProcessingEnum.PDF.value:
                logger.info(f"Creating PyMuPDFLoader for {file_id}")
                return PyMuPDFLoader(file_path)
            
            logger.error(f"Unsupported file extension: {file_ext} for file: {file_id}")
            return None
            
        except Exception as e:
            logger.error(f"Error creating loader for {file_id}: {e}", exc_info=True)
            return None

    def get_file_content(self, file_id: str):
        """Load file content using appropriate loader"""
        
        try:
            loader = self.get_file_loader(file_id=file_id)
            if loader:
                logger.info(f"Loading content for: {file_id}")
                content = loader.load()
                logger.info(f"Successfully loaded {len(content)} document(s) from {file_id}")
                return content
            
            logger.error(f"No loader available for file: {file_id}")
            return None
            
        except Exception as e:
            logger.error(f"Error loading content for {file_id}: {e}", exc_info=True)
            return None

    def process_file_content(self, file_content: list, file_id: str,
                            chunk_size: int=1000, overlap_size: int=200):
        """
        Process loaded file content into chunks with improved semantic awareness
        
        IMPROVED DEFAULTS:
        - chunk_size: 1000 characters (vs 100) - preserves more context
        - overlap_size: 200 characters (vs 20) - better continuity between chunks
        """
        
        if not file_content:
            logger.error(f"Empty file content for: {file_id}")
            return None

        try:
            # Use RecursiveCharacterTextSplitter with better separators
            # This splits on semantic boundaries (paragraphs, sentences) rather than arbitrary characters
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=chunk_size,
                chunk_overlap=overlap_size,
                length_function=len,
                # Prioritize splitting at semantic boundaries
                separators=[
                    "\n\n\n",  # Multiple blank lines (section breaks)
                    "\n\n",    # Paragraph breaks
                    "\n",      # Line breaks
                    ". ",      # Sentence endings
                    "! ",      # Exclamations
                    "? ",      # Questions
                    "; ",      # Semicolons
                    ", ",      # Commas
                    " ",       # Spaces
                    "",        # Characters (last resort)
                ],
                is_separator_regex=False,
            )

            # Extract text and metadata from loaded documents
            file_content_texts = [
                rec.page_content
                for rec in file_content
            ]

            file_content_metadata = [
                rec.metadata
                for rec in file_content
            ]

            # Create chunks with enhanced metadata
            chunks = []
            for i, (text, metadata) in enumerate(zip(file_content_texts, file_content_metadata)):
                # Split the text into chunks
                sub_chunks = text_splitter.create_documents(
                    [text],
                    metadatas=[metadata]
                )
                
                # Enhance metadata for each chunk
                for j, chunk in enumerate(sub_chunks):
                    # Add file identification
                    chunk.metadata['file_id'] = file_id
                    chunk.metadata['source_document'] = i
                    chunk.metadata['chunk_index'] = j
                    chunk.metadata['total_chunks'] = len(sub_chunks)
                    
                    # Add a preview for better context
                    preview = chunk.page_content[:100].replace('\n', ' ').strip()
                    chunk.metadata['preview'] = preview + '...' if len(chunk.page_content) > 100 else preview
                    
                    chunks.append(chunk)

            logger.info(f"Created {len(chunks)} chunks from {file_id}")
            logger.info(f"Average chunk size: {sum(len(c.page_content) for c in chunks) // len(chunks)} characters")
            
            return chunks
            
        except Exception as e:
            logger.error(f"Error processing content for {file_id}: {e}", exc_info=True)
            return None