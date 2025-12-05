# 🛡️ AI Vulnerability Fixer

Real-time AI/LLM vulnerability scanner and risk assessment tool using **Gemini Pro 3** and **Parallel Web Systems**.

Agent that automatically discovers and fixes top vulnerabilities for your agentic and AI products.

## Features

- 🔍 **Real-time vulnerability search** using Parallel Web Systems API
- 🤖 **AI-powered analysis** with Gemini Pro 3 (structured output via LiteLLM)
- 📊 **AI-RQ risk scoring** (0-1000 scale with investment-grade ratings)
- 🏷️ **OWASP LLM Top 10 (2025)** classification
- 🎯 **MITRE ATLAS** technique mapping
- 🩹 **Automated patch generation** with code examples
- 📝 **Markdown & JSON reports**

## Architecture

This project uses a **client-server architecture** with three components:

```
┌─────────────────┐      HTTP/SSE      ┌─────────────────┐
│   Next.js Web   │ ◄──────────────► │  FastAPI Server │
│   (Frontend)    │                     │   (Backend)     │
└─────────────────┘                     └─────────────────┘
                                              │
                                              ▼
                                        ┌──────────────┐
                                        │  Scanner     │
                                        │  Modules     │
                                        │  (src/)      │
                                        └──────────────┘
```

**Project Structure:**
```
ai-vulnerablity-scanner/
├── api-server/             # FastAPI backend
│   ├── main.py            # FastAPI app
│   ├── routers/           # API endpoints
│   │   └── scan.py        # Scan endpoint with SSE
│   └── models.py          # Pydantic models
├── src/                   # Scanner modules
│   ├── search.py          # Parallel Web Systems integration
│   ├── analysis.py        # Gemini Pro 3 analysis
│   ├── scoring.py         # AI-RQ risk scoring
│   ├── report.py          # Report generation
│   └── schemas.py         # Pydantic schemas
├── web-app/               # Next.js frontend
│   └── app/
│       ├── page.tsx       # Landing page
│       ├── dashboard/     # Scan dashboard
│       └── api/scan/      # Next.js API proxy
├── tests/                 # Test suite
│   ├── test_scoring.py
│   ├── test_analysis.py
│   └── test_integration.py
├── config/
│   └── frameworks.py      # OWASP/MITRE constants
├── outputs/               # Generated reports
├── main.py                # CLI entry point
└── pyproject.toml         # Dependencies (uv)
```

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- `uv` package manager (recommended) or `pip`

### 1. Install Python Dependencies

Using `uv` (recommended):
```bash
uv sync
```

Or using pip:
```bash
pip install -r requirements.txt
```

### 2. Configure API Keys

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Edit `.env`:
```
GEMINI_API_KEY=your_gemini_api_key
PARALLEL_API_KEY=your_parallel_api_key
```

### 3. Run the Application

#### Option A: Web UI (Recommended)

**Terminal 1 - Start FastAPI Server:**
```bash
cd api-server
uv run uvicorn main:app --reload --port 8000
```

**Terminal 2 - Start Next.js Frontend:**
```bash
cd web-app
npm install
npm run dev
```

Visit http://localhost:3000

#### Option B: Command Line

```bash
python main.py
```


## How It Works

### 1. **Vulnerability Search** (`src/search.py`)
- Queries Parallel Web Systems API for recent AI/LLM vulnerabilities
- Searches across CVE databases, security advisories, and research papers
- Focuses on: prompt injection, jailbreaking, supply chain, RAG poisoning, etc.

### 2. **AI Analysis** (`src/analysis.py`)
- Uses **Gemini Pro 3** (`gemini-3-pro-preview`) for analysis
- Employs **LiteLLM's `response_format` parameter** for guaranteed JSON structure
- Classifies with OWASP LLM Top 10 (2025)
- Maps to MITRE ATLAS techniques
- Generates actionable patches with code examples

### 3. **Risk Scoring** (`src/scoring.py`)
Calculates **AI-RQ** (AI Risk Quotient) based on:
- Severity (40%)
- Exploitability (40%)
- OWASP category weight (30%)
- Vulnerability count (5pts each)

**Rating Scale:**
- **AAA-A** (700-1000): Investment Grade
- **BBB-CCC** (300-699): Moderate Risk
- **CC-D** (0-299): High Risk

### 4. **Report Generation** (`src/report.py`)
Generates:
- **JSON**: Machine-readable analysis
- **Markdown**: Human-readable report with emojis

## Output Example

```
============================================================
🛡️  AI VULNERABILITY FIXER
    Using Gemini Pro 3 + Parallel Web Systems
============================================================

[1/4] Searching for AI/LLM vulnerabilities...
🔍 Searching vulnerabilities (last 24h)...
✅ Found 12 results

[2/4] Analyzing with Gemini Pro 3 (structured output)...
🤖 Analyzing with Gemini Pro 3...
✅ Analysis complete - found 5 vulnerabilities

[3/4] Calculating AI-RQ risk score...

📊 AI-RQ: 542/1000 (BB)
   Vulnerabilities: 5
   Patches: 5
   Investment Grade: ✅ Yes

[4/4] Generating reports...
📄 Saved: outputs/vuln_analysis.json, outputs/vuln_report.md
```

## Key Technologies

- **Gemini Pro 3** (`gemini-3-pro-preview`): Latest Google AI model with enhanced reasoning
- **LiteLLM**: Unified API for LLM providers with structured output support
- **Parallel Web Systems**: Real-time web search API with AI-optimized extraction
- **Pydantic**: Data validation and schema enforcement

## API Keys

Get your API keys from:
- **Gemini**: https://aistudio.google.com/apikey
- **Parallel Web Systems**: https://parallel.ai/

## Testing

Run the test suite:

```bash
# Unit tests
uv run pytest tests/ -v

# Integration tests (requires FastAPI server running)
uv run python tests/test_integration.py
```

Current test coverage:
- ✅ 18 unit tests passing
- ✅ Risk scoring validation
- ✅ Pydantic schema validation
- ✅ Integration test with real scan

## API Documentation

For detailed API documentation, deployment guides, and troubleshooting, see:

**[📖 README_API.md](README_API.md)**

Topics covered:
- FastAPI endpoints and SSE format
- Rate limiting and CORS
- Deployment to production
- Testing examples
- Troubleshooting guide

## Framework References

- **OWASP LLM Top 10 (2025)**: https://owasp.org/www-project-top-10-for-large-language-model-applications/
- **MITRE ATLAS**: https://atlas.mitre.org/

## License

MIT 

