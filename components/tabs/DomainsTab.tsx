"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, ChevronDown, CheckCircle2, AlertTriangle, FileText, BarChart3 } from "lucide-react";
import { cn } from "@/components/ui/Card";

export function DomainsTab({ frameworkId }: { frameworkId: string }) {
    const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
    const getMultiplier = (id: string) => (id === "iso27001" ? 1.1 : id === "dpd" ? 0.9 : 1);
    const m = getMultiplier(frameworkId);

    const domains = [
        {
            name: "Security", score: Math.min(100, Math.round(85 * m)), status: m >= 1 ? "Good" : "Warning",
            subcategories: [
                { name: "Access Control", controls: 8, passed: 7, evidence: 12 },
                { name: "Encryption", controls: 5, passed: 5, evidence: 8 },
                { name: "Network Security", controls: 6, passed: 4, evidence: 9 },
                { name: "Incident Response", controls: 4, passed: 3, evidence: 6 },
            ]
        },
        {
            name: "Availability", score: Math.min(100, Math.round(92 * m)), status: "Good",
            subcategories: [
                { name: "Uptime SLA", controls: 3, passed: 3, evidence: 5 },
                { name: "Disaster Recovery", controls: 4, passed: 4, evidence: 7 },
                { name: "Capacity Planning", controls: 3, passed: 2, evidence: 4 },
            ]
        },
        {
            name: "Processing Integrity", score: Math.min(100, Math.round(68 * m)), status: m < 1 ? "Critical" : "Warning",
            subcategories: [
                { name: "Data Validation", controls: 5, passed: 3, evidence: 4 },
                { name: "Error Handling", controls: 4, passed: 2, evidence: 3 },
                { name: "Monitoring", controls: 6, passed: 5, evidence: 8 },
            ]
        },
        {
            name: "Confidentiality", score: Math.min(100, Math.round(45 * m)), status: "Critical",
            subcategories: [
                { name: "Data Classification", controls: 4, passed: 1, evidence: 2 },
                { name: "Data Loss Prevention", controls: 5, passed: 2, evidence: 3 },
                { name: "Key Management", controls: 3, passed: 2, evidence: 4 },
            ]
        },
        {
            name: "Privacy", score: Math.min(100, Math.round(98 * m)), status: "Good",
            subcategories: [
                { name: "Consent Management", controls: 4, passed: 4, evidence: 6 },
                { name: "Data Retention", controls: 3, passed: 3, evidence: 5 },
                { name: "Subject Rights", controls: 5, passed: 5, evidence: 7 },
            ]
        },
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
                {domains.map((domain, i) => {
                    const isExpanded = expandedDomain === domain.name;
                    return (
                        <div key={i} className="flex flex-col">
                            <div
                                onClick={() => setExpandedDomain(isExpanded ? null : domain.name)}
                                className={cn(
                                    "glass-panel p-6 rounded-2xl border transition-all group cursor-pointer",
                                    isExpanded ? "border-blue-500/30 ring-1 ring-blue-500/20" : "border-slate-800/50 hover:border-slate-700"
                                )}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn(
                                        "p-3 rounded-xl border",
                                        domain.status === "Good" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                            domain.status === "Warning" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                                "bg-red-500/10 border-red-500/20 text-red-400"
                                    )}>
                                        {domain.status === "Good" ? <ShieldCheck className="w-6 h-6" /> : domain.status === "Warning" ? <Shield className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="text-right">
                                            <span className="text-3xl font-bold text-slate-100 tracking-tight">{domain.score}</span>
                                            <span className="text-sm font-medium text-slate-500 ml-1">/ 100</span>
                                        </div>
                                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                            <ChevronDown className={cn("w-4 h-4", isExpanded ? "text-blue-400" : "text-slate-500")} />
                                        </motion.div>
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

                                {/* Quick stats */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/50 text-[10px]">
                                    <span className="text-slate-500">{domain.subcategories.length} subcategories</span>
                                    <span className="text-slate-500">{domain.subcategories.reduce((a, s) => a + s.controls, 0)} controls</span>
                                    <span className="text-slate-500">{domain.subcategories.reduce((a, s) => a + s.evidence, 0)} evidence</span>
                                </div>
                            </div>

                            {/* Expanded Detail */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-2 glass-panel rounded-xl border border-blue-500/20 p-4 space-y-2">
                                            {domain.subcategories.map((sub, j) => {
                                                const pct = Math.round((sub.passed / sub.controls) * 100);
                                                return (
                                                    <div key={j} className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                                                        <div className="flex items-center space-x-2">
                                                            {pct === 100 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                                                            <span className="text-xs font-medium text-slate-200">{sub.name}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-[10px] text-slate-500">
                                                            <span className={cn("font-bold", pct >= 90 ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-red-400")}>{pct}%</span>
                                                            <span>{sub.passed}/{sub.controls} controls</span>
                                                            <span className="flex items-center"><FileText className="w-2.5 h-2.5 mr-0.5" />{sub.evidence}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
