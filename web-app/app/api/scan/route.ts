import { NextRequest, NextResponse } from "next/server";

const API_SERVER_URL = (process.env.API_SERVER_URL || "").replace(/\/$/, "");

if (!API_SERVER_URL) {
    throw new Error("API_SERVER_URL environment variable is required");
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { company, llmProvider, modelVersion, contextWindow, ragImplementation, vectorDb, deploymentEnv } = body;

        // Input validation
        if (!company || !llmProvider || !modelVersion || !contextWindow || !ragImplementation || !vectorDb || !deploymentEnv) {
            return NextResponse.json(
                { success: false, error: "All fields are required" },
                { status: 400 }
            );
        }

        // Validate string lengths to prevent abuse
        const maxLength = 5000;
        if ([company, llmProvider, modelVersion, contextWindow, ragImplementation, vectorDb, deploymentEnv]
            .some(field => typeof field !== 'string' || field.length > maxLength)) {
            return NextResponse.json(
                { success: false, error: "Invalid input: fields must be strings under 5000 characters" },
                { status: 400 }
            );
        }

        console.log(`Calling API: ${API_SERVER_URL}/api/scan`);

        // Simple synchronous call to FastAPI
        const response = await fetch(`${API_SERVER_URL}/api/scan`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                company,
                llmProvider,
                modelVersion,
                contextWindow,
                ragImplementation,
                vectorDb,
                deploymentEnv,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`API server returned ${response.status}: ${response.statusText}`);
        }

        // Get the JSON result
        const result = await response.json();
        console.log('Scan completed successfully');

        // Return the result
        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Scan error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// Disable static optimization for this route
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Allow up to 5 minutes for scan
