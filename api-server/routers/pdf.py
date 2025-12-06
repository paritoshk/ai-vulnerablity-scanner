"""PDF report generation endpoint"""
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from jinja2 import Template

logger = logging.getLogger(__name__)
router = APIRouter()


class PDFRequest(BaseModel):
    """Request model for PDF generation"""
    company: str
    llmProvider: str
    modelVersion: str
    contextWindow: str
    ragImplementation: str
    vectorDb: str
    deploymentEnv: str
    analysis: Dict[str, Any]
    risk: Dict[str, Any]


HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>AI Security Report - {{ company }}</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #FF6B00;
            padding-bottom: 20px;
        }
        h1 {
            color: #FF6B00;
            margin: 0;
        }
        .meta {
            color: #666;
            font-size: 14px;
            margin-top: 10px;
        }
        .risk-score {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .risk-value {
            font-size: 48px;
            font-weight: bold;
            color: #FF6B00;
        }
        .vuln {
            border-left: 4px solid #ddd;
            padding: 15px;
            margin: 15px 0;
            background: #fafafa;
        }
        .vuln.critical { border-color: #dc2626; }
        .vuln.high { border-color: #ea580c; }
        .vuln.medium { border-color: #eab308; }
        .vuln.low { border-color: #16a34a; }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-right: 8px;
        }
        .badge.critical { background: #fef2f2; color: #dc2626; }
        .badge.high { background: #fff7ed; color: #ea580c; }
        .badge.medium { background: #fefce8; color: #eab308; }
        .badge.low { background: #f0fdf4; color: #16a34a; }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f5f5f5;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛡️ AI Security Assessment Report</h1>
        <div class="meta">
            <strong>{{ company }}</strong><br>
            Generated: {{ date }}<br>
            Powered by Gemini 2.5 Pro & Parallel Web Systems
        </div>
    </div>

    <div class="risk-score">
        <h2>Risk Assessment</h2>
        <div class="risk-value">{{ risk.ai_rq_score }}/1000</div>
        <p><strong>Rating:</strong> {{ risk.rating }}</p>
        <p><strong>Investment Grade:</strong> {{ '✅ Yes' if risk.investment_grade else '❌ No' }}</p>
        <p><strong>Vulnerabilities Found:</strong> {{ risk.vuln_count }}</p>
    </div>

    <h2>System Configuration</h2>
    <table>
        <tr><th>LLM Provider</th><td>{{ llmProvider }}</td></tr>
        <tr><th>Sensitive Data</th><td>{{ modelVersion }}</td></tr>
        <tr><th>External Content</th><td>{{ contextWindow }}</td></tr>
        <tr><th>RAG Implementation</th><td>{{ ragImplementation }}</td></tr>
        <tr><th>Document Validation</th><td>{{ vectorDb }}</td></tr>
        <tr><th>Security Controls</th><td>{{ deploymentEnv }}</td></tr>
    </table>

    <h2>Executive Summary</h2>
    <p>{{ analysis.summary }}</p>

    <h2>Vulnerabilities ({{ analysis.vulnerabilities|length }})</h2>
    {% for vuln in analysis.vulnerabilities %}
    <div class="vuln {{ vuln.severity }}">
        <h3>{{ vuln.title }}</h3>
        <div>
            <span class="badge {{ vuln.severity }}">{{ vuln.severity|upper }}</span>
            <span class="badge">{{ vuln.owasp_category }}</span>
            {% if vuln.mitre_technique %}
            <span class="badge">{{ vuln.mitre_technique }}</span>
            {% endif %}
        </div>
        <p>{{ vuln.description }}</p>
        <p><small><strong>Exploitability:</strong> {{ vuln.exploitability_score }}/10 |
           <strong>Source:</strong> {{ vuln.source_url }}</small></p>
    </div>
    {% endfor %}

    <div class="footer">
        <p>CONFIDENTIAL - AI Security Report</p>
        <p>🤖 Generated with Claude Code</p>
    </div>
</body>
</html>
"""


@router.post("/generate-pdf")
async def generate_pdf(data: PDFRequest):
    """Generate PDF report from scan results"""
    try:
        logger.info(f"Generating PDF for {data.company}")

        # Render HTML template
        template = Template(HTML_TEMPLATE)
        html_content = template.render(
            company=data.company,
            llmProvider=data.llmProvider,
            modelVersion=data.modelVersion,
            contextWindow=data.contextWindow,
            ragImplementation=data.ragImplementation,
            vectorDb=data.vectorDb,
            deploymentEnv=data.deploymentEnv,
            analysis=data.analysis,
            risk=data.risk,
            date=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )

        # For now, return HTML (we'll add WeasyPrint in deployment)
        # WeasyPrint requires system dependencies that might not be installed
        return Response(
            content=html_content,
            media_type="text/html",
            headers={
                "Content-Disposition": f"attachment; filename=ai-security-report-{data.company.replace(' ', '-')}.html"
            }
        )

    except Exception as e:
        logger.error(f"PDF generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
