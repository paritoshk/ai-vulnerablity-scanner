"use client";

import { CheckCircle2, Loader2, Circle } from "lucide-react";

interface ScanStep {
    id: string;
    label: string;
    status: "pending" | "running" | "complete";
}

interface ScanProgressProps {
    steps: ScanStep[];
}

export function ScanProgress({ steps }: ScanProgressProps) {
    return (
        <div className="space-y-3 bg-zinc-950 p-6 rounded-lg border border-zinc-800">
            {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-3">
                    {step.status === "complete" && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                    {step.status === "running" && (
                        <Loader2 className="w-5 h-5 text-orange-500 animate-spin flex-shrink-0" />
                    )}
                    {step.status === "pending" && (
                        <Circle className="w-5 h-5 text-zinc-600 flex-shrink-0" />
                    )}
                    <span
                        className={`text-sm ${step.status === "complete"
                                ? "text-zinc-300"
                                : step.status === "running"
                                    ? "text-orange-400 font-medium"
                                    : "text-zinc-600"
                            }`}
                    >
                        {step.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
