"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Lock } from "lucide-react";
import { Entropy } from "@/components/ui/entropy";

export default function Home() {
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === "DEMO" || accessCode === "demo") {
      sessionStorage.setItem("accessGranted", "true");
      router.push("/dashboard");
    } else {
      setError("Invalid access code");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Entropy Background */}
      <Entropy fullscreen className="fixed inset-0 z-0 pointer-events-none opacity-40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Shield className="w-5 h-5 text-orange-500" />
            </div>
            <span className="font-bold text-lg tracking-tight">AI Security Scanner</span>
          </div>
          <div className="text-sm text-zinc-500">v1.0.0-beta</div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-white">
                AI Vulnerability Scanner
              </h1>
              <p className="text-base text-zinc-400">
                Enterprise-grade AI security analysis.
              </p>
            </div>

            <Card className="bg-zinc-900/80 border-zinc-800 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-500" />
                  Private Access
                </CardTitle>
                <CardDescription className="text-zinc-500">
                  Enter your access code to continue.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAccess} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Access Code"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                      className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-600 text-center font-mono focus:border-orange-500 h-12 text-lg"
                      autoComplete="off"
                    />
                    {error && (
                      <p className="text-xs text-red-400 text-center">{error}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-zinc-200 font-bold h-12"
                  >
                    Enter Platform
                  </Button>
                </form>

                <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
                  <p className="text-xs text-zinc-600">
                    Demo code: <code className="text-orange-500/80 font-mono">DEMO</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
