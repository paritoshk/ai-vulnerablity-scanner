"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Code, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { ScanProgress } from "@/components/scan-progress";

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

    // Scan progress
    const [scanSteps, setScanSteps] = useState<ScanStep[]>([
        { id: "init", label: "Initializing security scanner", status: "pending" },
        { id: "search", label: "Searching for AI/LLM vulnerabilities", status: "pending" },
        { id: "analyze", label: "Analyzing threats with Gemini 2.5 Pro", status: "pending" },
        { id: "score", label: "Calculating AI-RQ risk score", status: "pending" },
        { id: "report", label: "Generating security report", status: "pending" },
    ]);

    // Form state
    const [companyName, setCompanyName] = useState("");
    const [llmProvider, setLlmProvider] = useState("");
    const [modelVersion, setModelVersion] = useState("");
    const [contextWindow, setContextWindow] = useState("");
    const [ragImplementation, setRagImplementation] = useState("");
    const [vectorDb, setVectorDb] = useState("");
    const [deploymentEnv, setDeploymentEnv] = useState("");

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

    const updateStepStatus = (stepId: string, status: "running" | "complete") => {
        setScanSteps(prev =>
            prev.map(step =>
                step.id === stepId ? { ...step, status } : step
            )
        );
    };

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsScanning(true);
        setScanResults(null);

        // Reset all steps to pending
        setScanSteps(prev => prev.map(step => ({ ...step, status: "pending" as const })));

        try {
            // Simulate progress updates
            const simulateProgress = async () => {
                const steps = ["init", "search", "analyze", "score", "report"];
                for (const step of steps) {
                    updateStepStatus(step, "running");
                    await new Promise(resolve => setTimeout(resolve, 500));
                    updateStepStatus(step, "complete");
                }
            };

            // Start progress simulation
            const progressPromise = simulateProgress();

            // Make the actual API call
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
                }),
            });

            if (!response.ok) {
                throw new Error(`Scan failed: ${response.statusText}`);
            }

            const result = await response.json();

            // Wait for progress animation to finish
            await progressPromise;

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
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-zinc-500">Verifying access...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white py-8">
            {/* Header */}
            <div className="max-w-5xl mx-auto px-6 mb-12">
                <div className="flex flex-col items-center text-center gap-6">
                    {/* Logo */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30 glow-orange">
                        <Shield className="w-11 h-11 text-black" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold gradient-text">AI Security Assessment</h1>
                        <p className="text-zinc-400 text-lg">Adversarial Robustness Evaluation</p>
                    </div>

                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-1">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Authorized
                    </Badge>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-8 space-y-16">
                {/* Company Intake Form */}
                <Card className="bg-zinc-900/50 border-zinc-700/50 backdrop-blur-xl glow-orange">
                    <CardHeader className="space-y-6 pb-10 pt-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                                <Shield className="w-7 h-7 text-black" />
                            </div>
                            <div>
                                <CardTitle className="text-3xl font-bold tracking-tight text-white">
                                    Security Assessment
                                </CardTitle>
                                <p className="text-orange-400 font-medium mt-1">Enterprise AI Risk Profiling</p>
                            </div>
                        </div>
                        <CardDescription className="text-base leading-relaxed text-zinc-400 max-w-3xl">
                            Threat intelligence based on <span className="text-orange-400 font-medium">OWASP LLM Top 10</span>, <span className="text-orange-400 font-medium">NIST AI RMF</span>, and analysis of recent real-world exploits including AI-orchestrated cyber espionage campaigns.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-10">
                        <form onSubmit={handleScan} className="space-y-10">
                            {/* Organization & Model */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <span className="text-orange-400 font-bold text-sm">1</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="company" className="text-base font-medium text-zinc-300">
                                        Organization Name
                                    </Label>
                                    <Input
                                        id="company"
                                        placeholder="Your company name"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="bg-black/50 border-zinc-700 h-12 text-base focus:border-orange-500 focus:ring-orange-500/20 transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="llm" className="text-base font-medium text-zinc-300">
                                        Primary LLM Provider(s) in Production
                                    </Label>
                                    <Input
                                        id="llm"
                                        placeholder="e.g., OpenAI GPT-4, Anthropic Claude 3.5 Sonnet, Google Gemini"
                                        value={llmProvider}
                                        onChange={(e) => setLlmProvider(e.target.value)}
                                        className="bg-black/50 border-zinc-700 h-12 text-base focus:border-orange-500 focus:ring-orange-500/20 transition-all"
                                        required
                                    />
                                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                                        Include all models with production access
                                    </p>
                                </div>
                            </div>

                            {/* Data & Content Risks */}
                            <div className="space-y-6 pt-2">
                                <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <span className="text-orange-400 font-bold text-sm">2</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Data & Content Exposure</h3>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="model" className="text-base font-medium text-zinc-300">
                                        What types of sensitive data does your LLM process?
                                    </Label>
                                    <Textarea
                                        id="model"
                                        placeholder="e.g., PII (names, emails, SSNs), proprietary code, trade secrets, HIPAA/PHI data, financial records, customer conversations"
                                        value={modelVersion}
                                        onChange={(e) => setModelVersion(e.target.value)}
                                        className="bg-black/50 border-zinc-700 min-h-28 text-base focus:border-orange-500 focus:ring-orange-500/20 transition-all resize-none"
                                        required
                                    />
                                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-orange-500"></span>
                                        Assesses risks of sensitive information disclosure (OWASP LLM02)
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="context" className="text-base font-medium text-zinc-300">
                                        Are users able to inject external content into prompts?
                                    </Label>
                                    <Textarea
                                        id="context"
                                        placeholder="e.g., Resume upload for analysis, customer support emails, website content scraping, PDF document processing, user-provided URLs"
                                        value={contextWindow}
                                        onChange={(e) => setContextWindow(e.target.value)}
                                        className="bg-black/50 border-zinc-700 min-h-28 text-base focus:border-orange-500 focus:ring-orange-500/20 transition-all resize-none"
                                        required
                                    />
                                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-orange-500"></span>
                                        Critical for identifying prompt injection attack surface (OWASP LLM01)
                                    </p>
                                </div>
                            </div>

                            {/* RAG & Retrieval */}
                            <div className="space-y-6 pt-2">
                                <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <span className="text-orange-400 font-bold text-sm">3</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Retrieval-Augmented Generation</h3>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="rag" className="text-base font-medium text-zinc-300">
                                        Do you use RAG or connect the LLM to external knowledge bases?
                                    </Label>
                                    <Input
                                        id="rag"
                                        placeholder="e.g., Yes - Pinecone + internal docs, No RAG, LangChain with company wiki"
                                        value={ragImplementation}
                                        onChange={(e) => setRagImplementation(e.target.value)}
                                        className="bg-black/50 border-zinc-700 h-12 text-base focus:border-orange-500 focus:ring-orange-500/20 transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="vector" className="text-base font-medium text-zinc-300">
                                        How do you validate retrieved documents before LLM consumption?
                                    </Label>
                                    <Textarea
                                        id="vector"
                                        placeholder="e.g., No validation, Content filtering for PII, Access control checks, Metadata verification, None currently"
                                        value={vectorDb}
                                        onChange={(e) => setVectorDb(e.target.value)}
                                        className="bg-black/50 border-zinc-700 min-h-24 text-base focus:border-orange-500 focus:ring-orange-500/20 transition-all resize-none"
                                        required
                                    />
                                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-orange-500"></span>
                                        Addresses training data poisoning and RAG pipeline security
                                    </p>
                                </div>
                            </div>

                            {/* Output Handling & Guardrails */}
                            <div className="space-y-6 pt-2">
                                <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <span className="text-orange-400 font-bold text-sm">4</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Output Handling & Security Controls</h3>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="deploy" className="text-base font-medium text-zinc-300">
                                        What controls prevent the LLM from executing harmful actions?
                                    </Label>
                                    <Textarea
                                        id="deploy"
                                        placeholder="e.g., NeMo Guardrails for prompt filtering, human-in-the-loop for critical actions, rate limiting, no tool/function calling enabled, LLM cannot execute code"
                                        value={deploymentEnv}
                                        onChange={(e) => setDeploymentEnv(e.target.value)}
                                        className="bg-black/50 border-zinc-700 min-h-28 text-base focus:border-orange-500 focus:ring-orange-500/20 transition-all resize-none"
                                        required
                                    />
                                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-orange-500"></span>
                                        Mitigates excessive agency (OWASP LLM06) and insecure output handling (OWASP LLM05)
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-bold h-14 text-base shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                    disabled={isScanning || !isFormValid}
                                >
                                    {isScanning ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                                            Running Security Analysis...
                                        </span>
                                    ) : (
                                        "Start Vulnerability Scan"
                                    )}
                                </Button>

                                {!isFormValid && (
                                    <p className="text-sm text-zinc-500 text-center mt-4 flex items-center justify-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Please answer all questions to enable scan
                                    </p>
                                )}
                            </div>
                        </form>

                        {/* Scan Progress */}
                        {isScanning && (
                            <div className="mt-8">
                                <ScanProgress steps={scanSteps} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results Section */}
                {scanResults && (
                    <>
                        {/* Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm text-zinc-500">AI-RQ Score</p>
                                        <div className="group relative">
                                            <AlertTriangle className="w-3.5 h-3.5 text-orange-400 cursor-help" />
                                            <div className="absolute left-0 top-6 w-64 bg-zinc-950 border border-orange-500/30 rounded-lg p-3 text-xs text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                <p className="font-semibold text-orange-400 mb-1">AI Risk Quotient</p>
                                                <p className="leading-relaxed">
                                                    Calculated from: vulnerability severity (40%), exploitability (30%), affected systems (20%), and patch availability (10%).
                                                    Range: 0-1000 (lower is better).
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-orange-500 mt-1">
                                        {scanResults.risk?.ai_rq_score || 0}
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-1">/ 1000</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-zinc-500">Vulnerabilities</p>
                                    <p className="text-3xl font-bold text-red-400 mt-1">
                                        {scanResults.analysis?.vulnerabilities?.length || 0}
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-1">identified</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-zinc-500">Patches</p>
                                    <p className="text-3xl font-bold text-green-400 mt-1">
                                        {scanResults.analysis?.patches?.length || 0}
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-1">generated</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-zinc-500">Rating</p>
                                    <p className="text-3xl font-bold mt-1">
                                        {scanResults.risk?.rating || "N/A"}
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-1">Security Grade</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Threat Intelligence Summary */}
                        <Card className="bg-zinc-900 border-orange-500/30">
                            <CardHeader>
                                <CardTitle className="text-lg">Threat Intelligence Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-zinc-300 leading-relaxed">
                                    {scanResults.analysis?.summary}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Vulnerability Cards */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Identified Attack Vectors</h2>
                            {scanResults.analysis?.vulnerabilities?.map((vuln: any, idx: number) => (
                                <Card key={idx} className="bg-zinc-900 border-zinc-800 hover:border-orange-500/30 transition-all">
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className={getSeverityColor(vuln.severity)}>
                                                        {vuln.severity?.toUpperCase()}
                                                    </Badge>
                                                    {vuln.cve && (
                                                        <Badge className="bg-zinc-800 text-zinc-300">
                                                            {vuln.cve}
                                                        </Badge>
                                                    )}
                                                    {vuln.exploitability_score && (
                                                        <Badge className="bg-zinc-800 text-orange-400">
                                                            Exploit: {vuln.exploitability_score}/10
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardTitle className="text-xl">{vuln.title}</CardTitle>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setExpandedVuln(expandedVuln === idx ? null : idx)}
                                                className="text-zinc-400"
                                            >
                                                {expandedVuln === idx ? <ChevronUp /> : <ChevronDown />}
                                            </Button>
                                        </div>

                                        <CardDescription className="mt-2">
                                            <div className="flex flex-wrap gap-2 text-xs">
                                                {vuln.owasp_category && (
                                                    <span className="text-orange-400">OWASP: {vuln.owasp_category}</span>
                                                )}
                                                {vuln.mitre_technique && (
                                                    <span className="text-blue-400">• MITRE: {vuln.mitre_technique}</span>
                                                )}
                                            </div>
                                        </CardDescription>
                                    </CardHeader>

                                    {expandedVuln === idx && (
                                        <CardContent className="space-y-4 border-t border-zinc-800 pt-4">
                                            <div>
                                                <h4 className="text-sm font-semibold text-zinc-400 mb-2">Technical Description</h4>
                                                <p className="text-sm text-zinc-300 leading-relaxed">{vuln.description}</p>
                                            </div>

                                            {vuln.affected_systems && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-zinc-400 mb-2">Affected Systems</h4>
                                                    <p className="text-sm text-zinc-300">{vuln.affected_systems}</p>
                                                </div>
                                            )}

                                            {vuln.source_url && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-zinc-400 mb-2">Reference</h4>
                                                    <a
                                                        href={vuln.source_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1"
                                                    >
                                                        {vuln.source_url} <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            )}

                                            {/* Show associated patch */}
                                            {scanResults.analysis?.patches?.find((p: any) =>
                                                p.vulnerability_id === vuln.id || p.title?.includes(vuln.title?.split(' ')[0])
                                            ) && (
                                                    <div className="bg-black p-4 rounded-lg border border-green-500/30">
                                                        <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                                                            <Code className="w-4 h-4" />
                                                            Recommended Mitigation
                                                        </h4>
                                                        {(() => {
                                                            const patch = scanResults.analysis.patches.find((p: any) =>
                                                                p.vulnerability_id === vuln.id || p.title?.includes(vuln.title?.split(' ')[0])
                                                            );
                                                            return (
                                                                <>
                                                                    <p className="text-sm text-zinc-300 mb-3">{patch.description}</p>
                                                                    {patch.code_example && (
                                                                        <pre className="bg-zinc-950 p-3 rounded text-xs overflow-x-auto border border-zinc-800">
                                                                            <code className="text-green-400">{patch.code_example}</code>
                                                                        </pre>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </>
                )}

                {/* Methodology - At Bottom */}
                <div className="border-t border-zinc-800 pt-8 mt-12">
                    <h2 className="text-xl font-bold mb-4">Methodology & Threat Coverage</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-base">Attack Surface Analysis</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-zinc-400">
                                <p><strong className="text-zinc-300">OWASP LLM Top 10 (2025):</strong> Prompt injection through indirect context manipulation, training data poisoning via supply chain compromise, insecure output handling in RAG pipelines</p>
                                <p><strong className="text-zinc-300">MITRE ATLAS:</strong> ML model inference API exploitation (T0040), adversarial perturbation of embeddings (T0043), exfiltration via inference side-channels (T0024)</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-base">Detection Pipeline</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-zinc-400">
                                <p><strong className="text-zinc-300">1. Threat Intelligence:</strong> Real-time aggregation of CVE databases, security advisories, arXiv preprints on adversarial ML</p>
                                <p><strong className="text-zinc-300">2. LLM Analysis:</strong> Gemini 2.5 Pro with structured output for attack vector classification and exploit likelihood scoring</p>
                                <p><strong className="text-zinc-300">3. Remediation:</strong> Context-aware patch generation with defensive code examples</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
