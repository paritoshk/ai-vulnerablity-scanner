# AI Vulnerability Scanner - Demo Recording Guide

## 🎬 Quick Demo Recording

### Option 1: Automated Playwright Test (Recommended)

**Install Playwright:**
```bash
cd web-app/
npm install -D @playwright/test
npx playwright install chromium
```

**Run the full demo (with scan):**
```bash
# Slow motion for better recording
npx playwright test demo.spec.ts --headed --slowMo=800

# With video recording
npx playwright test demo.spec.ts --headed --slowMo=800 --video=on
```

**Quick demo (form fill only, no scan):**
```bash
npx playwright test demo.spec.ts:18 --headed --slowMo=500
```

The test will:
1. Navigate to localhost:3000
2. Enter access code "DEMO"
3. Fill all form fields with realistic data
4. Start the vulnerability scan
5. Wait for results (60-90 seconds)
6. Take screenshots at each major step

Screenshots are saved to:
- `demo-form-filled.png` - Completed form
- `demo-scan-progress.png` - Progress bar with checkmarks
- `demo-scan-results.png` - Final vulnerability results

### Option 2: Manual Recording

1. **Start the dev server:**
```bash
cd web-app/
npm run dev
```

2. **Open http://localhost:3000**

3. **Enter access code:** `DEMO` or `SHIELD2025`

4. **Fill out the form with sample data:**

**Organization:** TechCorp Inc

**LLM Provider:** OpenAI GPT-4, Anthropic Claude 3.5 Sonnet

**Sensitive Data:**
```
PII including customer names, emails, phone numbers. Financial transaction data. Proprietary ML training datasets.
```

**External Content Injection:**
```
Yes - users can upload resumes for analysis, paste URLs for content scraping, and submit support tickets via email
```

**RAG Implementation:**
```
Yes - Pinecone vector database with internal documentation and knowledge base
```

**RAG Validation:**
```
Content filtering for PII via Presidio, access control checks, metadata verification
```

**Security Controls:**
```
NeMo Guardrails for prompt filtering, human-in-the-loop for financial decisions, rate limiting at 100 req/min, no code execution allowed
```

5. **Click "Start Vulnerability Scan"**

6. **Watch the progress bar** - You'll see:
   - ✓ Initializing security scanner
   - ✓ Searching for AI/LLM vulnerabilities
   - ✓ Analyzing threats with Gemini 2.5 Pro
   - ✓ Calculating AI-RQ risk score
   - ✓ Generating security report

7. **View results** - After 60-90 seconds, you'll see:
   - AI-RQ Score
   - Number of vulnerabilities found
   - Number of patches generated
   - Risk rating
   - Detailed vulnerability cards with exploit info

## 📹 Recording Tips

- **Use QuickTime or OBS** for screen recording
- **Resolution:** 1920x1080 or 1440p
- **Frame rate:** 30fps
- **Focus on:** The progress bar animation and final results
- **Narration ideas:**
  - "This form collects real security info based on OWASP standards"
  - "The scan uses Gemini 2.5 Pro to analyze actual vulnerabilities"
  - "Look at the real-time progress - it's synced with the Python scanner"
  - "Here are the actual CVEs and OWASP categories identified"

## 🎯 What Makes a Great Demo

1. **Show the beautiful form design** - Notion-style, numbered sections
2. **Highlight industry-standard questions** - OWASP references
3. **Show the progress bar** - Green checkmarks appearing in real-time
4. **Expand a vulnerability** - Show the detailed info and patch code
5. **Emphasize real data** - Not fake, actual CVEs and exploits

## 🐛 Troubleshooting

**Hydration error in console?**
- Ignore it - it's just browser extensions interfering, doesn't affect functionality

**Scan taking too long?**
- Normal! It takes 60-90 seconds to run the full Python scanner
- For quick demos, just show the form and progress bar starting

**API key errors?**
- Make sure `.env` file has `GEMINI_API_KEY` and `PERPLEXITY_API_KEY`
