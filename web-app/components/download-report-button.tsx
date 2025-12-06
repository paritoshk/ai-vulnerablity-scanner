"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export function DownloadReportButton({ targetId }: { targetId: string }) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleDownload = async () => {
        setIsGenerating(true)
        try {
            const element = document.getElementById(targetId)
            if (!element) throw new Error("Report element not found")

            // Capture the element
            const canvas = await html2canvas(element, {
                scale: 2, // Higher resolution
                backgroundColor: "#000000", // Force black background
                useCORS: true,
                logging: false,
                ignoreElements: (element: Element) => element.classList.contains("no-print"), // Ignore elements with no-print class
            } as any)

            const imgData = canvas.toDataURL("image/png")

            // Calculate PDF dimensions (A4)
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            })

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // If image is taller than page, we might need multiple pages or just scale it fit?
            // For now, let's just add it. If it's too long, it might get cut off or we need to handle pagination.
            // Given the report is a single panel, it might fit or be long.
            // Let's just add it starting at top.

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

            // Add Watermark
            pdf.setTextColor(150, 150, 150)
            pdf.setFontSize(50)
            // Save graphics state not always available in basic jspdf types? 
            // It is available.
            pdf.saveGraphicsState()
            pdf.setGState(new (pdf as any).GState({ opacity: 0.1 }))

            // Add diagonal watermarks
            for (let i = 0; i < 5; i++) {
                pdf.text("CONFIDENTIAL", 20, 50 + (i * 60), { angle: 45 })
                pdf.text("AI SCANNER", 100, 50 + (i * 60), { angle: 45 })
            }

            pdf.restoreGraphicsState()

            pdf.save("ai-security-report.pdf")
        } catch (error) {
            console.error("PDF Generation failed:", error)
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
