"""Gemini AI analysis via LiteLLM with response_schema for structured output"""
import json
import os
import litellm
from dotenv import load_dotenv
from src.schemas import AnalysisResult
from src.logger import setup_logger

load_dotenv()

# Validate and set API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required but not set")

os.environ["GEMINI_API_KEY"] = GEMINI_API_KEY

# Set up logger
logger = setup_logger("analysis")

PROMPT_TEMPLATE = """You are an AI security analyst. Analyze these search results for AI/LLM vulnerabilities.

SEARCH RESULTS:
{search_results}

TASK:
1. EXTRACT each distinct vulnerability from the search results
2. CLASSIFY with OWASP LLM Top 10 (2025):
   - LLM01:2025 Prompt Injection
   - LLM02:2025 Sensitive Information Disclosure
   - LLM03:2025 Supply Chain
   - LLM04:2025 Data and Model Poisoning
   - LLM05:2025 Improper Output Handling
   - LLM06:2025 Excessive Agency
   - LLM07:2025 System Prompt Leakage
   - LLM08:2025 Vector and Embedding Weaknesses
   - LLM09:2025 Misinformation
   - LLM10:2025 Unbounded Consumption

3. MAP to MITRE ATLAS techniques where applicable:
   - AML.T0051: LLM Prompt Injection
   - AML.T0054: LLM Jailbreaking
   - AML.T0020: Poison Training Data
   - AML.T0024: Exfiltration via ML Inference API
   - AML.T0040: ML Model Inference API Access
   - AML.T0043: Craft Adversarial Data
   - AML.T0056: Model Inversion
   - AML.T0018: Backdoor ML Model
   - AML.T0057: LLM Meta Prompt Extraction

4. PROPOSE actionable patches with Python code examples where applicable

IMPORTANT:
- For severity, use one of: critical, high, medium, low
- For patch_type, use one of: code_patch, config_change, dependency_update, architecture_change
- Provide concrete, actionable information
- Include source URLs from the search results
- Use discovered_date in YYYY-MM-DD format

Provide a comprehensive analysis with vulnerabilities, patches, and a summary.
"""

def analyze_with_gemini(search_data: dict) -> dict:
    """
    Parse and classify vulnerabilities with Gemini using structured output
    
    Uses gemini-2.5-pro as primary model with automatic fallback to 
    gemini-2.0-flash when rate limits are hit.

    Args:
        search_data: Dictionary containing search results from Parallel Web Systems

    Returns:
        Dictionary with vulnerabilities, patches, and summary
    """
    
    logger.info("Starting vulnerability analysis with Gemini AI")

    results = search_data.get("results", {})
    if isinstance(results, dict) and "results" in results:
        results_text = json.dumps(results["results"], indent=2, default=str)[:50000]
    else:
        results_text = json.dumps(results, indent=2, default=str)[:50000]

    logger.debug(f"Processing {len(results_text)} characters of search results")
    prompt = PROMPT_TEMPLATE.format(search_results=results_text)

    # Define models to try in order (primary -> fallback)
    models_to_try = [
        {
            "name": "gemini/gemini-2.5-pro",
            "display_name": "Gemini 2.5 Pro",
            "description": "Primary high-accuracy model"
        },
        {
            "name": "gemini/gemini-2.0-flash",
            "display_name": "Gemini 2.0 Flash",
            "description": "Fallback fast model"
        }
    ]

    last_error = None

    for model_info in models_to_try:
        model_name = model_info["name"]
        display_name = model_info["display_name"]
        
        logger.info(f"🤖 Analyzing with {display_name} ({model_info['description']})...")

        try:
            # Use Gemini with response_schema for guaranteed structured output
            logger.debug(f"Making API call to {model_name}")
            response = litellm.completion(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format=AnalysisResult,  # LiteLLM's response_schema parameter
            )

            # Extract the structured response
            content = response.choices[0].message.content
            logger.debug(f"Received response from {display_name}, parsing...")

            # Parse the JSON response
            if isinstance(content, str):
                # Handle potential markdown formatting
                if "```json" in content:
                    logger.debug("Detected markdown JSON formatting, extracting...")
                    content = content.split("```json")[1].split("```")[0]
                elif "```" in content:
                    logger.debug("Detected markdown code block, extracting...")
                    content = content.split("```")[1].split("```")[0]

                analysis = json.loads(content.strip())
            else:
                # If already parsed
                logger.debug("Response already parsed as structured data")
                analysis = content

            vuln_count = len(analysis.get('vulnerabilities', []))
            patch_count = len(analysis.get('patches', []))
            logger.info(f"✅ Analysis complete using {display_name}")
            logger.info(f"   Found {vuln_count} vulnerabilities and {patch_count} patches")
            
            return analysis

        except Exception as e:
            error_str = str(e)
            error_type = type(e).__name__
            last_error = e
            
            logger.warning(f"Error with {display_name}: {error_type} - {error_str[:200]}")

            # Check if it's a rate limit error - try fallback
            if any(indicator in error_str for indicator in ["RateLimitError", "429", "RESOURCE_EXHAUSTED", "quota"]):
                logger.warning(f"⚠️  {display_name} hit rate limit, trying fallback model...")
                continue  # Try next model
            
            # Check for JSON parsing errors
            elif "JSONDecodeError" in error_type:
                logger.error(f"JSON parsing failed for {display_name}: {e}")
                logger.debug(f"Problematic content: {content[:500] if 'content' in locals() else 'N/A'}")
                return {
                    "vulnerabilities": [],
                    "patches": [],
                    "summary": f"JSON parsing failed with {display_name}: {e}"
                }
            
            # Other errors - try fallback
            else:
                logger.warning(f"Unexpected error with {display_name}, trying fallback...")
                continue  # Try next model

    # If all models failed
    logger.error(f"❌ All models failed. Last error: {last_error}")
    return {
        "vulnerabilities": [],
        "patches": [],
        "summary": f"Analysis error: All models failed. Last error: {last_error}"
    }
