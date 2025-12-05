"""AI-RQ risk scoring"""
from config.frameworks import OWASP_LLM_TOP_10

# AI-RQ Scoring Constants
MAX_SCORE = 1000
SEVERITY_WEIGHT = 0.4
EXPLOITABILITY_MULTIPLIER = 8
EXPLOITABILITY_WEIGHT = 0.4
OWASP_WEIGHT = 0.3
VULN_COUNT_PENALTY = 5
RISK_MULTIPLIER = 3
INVESTMENT_GRADE_THRESHOLD = 300

def calculate_risk_score(vulnerabilities: list) -> dict:
    """
    Calculate AI-RQ score (0-1000) based on vulnerabilities

    The AI-RQ (AI Risk Quotient) score is calculated based on:
    - Average severity (40% weight)
    - Average exploitability score (40% weight via 8x multiplier)
    - Average OWASP category weight (30% weight)
    - Number of vulnerabilities (5 points each)

    Score ranges:
    - 900-1000: AAA (Investment Grade)
    - 800-899: AA (Investment Grade)
    - 700-799: A (Investment Grade)
    - 600-699: BBB (Investment Grade)
    - 500-599: BB
    - 400-499: B
    - 300-399: CCC (Minimum Investment Grade)
    - 200-299: CC
    - 100-199: C
    - 0-99: D

    Args:
        vulnerabilities: List of vulnerability dictionaries

    Returns:
        Dictionary with ai_rq_score, rating, investment_grade, and vuln_count
    """

    if not vulnerabilities:
        return {
            "ai_rq_score": MAX_SCORE,
            "rating": "AAA",
            "investment_grade": True,
            "vuln_count": 0
        }

    severity_pts = {
        "critical": 100,
        "high": 70,
        "medium": 40,
        "low": 15
    }

    # Calculate components
    avg_severity = sum(
        severity_pts.get(v.get("severity", "medium"), 40)
        for v in vulnerabilities
    ) / len(vulnerabilities)

    avg_exploit = sum(
        v.get("exploitability_score", 5.0)
        for v in vulnerabilities
    ) / len(vulnerabilities)

    avg_owasp = sum(
        OWASP_LLM_TOP_10.get(v.get("owasp_category", ""), 70)
        for v in vulnerabilities
    ) / len(vulnerabilities)

    # Composite risk formula
    raw_risk = (
        (avg_severity * SEVERITY_WEIGHT) +
        (avg_exploit * EXPLOITABILITY_MULTIPLIER) +
        (avg_owasp * OWASP_WEIGHT) +
        (len(vulnerabilities) * VULN_COUNT_PENALTY)
    )

    # Convert to AI-RQ (1000 = best, 0 = worst)
    ai_rq = max(0, min(MAX_SCORE, MAX_SCORE - (raw_risk * RISK_MULTIPLIER)))

    # Rating scale
    ratings = [
        (900, "AAA"),
        (800, "AA"),
        (700, "A"),
        (600, "BBB"),
        (500, "BB"),
        (400, "B"),
        (300, "CCC"),
        (200, "CC"),
        (100, "C"),
        (0, "D")
    ]

    rating = next(r for thresh, r in ratings if ai_rq >= thresh)

    return {
        "ai_rq_score": int(ai_rq),
        "rating": rating,
        "investment_grade": ai_rq >= INVESTMENT_GRADE_THRESHOLD,
        "vuln_count": len(vulnerabilities)
    }
