"""Parallel Web Systems search integration"""
import httpx
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

PARALLEL_API_KEY = os.getenv("PARALLEL_API_KEY")
PARALLEL_URL = "https://api.parallel.ai/v1beta/search"

# Validate API key is present
if not PARALLEL_API_KEY:
    raise ValueError("PARALLEL_API_KEY environment variable is required but not set")

def search_vulnerabilities(hours_back: int = 24) -> dict:
    """
    Search for AI/LLM vulnerabilities using Parallel Web Systems API

    Args:
        hours_back: Number of hours to look back for vulnerabilities (default: 24)

    Returns:
        Dictionary containing search queries, results, and timestamp
    """

    queries = [
        "LLM vulnerability CVE 2024 2025",
        "AI security advisory prompt injection",
        "langchain vulnerability security",
        "OpenAI API security vulnerability",
        "RAG poisoning attack vector",
        "LLM jailbreak exploit disclosed",
    ]

    objective = """
    Find AI and LLM security vulnerabilities disclosed recently.
    Focus on:
    - CVE announcements affecting AI/ML systems
    - Security advisories from OpenAI, Anthropic, Google, Meta
    - Published exploits for prompt injection, jailbreaking
    - Supply chain vulnerabilities in ML libraries (transformers, langchain, llamaindex)
    - Data poisoning or model extraction attacks
    - RAG and embedding vulnerabilities

    Return detailed technical information including affected versions,
    exploitation methods, and any available patches or mitigations.
    """

    headers = {
        "Content-Type": "application/json",
        "x-api-key": PARALLEL_API_KEY,
        "parallel-beta": "search-extract-2025-10-10"
    }

    payload = {
        "objective": objective,
        "search_queries": queries,
        "max_results": 15,
        "excerpts": {"max_chars_per_result": 8000}
    }

    print(f"🔍 Searching vulnerabilities (last {hours_back}h)...")

    try:
        with httpx.Client(timeout=60.0) as client:
            response = client.post(PARALLEL_URL, headers=headers, json=payload)
            response.raise_for_status()
            results = response.json()

        print(f"✅ Found {len(results.get('results', []))} results")
        return {
            "queries": queries,
            "results": results,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except httpx.HTTPStatusError as e:
        print(f"❌ HTTP error {e.response.status_code}: {e.response.text}")
        return {
            "queries": queries,
            "results": {"error": f"HTTP {e.response.status_code}: {e.response.text}"},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        print(f"❌ Search error: {e}")
        return {
            "queries": queries,
            "results": {"error": str(e)},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
