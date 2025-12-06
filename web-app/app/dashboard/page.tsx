"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DownloadReportButton } from "@/components/download-report-button";
import { Entropy } from "@/components/ui/entropy";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, AlertTriangle, CheckCircle, Code, ExternalLink, ChevronDown, ChevronUp, Play, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { ScanProgress } from "@/components/scan-progress";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";

interface ScanStep {
    id: string;
    label: string;
    status: "pending" | "running" | "complete";
}

export default function Dashboard() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState<any>(null);
    const [expandedVuln, setExpandedVuln] = useState<number | null>(null);
    const [api, setApi] = useState<CarouselApi>();
    const [currentStep, setCurrentStep] = useState(0);

    // Scan progress
    const [scanSteps, setScanSteps] = useState<ScanStep[]>([
        { id: "init", label: "Initializing security scanner", status: "pending" },
        { id: "search", label: "Searching for AI/LLM vulnerabilities", status: "pending" },
        { id: "analyze", label: "Analyzing threats with Gemini 2.5 Pro", status: "pending" },
        { id: "score", label: "Calculating AI-RQ risk score", status: "pending" },
        { id: "report", label: "Generating security report", status: "pending" },
    ]);

    // Form state with PREFILLS
    const [companyName, setCompanyName] = useState("Acme Corp AI Labs");
    const [llmProvider, setLlmProvider] = useState("OpenAI GPT-4 Turbo, Anthropic Claude 3.5 Sonnet");
    const [modelVersion, setModelVersion] = useState("PII, customer support history, product docs");
    const [contextWindow, setContextWindow] = useState("Resume uploads, email ingestion, web scraping");
    const [ragImplementation, setRagImplementation] = useState("Yes - Pinecone vector database with internal documentation and knowledge base");
    const [vectorDb, setVectorDb] = useState("Basic content filtering for PII, no formal validation pipeline currently");
    const [deploymentEnv, setDeploymentEnv] = useState("Rate limiting (100 req/min), NeMo Guardrails for basic prompt filtering, no function calling enabled");
    const [testCoverage, setTestCoverage] = useState("manual");

    // Check if all critical questions are answered
    const isFormValid = companyName && llmProvider && modelVersion && contextWindow && ragImplementation && vectorDb && deploymentEnv;

    useEffect(() => {
        const hasAccess = sessionStorage.getItem("accessGranted");
        if (!hasAccess) {
            router.push("/");
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    useEffect(() => {
        if (!api) {
            return;
        }

        setCurrentStep(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrentStep(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    const updateStepStatus = (stepId: string, status: "running" | "complete") => {
        setScanSteps(prev =>
            prev.map(step =>
                step.id === stepId ? { ...step, status } : step
            )
        );
    };

    const handleScan = async () => {
        setIsScanning(true);
        setScanResults(null);

        // Reset all steps to pending
        setScanSteps(prev => prev.map(step => ({ ...step, status: "pending" as const })));

        try {
            // 1. Run initial steps (Init -> Score)
            const initialSteps = ["init", "search", "analyze", "score"];
            for (const step of initialSteps) {
                updateStepStatus(step, "running");
                // Variable timing for realism (1s - 2s)
                const delay = Math.floor(Math.random() * 1000) + 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                updateStepStatus(step, "complete");
            }

            // 2. Start final step (Report) and keep it running
            updateStepStatus("report", "running");

            // 3. Make the actual API call (this can take 30s+)
            const response = await fetch("/api/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    company: companyName,
                    llmProvider,
                    modelVersion,
                    contextWindow,
                    ragImplementation,
                    vectorDb,
                    deploymentEnv,
                    testCoverage
                }),
            });

            if (!response.ok) {
                throw new Error(`Scan failed: ${response.statusText}`);
            }

            const result = await response.json();

            // 4. Complete the final step only AFTER we have data
            updateStepStatus("report", "complete");

            // Small delay to let the user see the "Complete" state before showing results
            await new Promise(resolve => setTimeout(resolve, 500));

            // Check if we got results
            if (result.success !== false && result.analysis && result.risk) {
                setScanResults(result);
            } else if (result.error) {
                throw new Error(result.error);
            } else {
                throw new Error("Invalid response from server");
            }

        } catch (error: any) {
            console.error("Scan failed:", error);
            alert(`Scan failed: ${error.message || "Unknown error"}`);
            // Mark current running step as failed or just stop
        } finally {
            setIsScanning(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case "critical": return "bg-red-500/10 text-red-400 border-red-500/30";
            case "high": return "bg-orange-500/10 text-orange-400 border-orange-500/30";
            case "medium": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
            case "low": return "bg-blue-500/10 text-blue-400 border-blue-500/30";
            default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
        }
    };

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
            <Header />

            <div className="flex-1 grid grid-cols-2 overflow-hidden">
                {/* Left Panel - Carousel Form */}
                <div className="border-r border-zinc-800 bg-zinc-950/50 flex flex-col relative">
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="w-full max-w-xl">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Configuration Wizard</h2>
                                    <p className="text-zinc-400">Step {currentStep} of 4</p>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((step) => (
                                        <div
                                            key={step}
                                            className={`h-1.5 w-8 rounded-full transition-all ${step === currentStep ? "bg-orange-500" : step < currentStep ? "bg-orange-900" : "bg-zinc-800"}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <Carousel setApi={setApi} className="w-full">
                                <CarouselContent>
                                    {/* Step 1: Basic Info */}
                                    <CarouselItem>
                                        <div className="space-y-8 border border-zinc-800 bg-black/50 p-10 rounded-xl backdrop-blur-sm">
                                            <div className="space-y-6">
                                                <div className="grid gap-3">
                                                    <Label htmlFor="company" className="text-base font-semibold text-zinc-400 uppercase tracking-wider">Organization Name</Label>
                                                    <Input
                                                        id="company"
                                                        value={companyName}
                                                        onChange={(e) => setCompanyName(e.target.value)}
                                                        className="bg-zinc-900 border-zinc-800 focus:border-orange-500 h-14 text-lg"
                                                    />
                                                </div>

                                                <div className="grid gap-3">
                                                    <Label htmlFor="llm" className="text-base font-semibold text-zinc-400 uppercase tracking-wider">LLM Provider</Label>
                                                    <Input
                                                        id="llm"
                                                        value={llmProvider}
                                                        onChange={(e) => setLlmProvider(e.target.value)}
                                                        maxLength={200}
                                                        className="bg-zinc-900 border-zinc-800 focus:border-orange-500 h-14 text-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CarouselItem>

                                    {/* Step 2: Data Risks */}
                                    <CarouselItem>
                                        <div className="space-y-8 border border-zinc-800 bg-black/50 p-10 rounded-xl backdrop-blur-sm">
                                            <div className="space-y-6">
                                                <div className="grid gap-3">
                                                    <Label htmlFor="model" className="text-base font-semibold text-zinc-400 uppercase tracking-wider">Sensitive Data Exposure</Label>
                                                    <Textarea
                                                        id="model"
                                                        value={modelVersion}
                                                        onChange={(e) => setModelVersion(e.target.value)}
                                                        maxLength={500}
                                                        className="bg-zinc-900 border-zinc-800 focus:border-orange-500 min-h-[160px] resize-none text-lg leading-relaxed"
                                                    />
                                                </div>

                                                <div className="grid gap-3">
                                                    <Label htmlFor="context" className="text-base font-semibold text-zinc-400 uppercase tracking-wider">External Content Injection</Label>
                                                    <Textarea
                                                        id="context"
                                                        value={contextWindow}
                                                        onChange={(e) => setContextWindow(e.target.value)}
                                                        maxLength={500}
                                                        className="bg-zinc-900 border-zinc-800 focus:border-orange-500 min-h-[160px] resize-none text-lg leading-relaxed"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CarouselItem>

                                    {/* Step 3: RAG */}
                                    <CarouselItem>
                                        <div className="space-y-8 border border-zinc-800 bg-black/50 p-10 rounded-xl backdrop-blur-sm">
                                            <div className="space-y-6">
                                                <div className="grid gap-3">
                                                    <Label htmlFor="rag" className="text-base font-semibold text-zinc-400 uppercase tracking-wider">RAG Implementation</Label>
                                                    <Input
                                                        id="rag"
                                                        value={ragImplementation}
                                                        onChange={(e) => setRagImplementation(e.target.value)}
                                                        maxLength={200}
                                                        className="bg-zinc-900 border-zinc-800 focus:border-orange-500 h-14 text-lg"
                                                    />
                                                </div>

                                                <div className="grid gap-3">
                                                    <Label htmlFor="vector" className="text-base font-semibold text-zinc-400 uppercase tracking-wider">Document Validation</Label>
                                                    <Textarea
                                                        id="vector"
                                                        value={vectorDb}
                                                        onChange={(e) => setVectorDb(e.target.value)}
                                                        maxLength={500}
                                                        className="bg-zinc-900 border-zinc-800 focus:border-orange-500 min-h-[160px] resize-none text-lg leading-relaxed"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CarouselItem>

                                    {/* Step 4: Security & Launch */}
                                    <CarouselItem>
                                        <div className="space-y-8 border border-zinc-800 bg-black/50 p-10 rounded-xl backdrop-blur-sm">
                                            <div className="space-y-6">
                                                <div className="grid gap-3">
                                                    <Label htmlFor="deploy" className="text-base font-semibold text-zinc-400 uppercase tracking-wider">Security Controls</Label>
                                                    <Textarea
                                                        id="deploy"
                                                        value={deploymentEnv}
                                                        onChange={(e) => setDeploymentEnv(e.target.value)}
                                                        maxLength={500}
                                                        className="bg-zinc-900 border-zinc-800 focus:border-orange-500 min-h-[140px] resize-none text-lg leading-relaxed"
                                                    />
                                                </div>

                                                <div className="grid gap-3 relative">
                                                    <Label htmlFor="test-coverage" className="text-base font-semibold text-zinc-400 uppercase tracking-wider">Test Coverage</Label>
                                                    <Select value={testCoverage} onValueChange={setTestCoverage}>
                                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:border-orange-500 h-14 w-full text-lg">
                                                            <SelectValue placeholder="Select coverage level" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white z-[100]">
                                                            <SelectItem value="manual" className="text-lg py-3">Manual Testing Only</SelectItem>
                                                            <SelectItem value="unit" className="text-lg py-3">Unit Tests</SelectItem>
                                                            <SelectItem value="integration" className="text-lg py-3">Integration Tests</SelectItem>
                                                            <SelectItem value="e2e" className="text-lg py-3">End-to-End Tests</SelectItem>
                                                            <SelectItem value="cicd" className="text-lg py-3">Full CI/CD Pipeline</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <Button
                                                    onClick={handleScan}
                                                    disabled={isScanning || !isFormValid}
                                                    className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold h-16 text-xl shadow-lg shadow-orange-500/20 mt-6"
                                                >
                                                    {isScanning ? (
                                                        <span className="flex items-center gap-3">
                                                            <Loader2 className="h-6 w-6 animate-spin" />
                                                            Running Analysis...
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-3">
                                                            <Play className="h-6 w-6" />
                                                            Start Assessment
                                                        </span>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                </CarouselContent>
                            </Carousel>

                            <div className="flex justify-between mt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => api?.scrollPrev()}
                                    disabled={currentStep === 1}
                                    className="border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => api?.scrollNext()}
                                    disabled={currentStep === 4}
                                    className="border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white"
                                >
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Scan Progress Overlay */}
                    {isScanning && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="w-full max-w-md p-6 bg-zinc-900 border border-orange-500/30 rounded-xl shadow-2xl shadow-orange-500/10">
                                <ScanProgress steps={scanSteps} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel - Results */}
                <div className="bg-black flex flex-col overflow-hidden relative">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                    <div className="flex-1 overflow-y-auto p-8 relative z-10">
                        {!scanResults ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4 opacity-50">
                                <Shield className="w-24 h-24 stroke-1" />
                                <div className="text-center">
                                    <h3 className="text-xl font-medium text-zinc-400">Ready to Scan</h3>
                                    <p className="text-sm mt-2">Configure the assessment parameters on the left<br />to generate a comprehensive security report.</p>
                                </div>
                            </div>
                        ) : (
                            <div id="scan-results-panel" className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white">Assessment Report</h2>
                                        <p className="text-zinc-400 mt-1">Generated on {new Date().toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-6 items-end">
                                        <DownloadReportButton targetId="scan-results-panel" />
                                        <div className="text-right">
                                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Risk Score</p>
                                            <p className="text-4xl font-bold text-orange-500">{scanResults.risk?.ai_rq_score || 0}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Vulnerabilities</p>
                                            <p className="text-4xl font-bold text-white">{scanResults.analysis?.vulnerabilities?.length || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <Card className="bg-zinc-900/50 border-orange-500/20">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-orange-400">Executive Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-zinc-300 leading-relaxed text-lg">
                                            {scanResults.analysis?.summary}
                                        </p>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-white">Detailed Findings</h3>
                                    {scanResults.analysis?.vulnerabilities?.map((vuln: any, idx: number) => (
                                        <Card key={idx} className="bg-zinc-900 border-zinc-800 hover:border-orange-500/30 transition-all group">
                                            <CardHeader className="cursor-pointer" onClick={() => setExpandedVuln(expandedVuln === idx ? null : idx)}>
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <Badge className={getSeverityColor(vuln.severity)}>
                                                                {vuln.severity}
                                                            </Badge>
                                                            <span className="font-semibold text-white text-lg group-hover:text-orange-400 transition-colors">{vuln.title}</span>
                                                        </div>
                                                    </div>
                                                    {expandedVuln === idx ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
                                                </div>
                                            </CardHeader>
                                            {expandedVuln === idx && (
                                                <CardContent className="pt-0 border-t border-zinc-800 mt-4">
                                                    <div className="pt-6 space-y-6">
                                                        <p className="text-base text-zinc-300 leading-relaxed">{vuln.description}</p>

                                                        {scanResults.analysis?.patches?.find((p: any) =>
                                                            p.vulnerability_id === vuln.id || p.title?.includes(vuln.title?.split(' ')[0])
                                                        ) && (
                                                                <div className="bg-black p-6 rounded-lg border border-zinc-800">
                                                                    <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                        <Code className="w-4 h-4" />
                                                                        Remediation Strategy
                                                                    </h4>
                                                                    {(() => {
                                                                        const patch = scanResults.analysis.patches.find((p: any) =>
                                                                            p.vulnerability_id === vuln.id || p.title?.includes(vuln.title?.split(' ')[0])
                                                                        );
                                                                        return (
                                                                            <div className="space-y-4">
                                                                                <p className="text-sm text-zinc-400">{patch.description}</p>
                                                                                {patch.code_example && (
                                                                                    <pre className="bg-zinc-900 p-4 rounded-lg text-sm overflow-x-auto font-mono text-green-400 border border-zinc-800">
                                                                                        {patch.code_example}
                                                                                    </pre>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            )}
                                                    </div>
                                                </CardContent>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
