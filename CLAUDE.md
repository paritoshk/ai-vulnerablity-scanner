# Claude Code Configuration for AI Vulnerability Scanner

## Project Overview

This is a monorepo containing:
- **Backend**: Python-based AI vulnerability scanner using Gemini Pro 3 and Parallel Web Systems API
- **Frontend**: Next.js web application for scanning and visualization

## Architecture

```
ai-vulnerablity-scanner/
├── src/               # Python backend core logic
├── config/            # Configuration files
├── main.py            # CLI entry point
├── web-app/           # Next.js frontend
│   ├── app/           # App Router pages
│   ├── components/    # React components
│   └── lib/           # Utilities
```

## Code Review Priorities

### Security (CRITICAL)
1. **Never commit secrets**: Check for API keys, tokens, credentials in code
2. **Environment variables**: All secrets must be in `.env` (gitignored) or GitHub Secrets
3. **Input validation**: Validate all user inputs, especially in API routes
4. **API security**:
   - Rate limiting on `/api/scan`
   - Input sanitization (prevent XSS, injection attacks)
   - CSRF protection for POST endpoints
5. **Subprocess execution**: Flag any use of `spawn()`, `exec()` with user input

### Code Quality Standards

#### Python Backend
- **Style**: PEP 8 compliant
- **Type hints**: Use type annotations for function signatures
- **Error handling**:
  - Always validate API responses
  - Log errors with context (use `src/logger.py`)
  - Graceful degradation (e.g., model fallbacks)
- **Documentation**: Docstrings for all public functions
- **Testing**: Unit tests for scoring, analysis, report generation

#### TypeScript Frontend
- **Style**: Consistent TypeScript, avoid `any` types
- **Component structure**:
  - Keep components under 200 lines
  - Extract reusable logic into hooks
  - Use server components where possible
- **State management**: Minimize client-side state
- **Error boundaries**: Wrap async operations in try-catch
- **Accessibility**: All UI components must be keyboard navigable

### Integration Patterns

#### Current Issue: Subprocess Integration
The current implementation spawns Python as a subprocess from Next.js API routes. This is **NOT production-ready**:

```typescript
// ⚠️ PROBLEMATIC PATTERN
spawn("uv", ["run", "python3", "../main.py"])
```

**Preferred pattern**: HTTP API (FastAPI/Flask)

#### Environment Variables
- Backend: `GEMINI_API_KEY`, `PARALLEL_API_KEY`
- Frontend: Should NOT have direct API key access
- Web: `VERCEL_*` tokens must be in `.env.local` (gitignored)

### Performance Considerations
1. **Async operations**: Use `async/await` consistently
2. **Database queries**: N/A (file-based outputs currently)
3. **API calls**:
   - Implement timeouts (30s for Gemini, 10s for Parallel)
   - Retry logic with exponential backoff
4. **Bundle size**: Monitor Next.js bundle, lazy load heavy components

### Testing Requirements
- **Backend**: Pytest for unit tests (scoring, schemas)
- **Frontend**: Playwright E2E tests for critical flows
- **API routes**: Test error cases (invalid input, missing API keys)

### Documentation Standards
- Update README.md when adding features
- Add JSDoc for complex functions
- Keep DEMO_GUIDE.md current with workflow changes

### Dependencies
- **Backend**: Minimal dependencies (httpx, litellm, pydantic)
- **Frontend**: Avoid unnecessary packages, justify new additions
- **Security**: Run `npm audit` / `pip-audit` before merging

## Review Checklist

When reviewing PRs, verify:

- [ ] No API keys, secrets, or tokens in code
- [ ] `.env.local` and `.env` are gitignored
- [ ] Input validation on all API endpoints
- [ ] Error handling with proper logging
- [ ] Type safety (Python type hints, TypeScript types)
- [ ] Component size (split if >200 lines)
- [ ] Accessibility (semantic HTML, ARIA labels)
- [ ] Performance (no N+1 queries, optimize renders)
- [ ] Tests added/updated for new features
- [ ] Documentation updated

## Common Issues to Flag

1. **Hardcoded values**: Magic numbers, URLs, API endpoints
2. **Missing error handling**: Unprotected `fetch()`, `subprocess` calls
3. **Large files**: Components >200 lines, modules >500 lines
4. **Dead code**: Unused imports, commented code blocks
5. **Inconsistent naming**: Follow camelCase (TS) and snake_case (Python)
6. **Missing PropTypes**: All React components need type definitions
7. **Unhandled promises**: Always await or catch async operations

## Integration-Specific Guidance

### Frontend → Backend Communication
Current pattern uses subprocess spawning. When reviewing:
- Suggest migration to HTTP API (FastAPI)
- Flag any file I/O for passing data between processes
- Check for proper error propagation

### AI/LLM Usage
- Validate structured outputs match Pydantic schemas
- Check for model fallback logic (Gemini 2.5 → 2.0)
- Ensure API rate limits are respected

### Report Generation
- JSON output must match `src/schemas.py` models
- Markdown reports should be human-readable
- File permissions for `outputs/` directory

## Response Format Preferences

When commenting on PRs:
1. **Be specific**: Reference file paths and line numbers
2. **Explain impact**: Why is this an issue? (security, performance, etc.)
3. **Suggest fixes**: Provide code snippets when possible
4. **Prioritize**: Mark issues as CRITICAL, HIGH, MEDIUM, or LOW
5. **Be constructive**: Acknowledge good patterns too

## Example Review Comment Format

```
**[CRITICAL - Security]** API Key Exposure
File: `web-app/app/api/scan/route.ts:15`

Issue: API key hardcoded in source
Impact: Anyone with repo access can extract production credentials

Suggested fix:
- Move to environment variable
- Add validation in config loading
- Rotate the exposed key immediately
```
