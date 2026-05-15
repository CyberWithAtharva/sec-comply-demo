"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText, Download, Maximize2, ExternalLink, Upload, ChevronLeft, ChevronRight, Presentation } from "lucide-react";

// ── Replace this URL with the real hosted PDF URL when ready ──────────────────
const PDF_URL: string | null = null;
// Example: const PDF_URL = "https://your-bucket.s3.amazonaws.com/seccomply-deck.pdf";
// ─────────────────────────────────────────────────────────────────────────────

export default function PitchPage() {
    const [fullscreen, setFullscreen] = useState(false);

    if (PDF_URL) {
        return (
            <div className="w-full flex flex-col space-y-4 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">Product Deck</h1>
                        <p className="text-sm text-muted-foreground mt-1">SecComply — AI-Driven GRC Platform Overview</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={PDF_URL}
                            download
                            className="flex items-center gap-2 px-3 py-2 bg-secondary/60 hover:bg-secondary/60 border border-border/50 text-muted-foreground hover:text-foreground text-sm font-medium rounded-xl transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </a>
                        <a
                            href={PDF_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-secondary/60 hover:bg-secondary/60 border border-border/50 text-muted-foreground hover:text-foreground text-sm font-medium rounded-xl transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open
                        </a>
                        <Button variant="plain"
                            onClick={() => setFullscreen(f => !f)}
                            className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-xl transition-colors h-auto"
                        >
                            <Maximize2 className="w-4 h-4" />
                            {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        </Button>
                    </div>
                </div>

                {/* PDF Viewer */}
                <div
                    className={
                        fullscreen
                            ? "fixed inset-0 z-50 bg-background flex flex-col"
                            : "bg-card/60 border border-border/60 rounded-2xl overflow-hidden"
                    }
                >
                    {fullscreen && (
                        <div className="flex items-center justify-between px-6 py-3 border-b border-border/50 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Presentation className="w-4 h-4 text-orange-400" />
                                <span className="text-sm font-semibold text-foreground">Product Deck</span>
                            </div>
                            <Button variant="plain"
                                onClick={() => setFullscreen(false)}
                                className="px-3 py-1.5 bg-secondary hover:bg-secondary border border-border/50 text-muted-foreground text-xs rounded-lg transition-colors h-auto"
                            >
                                Exit Fullscreen
                            </Button>
                        </div>
                    )}
                    <iframe
                        src={`${PDF_URL}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        className="w-full flex-1"
                        style={{ height: fullscreen ? "calc(100vh - 52px)" : "80vh", border: "none" }}
                        title="SecComply Product Deck"
                    />
                </div>
            </div>
        );
    }

    // ── Placeholder (shown until PDF_URL is set) ──────────────────────────────
    return (
        <div className="w-full flex flex-col space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Product Deck</h1>
                    <p className="text-sm text-muted-foreground mt-1">SecComply — AI-Driven GRC Platform Overview</p>
                </div>
            </div>

            {/* Placeholder viewer */}
            <div className="bg-card/60 border border-border/60 rounded-2xl overflow-hidden">
                {/* Fake toolbar */}
                <div className="flex items-center justify-between px-5 py-3 bg-card/80 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/40" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/40" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
                        </div>
                        <div className="h-4 w-px bg-secondary" />
                        <div className="flex items-center gap-2 px-3 py-1 bg-secondary/60 rounded-lg border border-border/40">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-mono">seccomply-pitch-deck.pdf</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground/70">
                        <ChevronLeft className="w-4 h-4" />
                        <span className="text-xs font-mono">— / —</span>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>

                {/* Placeholder body */}
                <div className="flex flex-col items-center justify-center" style={{ height: "72vh" }}>
                    {/* Slide mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="relative w-[640px] max-w-[90%] aspect-[16/9] bg-card border border-border/50 rounded-xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col items-center justify-center gap-6"
                    >
                        {/* Slide gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-violet-500/5" />
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />

                        {/* Logo mark */}
                        <div className="relative flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shadow-lg shadow-orange-500/10">
                                <Presentation className="w-7 h-7 text-orange-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-foreground tracking-wide">SECCOMPLY</p>
                                <p className="text-xs text-muted-foreground tracking-widest font-medium">AI-DRIVEN GRC PLATFORM</p>
                            </div>
                        </div>

                        {/* Dashed upload zone */}
                        <div className="border border-dashed border-border/70 rounded-xl px-8 py-4 flex flex-col items-center gap-2 bg-card/40">
                            <Upload className="w-5 h-5 text-muted-foreground/70" />
                            <p className="text-xs text-muted-foreground text-center">
                                Pitch deck PDF will appear here
                            </p>
                            <p className="text-[10px] text-muted-foreground/50">Set <code className="font-mono bg-secondary px-1 rounded">PDF_URL</code> in <code className="font-mono bg-secondary px-1 rounded">app/(main)/pitch/page.tsx</code></p>
                        </div>

                        {/* Fake slide counter */}
                        <div className="absolute bottom-3 right-4 text-[10px] font-mono text-muted-foreground/50">
                            Slide 1 of —
                        </div>
                    </motion.div>

                    {/* Instruction card */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 flex items-start gap-3 bg-orange-500/5 border border-orange-500/20 rounded-xl px-5 py-3.5 max-w-lg"
                    >
                        <FileText className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-orange-300">Ready to embed your PDF</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Once you share the PDF file, set <code className="font-mono text-orange-400 bg-orange-500/10 px-1 rounded">PDF_URL</code> at the top of <code className="font-mono text-muted-foreground">pitch/page.tsx</code> and the viewer will activate automatically.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
