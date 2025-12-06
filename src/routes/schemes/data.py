from pydantic import BaseModel, Field
from typing import Optional

class ProcessRequest(BaseModel):
    """
    Request model for processing uploaded files
    
    Improved chunking defaults for better semantic retrieval:
    - chunk_size: 1000 (was 100) - preserves context
    - overlap_size: 200 (was 20) - maintains continuity
    """
    file_id: Optional[str] = None
    chunk_size: int = Field(
        default=1000, 
        ge=100, 
        le=4000,
        description="Size of each chunk in characters. Larger chunks preserve more context."
    )
    overlap_size: int = Field(
        default=200, 
        ge=0, 
        le=1000,
        description="Overlap between chunks in characters. Helps maintain context across chunk boundaries."
    )
    do_reset: int = Field(
        default=0,
        ge=0,
        le=1,
        description="Whether to reset existing chunks (1) or append (0)"
    )