#!/usr/bin/env python3
"""Test script to see what Firecrawl actually returns."""

import os
from firecrawl import FirecrawlApp

# Load API key from environment
api_key = "fc-c4076e7fb5544f4086446eb435c17611"  # From .env file

if not api_key:
    print("ERROR: FIRECRAWL_API_KEY not found")
    exit(1)

print(f"Testing Firecrawl with API key: {api_key[:10]}...")

try:
    app = FirecrawlApp(api_key=api_key)
    print("FirecrawlApp initialized successfully")
    
    # Test scrape
    result = app.scrape_url("https://example.com", formats=["markdown"])
    
    print(f"Result type: {type(result)}")
    print(f"Result has 'get' method: {hasattr(result, 'get')}")
    print(f"Result has 'markdown' attribute: {hasattr(result, 'markdown')}")
    
    if hasattr(result, '__dict__'):
        print(f"Result attributes: {list(result.__dict__.keys())}")
    
    if hasattr(result, 'get'):
        print("It's a dict - getting markdown:")
        markdown = result.get('markdown', 'NO MARKDOWN FOUND')
        print(f"Markdown length: {len(markdown) if markdown else 0}")
    elif hasattr(result, 'markdown'):
        print("It's an object - getting markdown attribute:")
        markdown = getattr(result, 'markdown', 'NO MARKDOWN ATTRIBUTE')
        print(f"Markdown length: {len(markdown) if markdown else 0}")
    else:
        print("Neither dict nor object with markdown attribute")
        print(f"Result repr: {repr(result)}")
        
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()