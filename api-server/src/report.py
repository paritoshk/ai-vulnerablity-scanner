"""Report generation"""
from datetime import datetime, timezone
import json
import os
from src.scoring import calculate_risk_score

def generate_markdown_report(search_data: dict, analysis: dict) -> str:
    """
    Generate markdown report with vulnerabilities, patches, and risk assessment

    Args:
        search_data: Dictionary containing search results
        analysis: Dictionary containing analysis results from Gemini

    Returns:
        Formatted markdown report as string
    """

    vulns = analysis.get("vulnerabilities", [])
    patches = analysis.get("patches", [])
    risk = calculate_risk_score(vulns)

    report = f"""# 🛡️ AI Vulnerability Assessment Report

**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}
**Data Source:** Parallel Web Systems + Gemini Pro 3 Analysis

## 📊 Risk Score

| Metric | Value |
|--------|-------|
| **AI-RQ** | {risk['ai_rq_score']}/1000 |
| **Rating** | {risk['rating']} |
| **Investment Grade** | {'✅' if risk['investment_grade'] else '❌'} |
| **Vulns Found** | {risk['vuln_count']} |

## 📋 Summary

{analysis.get('summary', 'N/A')}

## 🔴 Vulnerabilities ({len(vulns)})

"""

    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    for v in sorted(vulns, key=lambda x: severity_order.get(x.get("severity", "medium"), 2)):
        emoji = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢"}.get(v.get("severity"), "⚪")
        report += f"""### {emoji} {v.get('title')}
**Severity:** {v.get('severity')} | **OWASP:** {v.get('owasp_category')} | **MITRE:** {v.get('mitre_technique', 'N/A')}
**CVE:** {v.get('cve_id', 'N/A')} | **Exploitability:** {v.get('exploitability_score')}/10
**Affected:** {', '.join(v.get('affected_systems', []))}

{v.get('description')}

**Source:** {v.get('source_url', 'N/A')}

---
"""

    report += f"\n## 🔧 Patches ({len(patches)})\n\n"
    for p in patches:
        report += f"""### 🩹 {p.get('vulnerability_title')}
**Type:** `{p.get('patch_type')}` | **Effort:** {p.get('estimated_effort_hours')}h | **Risk↓:** {p.get('risk_reduction_percent')}%

{p.get('description')}

**Steps:**
"""
        for i, step in enumerate(p.get('implementation_steps', []), 1):
            report += f"{i}. {step}\n"
        if p.get('code_example'):
            report += f"\n```python\n{p['code_example']}\n```\n"
        report += "\n---\n"

    return report

def save_outputs(search_data: dict, analysis: dict, output_dir: str = "outputs"):
    """
    Save JSON and markdown outputs to files

    Args:
        search_data: Dictionary containing search results
        analysis: Dictionary containing analysis results
        output_dir: Directory to save outputs (default: "outputs")

    Raises:
        OSError: If directory creation or file writing fails
    """

    try:
        os.makedirs(output_dir, exist_ok=True)
    except OSError as e:
        raise OSError(f"Failed to create output directory '{output_dir}': {e}")

    risk = calculate_risk_score(analysis.get("vulnerabilities", []))

    # JSON
    json_path = os.path.join(output_dir, "vuln_analysis.json")
    try:
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(
                {"search": search_data, "analysis": analysis, "risk": risk},
                f,
                indent=2,
                default=str
            )
    except (OSError, TypeError) as e:
        raise OSError(f"Failed to write JSON file '{json_path}': {e}")

    # Markdown
    try:
        report = generate_markdown_report(search_data, analysis)
        md_path = os.path.join(output_dir, "vuln_report.md")
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(report)
    except (OSError, TypeError) as e:
        raise OSError(f"Failed to write markdown file '{md_path}': {e}")

    print(f"📄 Saved: {json_path}, {md_path}")
