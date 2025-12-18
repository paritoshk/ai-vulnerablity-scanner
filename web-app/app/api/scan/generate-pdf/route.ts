import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const scanData = await request.json();

        // Validate we have scan data
        if (!scanData || !scanData.analysis) {
            return NextResponse.json(
                { error: "No scan data provided" },
                { status: 400 }
            );
        }

        const { company = "Unknown", analysis, risk } = scanData;
        const vulnerabilities = analysis.vulnerabilities || [];
        const patches = analysis.patches || [];

        // Generate HTML report
        const html = generateHTMLReport({
            company,
            summary: analysis.summary,
            vulnerabilities,
            patches,
            riskScore: risk?.ai_rq_score || 0,
            generatedAt: new Date().toISOString(),
        });

        // Return as HTML file
        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html",
                "Content-Disposition": `attachment; filename="ai-security-report-${company.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html"`,
            },
        });
    } catch (error: any) {
        console.error("PDF generation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate report" },
            { status: 500 }
        );
    }
}

function generateHTMLReport(data: {
    company: string;
    summary: string;
    vulnerabilities: any[];
    patches: any[];
    riskScore: number;
    generatedAt: string;
}): string {
    const { company, summary, vulnerabilities, patches, riskScore, generatedAt } = data;

    const getSeverityColor = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case "critical": return "#ef4444";
            case "high": return "#f97316";
            case "medium": return "#eab308";
            case "low": return "#3b82f6";
            default: return "#71717a";
        }
    };

    const vulnerabilitiesHTML = vulnerabilities.map((vuln, idx) => {
        const patch = patches.find((p: any) =>
            p.vulnerability_id === vuln.id || p.title?.includes(vuln.title?.split(' ')[0])
        );

        return `
            <div class="vulnerability">
                <div class="vuln-header">
                    <span class="severity" style="background-color: ${getSeverityColor(vuln.severity)}20; color: ${getSeverityColor(vuln.severity)}; border: 1px solid ${getSeverityColor(vuln.severity)}40;">
                        ${vuln.severity?.toUpperCase() || 'UNKNOWN'}
                    </span>
                    <strong>${vuln.title || `Vulnerability ${idx + 1}`}</strong>
                </div>
                <p class="description">${vuln.description || 'No description available.'}</p>
                ${patch ? `
                    <div class="remediation">
                        <h4>🔧 Remediation Strategy</h4>
                        <p>${patch.description || ''}</p>
                        ${patch.code_example ? `<pre><code>${escapeHtml(patch.code_example)}</code></pre>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Security Assessment Report - ${escapeHtml(company)}</title>
    <style>
        :root {
            --orange: #f97316;
            --black: #000000;
            --zinc-900: #18181b;
            --zinc-800: #27272a;
            --zinc-700: #3f3f46;
            --zinc-400: #a1a1aa;
            --zinc-300: #d4d4d8;
            --white: #ffffff;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--black);
            color: var(--white);
            line-height: 1.6;
            padding: 40px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid var(--zinc-800);
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .logo-icon {
            width: 40px;
            height: 40px;
            background: rgba(249, 115, 22, 0.1);
            border: 1px solid rgba(249, 115, 22, 0.2);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--orange);
            font-size: 20px;
        }
        
        .logo-text {
            font-size: 20px;
            font-weight: bold;
        }
        
        .score-box {
            text-align: right;
        }
        
        .score-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--zinc-400);
            margin-bottom: 4px;
        }
        
        .score-value {
            font-size: 48px;
            font-weight: bold;
            color: var(--orange);
        }
        
        h1 {
            font-size: 32px;
            margin-bottom: 8px;
        }
        
        .subtitle {
            color: var(--zinc-400);
            font-size: 14px;
        }
        
        .executive-summary {
            background: var(--zinc-900);
            border: 1px solid rgba(249, 115, 22, 0.2);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 40px;
        }
        
        .executive-summary h2 {
            color: var(--orange);
            font-size: 18px;
            margin-bottom: 16px;
        }
        
        .executive-summary p {
            color: var(--zinc-300);
            font-size: 16px;
        }
        
        h3 {
            font-size: 22px;
            margin-bottom: 20px;
        }
        
        .vulnerability {
            background: var(--zinc-900);
            border: 1px solid var(--zinc-800);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
        }
        
        .vuln-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }
        
        .severity {
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .description {
            color: var(--zinc-300);
            margin-bottom: 16px;
        }
        
        .remediation {
            background: var(--black);
            border: 1px solid var(--zinc-800);
            border-radius: 8px;
            padding: 16px;
        }
        
        .remediation h4 {
            color: #4ade80;
            font-size: 14px;
            margin-bottom: 12px;
        }
        
        .remediation p {
            color: var(--zinc-400);
            font-size: 14px;
            margin-bottom: 12px;
        }
        
        pre {
            background: var(--zinc-900);
            border: 1px solid var(--zinc-800);
            border-radius: 6px;
            padding: 12px;
            overflow-x: auto;
        }
        
        code {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 13px;
            color: #4ade80;
        }
        
        .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid var(--zinc-800);
            text-align: center;
            color: var(--zinc-400);
            font-size: 12px;
        }
        
        @media print {
            body {
                background: white;
                color: black;
                padding: 20px;
            }
            .vulnerability, .executive-summary, .remediation {
                background: #f4f4f5;
                border-color: #e4e4e7;
            }
            .description, .remediation p {
                color: #3f3f46;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <div class="logo">
                    <div class="logo-icon">🛡️</div>
                    <span class="logo-text">AI Security Scanner</span>
                </div>
                <h1 style="margin-top: 20px;">Assessment Report</h1>
                <p class="subtitle">Organization: ${escapeHtml(company)} | Generated: ${new Date(generatedAt).toLocaleDateString()}</p>
            </div>
            <div class="score-box">
                <div class="score-label">AI-RQ Risk Score</div>
                <div class="score-value">${riskScore}</div>
            </div>
        </div>
        
        <div class="executive-summary">
            <h2>Executive Summary</h2>
            <p>${escapeHtml(summary || 'No summary available.')}</p>
        </div>
        
        <h3>Detailed Findings (${vulnerabilities.length} vulnerabilities)</h3>
        ${vulnerabilitiesHTML || '<p style="color: var(--zinc-400);">No vulnerabilities found.</p>'}
        
        <div class="footer">
            <p>Generated by AI Security Scanner | Powered by Gemini 2.5 Pro</p>
            <p>This report is confidential and intended for internal use only.</p>
        </div>
    </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export const dynamic = 'force-dynamic';
