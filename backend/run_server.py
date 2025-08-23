#!/usr/bin/env python3
"""
Simple script to run the FastAPI server
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",  # Use string import path instead of importing the app directly
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
