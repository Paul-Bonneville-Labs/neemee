"""Content extraction processor using Firecrawl."""
import time
import structlog
from typing import Optional, Dict, Any
from firecrawl import FirecrawlApp
from ..models.highlight import (
    HighlightProcessingRequest, 
    HighlightProcessingResponse,
    ContentExtractionConfig
)
from ..config_wrapper import Config

logger = structlog.get_logger(__name__)


class ContentExtractor:
    """Extracts content from URLs using Firecrawl."""
    
    def __init__(self, config: Config):
        """Initialize the content extractor."""
        self.config = config
        self.firecrawl_client: Optional[FirecrawlApp] = None
        self.extraction_config = ContentExtractionConfig()
        
    def initialize(self) -> bool:
        """Initialize the Firecrawl client."""
        try:
            if not self.config.FIRECRAWL_API_KEY:
                logger.error("FIRECRAWL_API_KEY not configured")
                return False
                
            self.firecrawl_client = FirecrawlApp(api_key=self.config.FIRECRAWL_API_KEY)
            logger.info("Firecrawl client initialized successfully")
            return True
            
        except Exception as e:
            logger.error("Failed to initialize Firecrawl client", error=str(e))
            return False
    
    def extract_content(self, request: HighlightProcessingRequest) -> HighlightProcessingResponse:
        """Extract content from a URL using Firecrawl."""
        start_time = time.time()
        
        try:
            if not self.firecrawl_client:
                return HighlightProcessingResponse(
                    status="error",
                    highlight_id=request.highlight_id,
                    errors=["Firecrawl client not initialized"]
                )
            
            logger.info("Starting content extraction", 
                       url=str(request.url), 
                       highlight_id=request.highlight_id)
            
            # Use Firecrawl to scrape the URL - newer API
            scrape_result = self.firecrawl_client.scrape_url(
                url=str(request.url),
                formats=self.extraction_config.formats
            )
            
            if not scrape_result:
                return HighlightProcessingResponse(
                    status="error",
                    highlight_id=request.highlight_id,
                    errors=["Failed to scrape URL - no data returned"]
                )
            
            # Handle Firecrawl response - could be dict or ScrapeResponse object
            markdown_content = None
            
            # Log the response type for debugging
            logger.info("Firecrawl response debug", 
                       result_type=type(scrape_result).__name__,
                       is_dict=isinstance(scrape_result, dict),
                       has_markdown_attr=hasattr(scrape_result, 'markdown'),
                       has_data_attr=hasattr(scrape_result, 'data'))
            
            if isinstance(scrape_result, dict):
                # Dictionary response
                markdown_content = scrape_result.get('markdown', '')
            elif hasattr(scrape_result, 'markdown'):
                # ScrapeResponse object with markdown attribute
                markdown_content = scrape_result.markdown
            elif hasattr(scrape_result, 'data') and hasattr(scrape_result.data, 'markdown'):
                # Response object with data.markdown
                markdown_content = scrape_result.data.markdown
            elif hasattr(scrape_result, 'data') and isinstance(scrape_result.data, dict):
                # Response object with data dictionary
                markdown_content = scrape_result.data.get('markdown', '')
            else:
                logger.error("Could not extract markdown from response", 
                           result_type=type(scrape_result).__name__,
                           available_attrs=[attr for attr in dir(scrape_result) if not attr.startswith('_')][:10])
                return HighlightProcessingResponse(
                    status="error",
                    highlight_id=request.highlight_id,
                    errors=[f"Unsupported response type: {type(scrape_result).__name__}"]
                )
            
            if not markdown_content:
                logger.error("No markdown content found in response", 
                           result_type=type(scrape_result).__name__)
                return HighlightProcessingResponse(
                    status="error",
                    highlight_id=request.highlight_id,
                    errors=["No markdown content extracted from URL"]
                )
            
            
            # Validate content length
            if len(markdown_content) > self.extraction_config.max_content_length:
                logger.warning("Content length exceeds maximum", 
                             content_length=len(markdown_content),
                             max_length=self.extraction_config.max_content_length)
                markdown_content = markdown_content[:self.extraction_config.max_content_length]
            
            # Create content preview (first 500 characters)
            content_preview = self._create_preview(markdown_content)
            
            # Build extraction metadata
            extraction_metadata = self._build_metadata(scrape_result, markdown_content)
            
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            logger.info("Content extraction completed successfully",
                       highlight_id=request.highlight_id,
                       content_length=len(markdown_content),
                       processing_time_ms=processing_time_ms)
            
            return HighlightProcessingResponse(
                status="success",
                highlight_id=request.highlight_id,
                markdown_content=markdown_content,
                content_preview=content_preview,
                extraction_metadata=extraction_metadata,
                processing_time_ms=processing_time_ms
            )
            
        except Exception as e:
            processing_time_ms = int((time.time() - start_time) * 1000)
            logger.error("Content extraction failed", 
                        error=str(e),
                        highlight_id=request.highlight_id,
                        processing_time_ms=processing_time_ms)
            
            return HighlightProcessingResponse(
                status="error",
                highlight_id=request.highlight_id,
                errors=[f"Content extraction failed: {str(e)}"],
                processing_time_ms=processing_time_ms
            )
    
    def _create_preview(self, markdown_content: str) -> str:
        """Create a preview of the content (first 500 characters)."""
        if len(markdown_content) <= 500:
            return markdown_content
        
        # Try to break at a word boundary
        preview = markdown_content[:500]
        last_space = preview.rfind(' ')
        if last_space > 400:  # Only break at word if it's not too short
            preview = preview[:last_space]
        
        return preview + "..."
    
    def _build_metadata(self, scrape_result, markdown_content: str) -> Dict[str, Any]:
        """Build extraction metadata from scrape result and content."""
        metadata = {
            "word_count": len(markdown_content.split()),
            "character_count": len(markdown_content),
            "extraction_source": "firecrawl"
        }
        
        # Add reading time estimate (assuming 200 words per minute)
        words = metadata["word_count"]
        reading_time_minutes = max(1, round(words / 200))
        metadata["reading_time_minutes"] = reading_time_minutes
        
        # Add any additional metadata from Firecrawl response
        firecrawl_metadata = None
        if isinstance(scrape_result, dict) and 'metadata' in scrape_result:
            firecrawl_metadata = scrape_result['metadata']
        elif hasattr(scrape_result, 'metadata'):
            firecrawl_metadata = scrape_result.metadata
        elif hasattr(scrape_result, 'data') and hasattr(scrape_result.data, 'metadata'):
            firecrawl_metadata = scrape_result.data.metadata
        elif hasattr(scrape_result, 'data') and isinstance(scrape_result.data, dict) and 'metadata' in scrape_result.data:
            firecrawl_metadata = scrape_result.data['metadata']
        
        if firecrawl_metadata and isinstance(firecrawl_metadata, dict):
            # Include relevant metadata from Firecrawl
            for key in ['title', 'description', 'language', 'sourceURL']:
                if key in firecrawl_metadata:
                    metadata[f"page_{key.lower()}"] = firecrawl_metadata[key]
        
        return metadata
    
    def shutdown(self):
        """Shutdown the content extractor and cleanup resources."""
        if self.firecrawl_client:
            # Firecrawl client doesn't require explicit cleanup
            self.firecrawl_client = None
            logger.info("Content extractor shutdown completed")