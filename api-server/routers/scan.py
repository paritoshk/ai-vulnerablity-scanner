"""Scan router for vulnerability scanning endpoints"""
import asyncio
import logging
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
import json
import sys
import os

# Add parent directory to path to import src modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from models import ScanRequest, ProgressUpdate
from src.search import search_vulnerabilities
from src.analysis import analyze_with_gemini
from src.scoring import calculate_risk_score

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


async def generate_scan_stream(scan_data: ScanRequest):
    """
    Generate Server-Sent Events stream for scan progress
    
    Yields SSE-formatted data for each scan step
    """
    try:
        # Step 1: Initialize
        yield f"data: {json.dumps({'step': 'init', 'status': 'running'})}\n\n"
        await asyncio.sleep(0.5)
        yield f"data: {json.dumps({'step': 'init', 'status': 'complete'})}\n\n"
        
        # Step 2: Search for vulnerabilities
        yield f"data: {json.dumps({'step': 'search', 'status': 'running'})}\n\n"
        logger.info(f"Starting vulnerability search for {scan_data.company}")
        
        # Build search query with company and LLM context
        search_data = search_vulnerabilities(hours_back=24)
        
        yield f"data: {json.dumps({'step': 'search', 'status': 'complete'})}\n\n"
        
        # Step 3: Analyze with Gemini
        yield f"data: {json.dumps({'step': 'analyze', 'status': 'running'})}\n\n"
        logger.info("Analyzing vulnerabilities with Gemini Pro 3")
        
        analysis = analyze_with_gemini(search_data)
        
        yield f"data: {json.dumps({'step': 'analyze', 'status': 'complete'})}\n\n"
        
        # Step 4: Calculate risk score
        yield f"data: {json.dumps({'step': 'score', 'status': 'running'})}\n\n"
        logger.info("Calculating AI-RQ risk score")
        
        risk = calculate_risk_score(analysis.get("vulnerabilities", []))
        
        yield f"data: {json.dumps({'step': 'score', 'status': 'complete'})}\n\n"
        
        # Step 5: Generate report
        yield f"data: {json.dumps({'step': 'report', 'status': 'running'})}\n\n"
        await asyncio.sleep(0.3)
        yield f"data: {json.dumps({'step': 'report', 'status': 'complete'})}\n\n"
        
        # Final result
        result = {
            "step": "done",
            "status": "complete",
            "result": {
                "success": True,
                "company": scan_data.company,
                "llmProvider": scan_data.llmProvider,
                "modelVersion": scan_data.modelVersion,
                "contextWindow": scan_data.contextWindow,
                "ragImplementation": scan_data.ragImplementation,
                "vectorDb": scan_data.vectorDb,
                "deploymentEnv": scan_data.deploymentEnv,
                "analysis": analysis,
                "risk": risk,
            }
        }
        
        yield f"data: {json.dumps(result)}\n\n"
        logger.info(f"Scan completed for {scan_data.company} - AI-RQ: {risk['ai_rq_score']}")
        
    except Exception as e:
        logger.error(f"Scan error: {str(e)}", exc_info=True)
        error_data = {
            "step": "error",
            "status": "error",
            "error": str(e)
        }
        yield f"data: {json.dumps(error_data)}\n\n"


@router.post("/scan")
@limiter.limit("10/minute")  # Rate limit: 10 scans per minute per IP
async def scan_vulnerabilities(request: Request, scan_data: ScanRequest):
    """
    Scan for AI/LLM vulnerabilities
    
    Returns a Server-Sent Events stream with progress updates
    """
    logger.info(f"Received scan request for company: {scan_data.company}")
    
    return StreamingResponse(
        generate_scan_stream(scan_data),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable buffering for nginx
        }
    )
