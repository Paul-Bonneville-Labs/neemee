"""Content extraction processor using Firecrawl."""
import time
import structlog
from typing import Optional, Dict, Any
try:
    from firecrawl import FirecrawlApp
except ImportError:
    # Handle the case where firecrawl package structure is different
    try:
        from firecrawl.firecrawl import FirecrawlApp
    except ImportError:
        # Fallback import or placeholder
        FirecrawlApp = None
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
            if FirecrawlApp is None:
                logger.error("FirecrawlApp not available - package import failed")
                return False
                
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
            
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            logger.info("Content extraction completed successfully",
                       highlight_id=request.highlight_id,
                       content_length=len(markdown_content),
                       processing_time_ms=processing_time_ms)
            
            return HighlightProcessingResponse(
                status="success",
                highlight_id=request.highlight_id,
                markdown_content=markdown_content,
                processing_time_ms=processing_time_ms
            )
            
        except Exception as e:
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            # Enhanced exception logging for debugging
            logger.error("Content extraction failed - DETAILED DEBUG", 
                        error=str(e),
                        error_type=type(e).__name__,
                        error_args=str(e.args) if hasattr(e, 'args') else 'no args',
                        highlight_id=request.highlight_id,
                        processing_time_ms=processing_time_ms)
            
            # Print to console for immediate debugging
            print(f"FIRECRAWL EXCEPTION DEBUG:")
            print(f"  Type: {type(e).__name__}")
            print(f"  Message: {str(e)}")
            print(f"  Args: {e.args if hasattr(e, 'args') else 'no args'}")
            print(f"  Highlight ID: {request.highlight_id}")
            
            # Enhanced debugging for HTTPError
            if hasattr(e, 'response'):
                print(f"  HTTP Status: {e.response.status_code if hasattr(e.response, 'status_code') else 'unknown'}")
                print(f"  HTTP Response: {e.response.text if hasattr(e.response, 'text') else 'no response text'}")
            if hasattr(e, 'request'):
                print(f"  HTTP URL: {e.request.url if hasattr(e.request, 'url') else 'unknown'}")
            
            # Check if this is a requests.HTTPError
            if 'requests' in str(type(e)) and hasattr(e, 'response'):
                try:
                    print(f"  Response JSON: {e.response.json()}")
                except:
                    print(f"  Response Text: {e.response.text}")
            
            # Additional debugging for any object attributes
            print(f"  Available attributes: {[attr for attr in dir(e) if not attr.startswith('_')][:10]}")
            
            # Extract detailed error information from HTTPError
            error_details = []
            firecrawl_status = None
            firecrawl_error = None
            
            if hasattr(e, 'response') and hasattr(e.response, 'status_code'):
                firecrawl_status = e.response.status_code
                
                # Try to get the actual error message from Firecrawl
                if hasattr(e.response, 'text'):
                    try:
                        import json
                        response_data = json.loads(e.response.text)
                        if 'error' in response_data:
                            firecrawl_error = response_data['error']
                        else:
                            firecrawl_error = e.response.text
                    except:
                        firecrawl_error = e.response.text
                
                # Format as "HTTP 403 - Error message"
                if firecrawl_status and firecrawl_error:
                    error_details.append(f"HTTP {firecrawl_status} - {firecrawl_error}")
                else:
                    error_details.append(f"HTTP {firecrawl_status}" if firecrawl_status else f"{type(e).__name__}: {str(e)}")
            else:
                error_details.append(f"{type(e).__name__}: {str(e)}")
            
            return HighlightProcessingResponse(
                status="error",
                highlight_id=request.highlight_id,
                errors=error_details,
                processing_time_ms=processing_time_ms
            )
    
    
    
    def shutdown(self):
        """Shutdown the content extractor and cleanup resources."""
        if self.firecrawl_client:
            # Firecrawl client doesn't require explicit cleanup
            self.firecrawl_client = None
            logger.info("Content extractor shutdown completed")