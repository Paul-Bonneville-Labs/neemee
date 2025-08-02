"""Highlight processing API endpoints."""
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Optional
import structlog
from ..models.highlight import (
    HighlightProcessingRequest, 
    HighlightProcessingResponse
)
from ..processors.content_extractor import ContentExtractor
from ..config_wrapper import Config
from ..security import get_api_key

logger = structlog.get_logger()

# Create router
router = APIRouter(
    prefix="/highlights",
    tags=["highlights"],
    responses={404: {"description": "Not found"}},
)

# Lazy initialization
config = None
extractor = None
initialized = False


def ensure_initialized():
    """Ensure content extractor is initialized."""
    global initialized, config, extractor
    if not initialized:
        config = Config()
        extractor = ContentExtractor(config)
        
        if extractor.initialize():
            initialized = True
            logger.info("Content extractor initialized")
        else:
            raise HTTPException(status_code=503, detail="Content extractor initialization failed")


@router.post("/extract-content", response_model=HighlightProcessingResponse, dependencies=[Depends(get_api_key)])
async def extract_content(request: HighlightProcessingRequest):
    """
    Extract markdown content from a URL using Firecrawl.
    
    This endpoint:
    1. Uses Firecrawl to scrape the URL and convert to markdown
    2. Returns the markdown content for storage
    """
    ensure_initialized()
    
    try:
        logger.info("Extracting content", url=request.url, highlight_id=request.highlight_id)
        response = extractor.extract_content(request)
        
        if response.status == "error":
            logger.error("Content extraction failed", errors=response.errors)
            raise HTTPException(status_code=422, detail={
                "message": "Content extraction failed",
                "errors": response.errors
            })
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Unexpected error extracting content", error=str(e))
        raise HTTPException(status_code=500, detail={
            "message": "Internal server error during content extraction",
            "error": str(e)
        })



@router.get("/health")
async def health_check():
    """Check health of highlight processing service."""
    try:
        ensure_initialized()
        
        return {
            "status": "healthy",
            "initialized": initialized,
            "firecrawl_configured": bool(config.FIRECRAWL_API_KEY)
        }
        
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        return {
            "status": "unhealthy",
            "initialized": initialized,
            "firecrawl_configured": False,
            "error": str(e)
        }


# Cleanup on shutdown
def shutdown_extractor():
    """Shutdown extractor connections."""
    global initialized
    if initialized:
        if extractor:
            extractor.shutdown()
        initialized = False
        logger.info("Content extractor shutdown")