"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Zap } from "lucide-react";

export default function Home() {
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Secret code check (you can change this)
    if (accessCode === "SHIELD2025" || accessCode === "DEMO") {
      // Store in sessionStorage
      sessionStorage.setItem("accessGranted", "true");
      router.push("/dashboard");
    } else {
      setError("Invalid access code");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-orange-950/20 pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />

      <main className="relative z-10 w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30">
            <Lock className="w-3 h-3 mr-1" />
            Private Beta Access
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            AI Vulnerability
            <span className="block gradient-text">Scanner</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Enterprise-grade AI security analysis powered by Gemini 2.5 Pro.
            Detect vulnerabilities, generate patches, and secure your AI infrastructure.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-orange-500/50 transition-all">
            <CardHeader>
              <Shield className="w-8 h-8 text-orange-500 mb-2" />
              <CardTitle className="text-lg">OWASP LLM Top 10</CardTitle>
              <CardDescription>Comprehensive vulnerability detection</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-orange-500/50 transition-all">
            <CardHeader>
              <Zap className="w-8 h-8 text-orange-500 mb-2" />
              <CardTitle className="text-lg">Auto Remediation</CardTitle>
              <CardDescription>AI-generated security patches</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-orange-500/50 transition-all">
            <CardHeader>
              <Lock className="w-8 h-8 text-orange-500 mb-2" />
              <CardTitle className="text-lg">MITRE ATLAS</CardTitle>
              <CardDescription>Industry-standard threat mapping</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Access Form */}
        <Card className="bg-zinc-900/80 border-orange-500/30 glow-orange backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl">Enter Access Code</CardTitle>
            <CardDescription>
              This platform is currently in private beta. Enter your access code to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="XXXXXX-XXXX"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="bg-black border-zinc-700 text-white placeholder:text-zinc-600 text-center text-lg tracking-wider font-mono focus:border-orange-500"
                  autoComplete="off"
                />
                {error && (
                  <p className="text-sm text-red-400 text-center">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold"
              >
                Access Scanner
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-zinc-800">
              <p className="text-xs text-zinc-600 text-center">
                Demo code: <code className="text-orange-500 font-mono">DEMO</code> or <code className="text-orange-500 font-mono">SHIELD2025</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-600">
          Powered by Gemini 2.5 Pro • Parallel Web Search • Next.js
        </p>
      </main>
    </div>
  );
}
