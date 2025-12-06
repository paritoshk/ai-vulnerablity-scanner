# AI Vulnerability Scanner - API Server

This document describes the FastAPI backend server for the AI Vulnerability Scanner.

## Architecture Overview

The scanner now uses a **client-server architecture**:

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

### Benefits Over Subprocess Integration

- ✅ **Persistent Process**: Server stays running, no spawn overhead
- ✅ **Proper Error Handling**: HTTP status codes and structured JSON errors
- ✅ **Rate Limiting**: Built-in protection against abuse
- ✅ **Easy to Scale**: Can deploy server independently
- ✅ **Better Security**: CORS configuration, request validation
- ✅ **Easy to Test**: Standard HTTP endpoints

## Running Locally

### Prerequisites

- Python 3.10+
- `uv` package manager (or `pip`)
- Environment variables configured

### Start the Server

From the project root:

```bash
# Option 1: Using uvicorn directly
cd api-server
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Option 2: Using the main.py script
cd api-server
uv run python main.py
```

The server will start on `http://localhost:8000`

### Environment Variables

Create `api-server/.env` from the template:

```bash
cp api-server/.env.example api-server/.env
```

Required variables:
- `GEMINI_API_KEY`: Your Google Gemini API key

Optional variables:
- `HOST`: Server host (default: `0.0.0.0`)
- `PORT`: Server port (default: `8000`)
- `CORS_ORIGINS`: Allowed CORS origins (comma-separated)
- `RATE_LIMIT`: Rate limit per IP (default: `10/minute`)

## API Endpoints

### Health Check

```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "ai-vulnerability-scanner",
  "version": "1.0.0"
}
```

### Scan for Vulnerabilities

```http
POST /api/scan
```

Request body:
```json
{
  "company": "Example Corp",
  "llmProvider": "OpenAI",
  "modelVersion": "GPT-4",
  "contextWindow": "128k",
  "ragImplementation": "LangChain",
  "vectorDb": "Pinecone",
  "deploymentEnv": "Production"
}
```

Response: **Server-Sent Events (SSE)** stream

The endpoint streams progress updates in real-time:

```
data: {"step": "init", "status": "running"}

data: {"step": "init", "status": "complete"}

data: {"step": "search", "status": "running"}

data: {"step": "search", "status": "complete"}

data: {"step": "analyze", "status": "running"}

data: {"step": "analyze", "status": "complete"}

data: {"step": "score", "status": "running"}

data: {"step": "score", "status": "complete"}

data: {"step": "report", "status": "running"}

data: {"step": "report", "status": "complete"}

data: {
  "step": "done",
  "status": "complete",
  "result": {
    "success": true,
    "company": "Example Corp",
    "analysis": { ... },
    "risk": {
      "ai_rq_score": 750,
      "rating": "A",
      "investment_grade": true,
      "vuln_count": 3
    }
  }
}
```

Error response:
```
data: {
  "step": "error",
  "status": "error",
  "error": "Error message here"
}
```

### Interactive API Documentation

FastAPI provides automatic interactive documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Rate Limiting

The `/api/scan` endpoint is rate-limited to **10 requests per minute per IP address**.

Exceeding the rate limit returns:
```json
{
  "error": "Rate limit exceeded: 10 per 1 minute"
}
```

## CORS Configuration

The server allows requests from:
- `http://localhost:3000` (local development)
- `http://127.0.0.1:3000` (local development)
- `https://*.vercel.app` (Vercel deployments)

Add additional origins in the `CORS_ORIGINS` environment variable.

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Full scan (will stream SSE)
curl -X POST http://localhost:8000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "company": "TestCorp",
    "llmProvider": "OpenAI",
    "modelVersion": "GPT-4",
    "contextWindow": "128k",
    "ragImplementation": "LangChain",
    "vectorDb": "Pinecone",
    "deploymentEnv": "Production"
  }'
```

### Using Python

```python
import requests
import json

# Send scan request
response = requests.post(
    "http://localhost:8000/api/scan",
    json={
        "company": "TestCorp",
        "llmProvider": "OpenAI",
        "modelVersion": "GPT-4",
        "contextWindow": "128k",
        "ragImplementation": "LangChain",
        "vectorDb": "Pinecone",
        "deploymentEnv": "Production"
    },
    stream=True
)

# Process SSE stream
for line in response.iter_lines():
    if line:
        line_str = line.decode('utf-8')
        if line_str.startswith('data: '):
            data = json.loads(line_str[6:])
            print(f"Step: {data.get('step')}, Status: {data.get('status')}")
            
            if data.get('step') == 'done':
                print(f"AI-RQ Score: {data['result']['risk']['ai_rq_score']}")
```

## Deployment

### Deploy FastAPI Backend to Railway

**Step 1: Prepare Your Code**

Ensure your code is pushed to GitHub on the branch you want to deploy (e.g., `feat/fastapi-production-ready`).

**Step 2: Create Railway Project**

1. Sign up at https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `your-username/ai-vulnerablity-scanner`
5. Select the branch (e.g., `feat/fastapi-production-ready`)

**Step 3: Configure Service**

1. After the service is created, go to **Settings** tab
2. Under **Source**:
   - Set **Root Directory** to: `api-server`
   - Save changes
3. Under **Build**:
   - Railway will automatically detect the `Dockerfile`
   - No changes needed

**Step 4: Add Environment Variables**

1. Go to **Variables** tab
2. Click **"New Variable"**
3. Add the following:
   - `GEMINI_API_KEY` = `your_gemini_api_key`
   - `PARALLEL_API_KEY` = `your_parallel_api_key`

**Step 5: Generate Public URL**

1. Go to **Settings** tab
2. Scroll to **Networking** section
3. Click **"Generate Domain"**
4. Copy the generated URL (e.g., `https://your-app-production.up.railway.app`)

**Step 6: Verify Deployment**

Test your deployment:
```bash
curl https://your-railway-url.up.railway.app/health
```

Expected response:
```json
{"status":"healthy","service":"ai-vulnerability-scanner","version":"1.0.0"}
```

### Deploy Next.js Frontend to Vercel

**Step 1: Configure Environment Variable**

Add the Railway URL to Vercel:

```bash
cd web-app

# For preview deployments:
vercel env add API_SERVER_URL preview
# Enter: https://your-railway-url.up.railway.app

# For production:
vercel env add API_SERVER_URL production
# Enter: https://your-railway-url.up.railway.app
```

**Step 2: Deploy Preview**

```bash
vercel
```

This creates a preview deployment you can test.

**Step 3: Deploy to Production**

Once preview is tested and working:
```bash
vercel --prod
```

### Verify Full Integration

1. Open your Vercel preview URL
2. Fill out the scan form
3. Click "Start Scan"
4. Verify:
   - Progress bar updates in real-time
   - Scan completes successfully
   - Results are displayed

---

### Example: Railway Deployment

1. **Deploy the FastAPI server** to your platform of choice:
   - Railway
   - Render
   - Google Cloud Run
   - AWS Lambda (with Mangum adapter)
   - Any VPS with Python support

2. **Update environment variables**:
   - Set `GEMINI_API_KEY` in your platform
   - Configure `CORS_ORIGINS` to include your Next.js deployment URL

3. **Update Next.js environment**:
   - In Vercel, add `API_SERVER_URL` pointing to your deployed FastAPI server

### Example: Deploying to Railway

```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Initialize project
cd api-server
railway init

# Set environment variables
railway variables set GEMINI_API_KEY=your_key_here

# Deploy
railway up
```

## Troubleshooting

### Server won't start

Check that:
- Port 8000 is not already in use
- `GEMINI_API_KEY` is set in `.env`
- All dependencies are installed (`uv sync`)

### CORS errors in browser

- Verify the Next.js URL is in `CORS_ORIGINS`
- Check browser console for exact error
- Ensure server is running on the expected URL

### SSE connection fails

- Check that `API_SERVER_URL` in Next.js matches the running server
- Verify firewall/network allows connections on port 8000
- Try accessing the API directly with curl

## Development

### Project Structure

```
api-server/
├── main.py           # FastAPI app initialization
├── models.py         # Pydantic request/response models
├── routers/
│   ├── __init__.py
│   └── scan.py       # Scan endpoint implementation
├── .env              # Environment variables (gitignored)
└── .env.example      # Environment template
```

### Adding New Endpoints

1. Create a new router in `routers/`
2. Import and include in `main.py`:
   ```python
   from routers import my_router
   app.include_router(my_router.router, prefix="/api", tags=["my_tag"])
   ```

### Logging

Logs are written to stdout with the format:
```
2024-12-04 10:00:00 - name - LEVEL - message
```

View logs in your deployment platform or with:
```bash
# Local development
tail -f logs/api-server.log
```

## Next Steps

See `implementation_plan.md` for:
- Phase 3: Docker & Production Hardening
- Code quality improvements
- CI/CD pipeline
