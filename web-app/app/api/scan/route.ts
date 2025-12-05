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

        // Create a readable stream for SSE
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Log which API we're calling
                    console.log(`Calling API: ${API_SERVER_URL}/api/scan`);

                    // Call FastAPI server
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

                    if (!response.body) {
                        throw new Error("API server did not return a readable stream");
                    }

                    // Stream the response from FastAPI to the client
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let chunkCount = 0;

                    while (true) {
                        const { done, value } = await reader.read();

                        if (done) {
                            console.log(`Stream completed after ${chunkCount} chunks`);
                            controller.close();
                            break;
                        }

                        // Decode and forward the SSE data
                        const chunk = decoder.decode(value, { stream: true });
                        chunkCount++;

                        // Log to see if we're receiving the final result
                        if (chunk.includes('"step":"done"')) {
                            console.log('Received final "done" event from API');
                        }

                        controller.enqueue(encoder.encode(chunk));
                    }
                } catch (error: any) {
                    console.error("Scan error:", error);

                    // Send error to client
                    const errorMessage = error.message || "Unknown error occurred";
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({
                            step: "error",
                            status: "error",
                            error: errorMessage
                        })}\n\n`)
                    );
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no", // Disable nginx buffering
            },
        });
    } catch (error: any) {
        console.error("Fatal error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// Disable static optimization for this route
export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Allow up to 120 seconds for scan
