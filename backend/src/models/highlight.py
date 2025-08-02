"""Data models for highlight processing."""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime


class HighlightProcessingRequest(BaseModel):
    """Request model for highlight content extraction."""
    highlight_id: str = Field(..., description="Unique identifier for the highlight")
    url: HttpUrl = Field(..., description="URL to extract content from")
    highlighted_text: str = Field(..., description="The text that was highlighted")
    page_title: Optional[str] = Field(None, description="Title of the page")
    
    class Config:
        json_schema_extra = {
            "example": {
                "highlight_id": "123e4567-e89b-12d3-a456-426614174000",
                "url": "https://example.com/article",
                "highlighted_text": "This is the highlighted text from the page",
                "page_title": "Example Article Title"
            }
        }


class HighlightProcessingResponse(BaseModel):
    """Response model for highlight content extraction."""
    status: str = Field(..., description="Processing status: success, error, or processing")
    highlight_id: str = Field(..., description="Unique identifier for the highlight")
    markdown_content: Optional[str] = Field(None, description="Extracted markdown content")
    errors: Optional[List[str]] = Field(None, description="List of errors if any occurred")
    processing_time_ms: Optional[int] = Field(None, description="Time taken to process in milliseconds")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of processing")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "highlight_id": "123e4567-e89b-12d3-a456-426614174000",
                "markdown_content": "# Article Title\n\nThis is the content in markdown format...",
                "errors": None,
                "processing_time_ms": 2500,
                "created_at": "2025-01-01T12:00:00Z"
            }
        }




class ContentExtractionConfig(BaseModel):
    """Configuration for content extraction."""
    formats: List[str] = Field(default=["markdown"], description="Output formats to extract")
    timeout_seconds: int = Field(default=60, description="Maximum time to wait for extraction")
    max_content_length: int = Field(default=1000000, description="Maximum content length in characters")
    
    class Config:
        json_schema_extra = {
            "example": {
                "formats": ["markdown"],
                "timeout_seconds": 60,
                "max_content_length": 1000000
            }
        }