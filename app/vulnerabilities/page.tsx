"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Activity, GitPullRequest, ArrowUpRight, TrendingDown } from "lucide-react";

export default function VulnerabilitiesPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <ShieldAlert className="w-8 h-8 mr-3 text-red-500" />
                        Vulnerability Management
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Continuous CVE monitoring, SLA tracking, and prioritized patching.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
                        Run Custom Scan
                    </button>
                    <button className="bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center">
                        <Activity className="w-4 h-4 mr-2" />
                        Live Threat Intel
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Critical CVEs", count: "12", trend: "+2", isGood: false },
                    { label: "High Severity", count: "45", trend: "-5", isGood: true },
                    { label: "Mean Time to Remediate", count: "14 Days", trend: "-2", isGood: true },
                    { label: "SLA Breaches", count: "3", trend: "+1", isGood: false },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className="glass-panel p-5 rounded-2xl flex flex-col border border-slate-800/50"
                    >
                        <span className="text-sm font-medium text-slate-500 mb-2">{s.label}</span>
                        <div className="flex items-end space-x-3">
                            <span className="text-4xl font-bold text-slate-100 tracking-tighter">{s.count}</span>
                            <span className={`text-sm font-medium flex items-center mb-1 ${s.isGood ? 'text-emerald-400' : 'text-red-400'}`}>
                                {s.isGood ? <TrendingDown className="w-4 h-4 mr-1" /> : <ArrowUpRight className="w-4 h-4 mr-1" />}
                                {s.trend}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
                <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800/50 p-6 flex flex-col items-center justify-center">
                    <Activity className="w-16 h-16 text-slate-600 mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-slate-300">Vulnerability Burndown Chart</h3>
                    <p className="text-slate-500 text-sm">Generating timeline data from Snyk and Dependabot...</p>
                </div>
                <div className="glass-panel rounded-2xl border border-slate-800/50 p-6 flex flex-col items-center justify-center">
                    <GitPullRequest className="w-16 h-16 text-slate-600 mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-slate-300">Pending Patches</h3>
                    <p className="text-slate-500 text-sm">Waiting for CI/CD integration sync.</p>
                </div>
            </div>
        </div>
    );
}
