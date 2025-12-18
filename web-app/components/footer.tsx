"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"

export function Footer() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={`fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 transition-all duration-500 ease-in-out z-50 flex flex-col shadow-2xl ${isOpen ? "h-[75vh] md:h-[85vh]" : "h-12"}`}>
            <div
                className="h-12 shrink-0 flex items-center justify-between px-6 cursor-pointer hover:bg-zinc-900 border-b border-zinc-900 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-400 font-medium hover:text-white transition-colors">Methodology & System Architecture</span>
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
            </div>

            {isOpen && (
                <div className="flex-1 overflow-y-auto p-8 bg-black/95 backdrop-blur-xl">
                    <div className="max-w-4xl mx-auto space-y-8 text-zinc-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="border border-orange-500/20 bg-orange-500/5 p-6 rounded-lg">
                            <h2 className="text-xl font-bold text-orange-400 mb-2">Documentation Content Needed</h2>
                            <p>Please provide the content of <code>PIPELINE_DESIGN.md</code> so I can populate this section with your system architecture and diagrams.</p>
                        </div>

                        {/* Placeholder structure */}
                        <div className="prose prose-invert max-w-none">
                            <h1>AI Security Pipeline Design</h1>
                            <p className="lead">Our system employs a multi-stage analysis pipeline to detect and mitigate vulnerabilities in AI applications.</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8 not-prose">
                                <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
                                    <h3 className="text-lg font-bold text-white mb-2">1. Ingestion</h3>
                                    <p className="text-sm text-zinc-400">Parsing and validation of user inputs and configuration.</p>
                                </div>
                                <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
                                    <h3 className="text-lg font-bold text-white mb-2">2. Analysis</h3>
                                    <p className="text-sm text-zinc-400">Gemini 2.5 Pro powered deep scanning of potential attack vectors.</p>
                                </div>
                                <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
                                    <h3 className="text-lg font-bold text-white mb-2">3. Reporting</h3>
                                    <p className="text-sm text-zinc-400">Generation of actionable risk scores and remediation patches.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
