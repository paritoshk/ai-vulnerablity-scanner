import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

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
                const sendUpdate = (step: string, status: string) => {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ step, status })}\n\n`)
                    );
                };

                try {
                    // Step 1: Initializing
                    sendUpdate("init", "running");
                    await new Promise(resolve => setTimeout(resolve, 500));
                    sendUpdate("init", "complete");

                    // Step 2: Searching vulnerabilities
                    sendUpdate("search", "running");

                    // Path to the Python scanner
                    const scannerPath = path.join(process.cwd(), "..", "main.py");
                    const pythonProcess = spawn("uv", ["run", "python3", scannerPath], {
                        cwd: path.join(process.cwd(), ".."),
                    });

                    let output = "";
                    let error = "";

                    pythonProcess.stdout.on("data", (data) => {
                        output += data.toString();
                        const text = data.toString();

                        // Track progress based on Python output
                        if (text.includes("Searching")) {
                            sendUpdate("search", "running");
                        } else if (text.includes("Found") && text.includes("results")) {
                            sendUpdate("search", "complete");
                            sendUpdate("analyze", "running");
                        } else if (text.includes("Analyzing")) {
                            sendUpdate("analyze", "running");
                        } else if (text.includes("Analysis complete")) {
                            sendUpdate("analyze", "complete");
                            sendUpdate("score", "running");
                        } else if (text.includes("AI-RQ")) {
                            sendUpdate("score", "complete");
                            sendUpdate("report", "running");
                        }
                    });

                    pythonProcess.stderr.on("data", (data) => {
                        error += data.toString();
                    });

                    // Wait for process to complete
                    await new Promise((resolve, reject) => {
                        pythonProcess.on("close", (code) => {
                            if (code === 0) {
                                resolve(output);
                            } else {
                                reject(new Error(error || "Scanner failed"));
                            }
                        });
                    });

                    sendUpdate("report", "complete");

                    // Read the generated output files
                    const fs = require("fs").promises;
                    const outputPath = path.join(process.cwd(), "..", "outputs", "vuln_analysis.json");

                    const fileContent = await fs.readFile(outputPath, "utf8");
                    const analysisData = JSON.parse(fileContent);

                    // Send final result
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({
                            step: "done",
                            status: "complete",
                            result: {
                                success: true,
                                company,
                                llmProvider,
                                modelVersion,
                                contextWindow,
                                ragImplementation,
                                vectorDb,
                                deploymentEnv,
                                analysis: analysisData.analysis,
                                risk: analysisData.risk,
                            }
                        })}\n\n`)
                    );

                    controller.close();
                } catch (error: any) {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({
                            step: "error",
                            status: "error",
                            error: error.message
                        })}\n\n`)
                    );
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error: any) {
        console.error("Scan error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
