"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/components/ui/Card";

export function DomainsTab({ frameworkId }: { frameworkId: string }) {
    const getMultiplier = (id: string) => (id === "iso27001" ? 1.1 : id === "dpd" ? 0.9 : 1);
    const m = getMultiplier(frameworkId);

    const domains = [
        { name: "Security", score: Math.min(100, Math.round(85 * m)), status: m >= 1 ? "Good" : "Warning" },
        { name: "Availability", score: Math.min(100, Math.round(92 * m)), status: "Good" },
        { name: "Processing Integrity", score: Math.min(100, Math.round(68 * m)), status: m < 1 ? "Critical" : "Warning" },
        { name: "Confidentiality", score: Math.min(100, Math.round(45 * m)), status: "Critical" },
        { name: "Privacy", score: Math.min(100, Math.round(98 * m)), status: "Good" },
    ];

    return (
        <motion.div
            key="domains"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col space-y-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {domains.map((domain, i) => (
                    <div key={i} className="glass-panel p-6 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn(
                                "p-3 rounded-xl border",
                                domain.status === "Good" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                    domain.status === "Warning" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                        "bg-red-500/10 border-red-500/20 text-red-400"
                            )}>
                                {domain.status === "Good" ? <ShieldCheck className="w-6 h-6" /> : domain.status === "Warning" ? <Shield className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-slate-100 tracking-tight">{domain.score}</span>
                                <span className="text-sm font-medium text-slate-500 ml-1">/ 100</span>
                            </div>
                        </div>

                        <h3 className="text-base font-semibold text-slate-200 mb-4">{domain.name}</h3>

                        <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${domain.score}%` }}
                                transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                                className={cn(
                                    "h-full rounded-full",
                                    domain.status === "Good" ? "bg-emerald-500" :
                                        domain.status === "Warning" ? "bg-amber-500" :
                                            "bg-red-500"
                                )}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
