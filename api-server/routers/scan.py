"""Scan router for vulnerability scanning endpoints"""
import asyncio
import logging
from fastapi import APIRouter, Request, HTTPException
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


@router.post("/scan")
@limiter.limit("10/minute")
async def scan_vulnerabilities(request: Request, scan_data: ScanRequest):
    """
    Scan for AI/LLM vulnerabilities and return results
    Simple synchronous endpoint - waits for scan to complete
    """
    try:
        logger.info(f"Received scan request for company: {scan_data.company}")
        
        # Step 1: Search for vulnerabilities
        logger.info(f"Starting vulnerability search for {scan_data.company}")
        search_data = search_vulnerabilities(hours_back=24)
        
        # Step 2: Analyze with Gemini
        logger.info("Analyzing vulnerabilities with Gemini Pro 3")
        analysis = analyze_with_gemini(search_data)
        
        # Step 3: Calculate risk score
        logger.info("Calculating AI-RQ risk score")
        risk = calculate_risk_score(analysis.get("vulnerabilities", []))
        
        # Build result
        result = {
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
        
        logger.info(f"Scan completed for {scan_data.company} - AI-RQ: {risk['ai_rq_score']}")
        return result
        
    except Exception as e:
        logger.error(f"Scan failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
