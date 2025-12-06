"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useState } from "react"

interface DownloadReportButtonProps {
    targetId: string
    scanData?: any
}

export function DownloadReportButton({ targetId, scanData }: DownloadReportButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleDownload = async () => {
        if (!scanData) {
            alert("No scan data available for download")
            return
        }

        setIsGenerating(true)
        try {
            console.log("Requesting PDF from backend...")

            const response = await fetch("/api/scan/generate-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(scanData)
            })

            if (!response.ok) {
                throw new Error(`PDF generation failed: ${response.statusText}`)
            }

            // Download the file
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `ai-security-report-${scanData.company.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            console.log("PDF downloaded successfully!")
        } catch (error) {
            console.error("PDF Generation failed:", error)
            alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Button
            onClick={handleDownload}
            disabled={isGenerating}
            variant="outline"
            className="gap-2 border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
        >
            {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Download className="w-4 h-4" />
            )}
            Download PDF
        </Button>
    )
}
