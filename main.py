"""AI Vulnerability Fixer - Main Entry Point"""
from src.search import search_vulnerabilities
from src.analysis import analyze_with_gemini
from src.scoring import calculate_risk_score
from src.report import save_outputs, generate_markdown_report

def run():
    """
    Main execution flow:
    1. Search for vulnerabilities using Parallel Web Systems
    2. Analyze with Gemini Pro 3 using structured output
    3. Calculate AI-RQ risk score
    4. Generate and save reports
    """
    print("=" * 60)
    print("🛡️  AI VULNERABILITY FIXER")
    print("    Using Gemini Pro 3 + Parallel Web Systems")
    print("=" * 60)

    # 1. Search for vulnerabilities
    print("\n[1/4] Searching for AI/LLM vulnerabilities...")
    search_data = search_vulnerabilities(hours_back=24)

    # Check if search was successful
    if "error" in search_data.get("results", {}):
        print(f"⚠️  Search encountered an error: {search_data['results']['error']}")
        print("Continuing with available data...")

    # 2. Analyze with Gemini Pro 3
    print("\n[2/4] Analyzing with Gemini Pro 3 (structured output)...")
    analysis = analyze_with_gemini(search_data)

    # 3. Calculate risk score
    print("\n[3/4] Calculating AI-RQ risk score...")
    risk = calculate_risk_score(analysis.get("vulnerabilities", []))

    print(f"\n📊 AI-RQ: {risk['ai_rq_score']}/1000 ({risk['rating']})")
    print(f"   Vulnerabilities: {risk['vuln_count']}")
    print(f"   Patches: {len(analysis.get('patches', []))}")
    print(f"   Investment Grade: {'✅ Yes' if risk['investment_grade'] else '❌ No'}")

    # 4. Save outputs
    print("\n[4/4] Generating reports...")
    save_outputs(search_data, analysis)

    print("\n" + "=" * 60)
    print("✅ Analysis complete!")
    print("=" * 60)

    return {
        "search": search_data,
        "analysis": analysis,
        "risk": risk
    }

if __name__ == "__main__":
    try:
        result = run()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        raise
