import { test, expect } from '@playwright/test';

/**
 * Automated Demo Test for AI Vulnerability Scanner
 * 
 * This test fills out the entire security assessment form and runs a scan.
 * Perfect for recording demos!
 * 
 * To run:
 * 1. Make sure the dev server is running (npm run dev)
 * 2. Run: npx playwright test demo.spec.ts --headed --slowMo=500
 * 3. Or with video: npx playwright test demo.spec.ts --headed --slowMo=500 --video=on
 */

test('Complete Security Assessment Demo', async ({ page }) => {
    // Set a longer timeout for the full scan
    test.setTimeout(180000); // 3 minutes

    // Navigate to the app
    await page.goto('http://localhost:3000');

    // Enter access code
    await page.waitForSelector('input[placeholder*="access code"]', { timeout: 10000 });
    await page.fill('input[placeholder*="access code"]', 'DEMO');
    await page.click('button:has-text("Access Scanner")');

    // Wait for dashboard to load
    await page.waitForSelector('text=Security Assessment', { timeout: 10000 });

    // Fill out the form with realistic data
    console.log('Filling organization name...');
    await page.fill('input#company', 'TechCorp Inc');
    await page.waitForTimeout(300);

    console.log('Filling LLM provider...');
    await page.fill('input#llm', 'OpenAI GPT-4, Anthropic Claude 3.5 Sonnet');
    await page.waitForTimeout(300);

    console.log('Filling sensitive data types...');
    await page.fill('textarea#model', 'PII including customer names, emails, phone numbers. Financial transaction data. Proprietary ML training datasets.');
    await page.waitForTimeout(300);

    console.log('Filling external content injection info...');
    await page.fill('textarea#context', 'Yes - users can upload resumes for analysis, paste URLs for content scraping, and submit support tickets via email');
    await page.waitForTimeout(300);

    console.log('Filling RAG implementation...');
    await page.fill('input#rag', 'Yes - Pinecone vector database with internal documentation and knowledge base');
    await page.waitForTimeout(300);

    console.log('Filling RAG validation...');
    await page.fill('textarea#vector', 'Content filtering for PII via Presidio, access control checks, metadata verification');
    await page.waitForTimeout(300);

    console.log('Filling security controls...');
    await page.fill('textarea#deploy', 'NeMo Guardrails for prompt filtering, human-in-the-loop for financial decisions, rate limiting at 100 req/min, no code execution allowed');
    await page.waitForTimeout(500);

    // Scroll to the submit button
    await page.locator('button:has-text("Start Vulnerability Scan")').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Take a screenshot of the completed form
    await page.screenshot({ path: 'demo-form-filled.png', fullPage: true });
    console.log('Screenshot saved: demo-form-filled.png');

    // Click the scan button
    console.log('Starting vulnerability scan...');
    await page.click('button:has-text("Start Vulnerability Scan")');

    // Wait for progress bar to appear
    await page.waitForSelector('text=Initializing security scanner', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Take screenshot of progress
    await page.screenshot({ path: 'demo-scan-progress.png', fullPage: true });
    console.log('Screenshot saved: demo-scan-progress.png');

    // Wait for scan to complete (look for results)
    // This will take 60-90 seconds
    console.log('Waiting for scan to complete... (this takes 60-90 seconds)');

    try {
        // Wait for either results or error
        await page.waitForSelector('text=Identified Attack Vectors', { timeout: 120000 });

        // Scroll to results
        await page.locator('text=Identified Attack Vectors').scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);

        // Take screenshot of results
        await page.screenshot({ path: 'demo-scan-results.png', fullPage: true });
        console.log('Screenshot saved: demo-scan-results.png');

        console.log('✅ Demo completed successfully!');
    } catch (error) {
        console.log('⚠️  Scan did not complete in time or encountered an error');
        await page.screenshot({ path: 'demo-error.png', fullPage: true });
    }
});

test('Quick Form Fill Only (No Scan)', async ({ page }) => {
    // For quick demos without waiting for scan
    test.setTimeout(30000);

    await page.goto('http://localhost:3000');

    await page.fill('input[placeholder*="access code"]', 'DEMO');
    await page.click('button:has-text("Access Scanner")');

    await page.waitForSelector('text=Security Assessment', { timeout: 10000 });

    await page.fill('input#company', 'TechCorp Inc');
    await page.fill('input#llm', 'OpenAI GPT-4, Anthropic Claude 3.5 Sonnet');
    await page.fill('textarea#model', 'PII including customer names, emails, SSNs, financial records');
    await page.fill('textarea#context', 'Yes - resume uploads, URL scraping, email ingestion');
    await page.fill('input#rag', 'Yes - Pinecone + internal docs');
    await page.fill('textarea#vector', 'PII filtering, access controls, metadata checks');
    await page.fill('textarea#deploy', 'NeMo Guardrails, HITL for critical actions, rate limiting');

    await page.locator('button:has-text("Start Vulnerability Scan")').scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'demo-ready-to-scan.png', fullPage: true });

    console.log('✅ Form filled! Screenshot saved: demo-ready-to-scan.png');
});
