"use client";

import React from "react";
import { motion } from "framer-motion";
import { CloudCog, Globe, Server, Database, AlertCircle } from "lucide-react";
import { cn } from "@/components/ui/Card";

export default function CSPMPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <CloudCog className="w-8 h-8 mr-3 text-sky-500" />
                        Cloud Security Posture (CSPM)
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Real-time misconfiguration scanning across AWS, GCP, and Azure environments.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="px-5 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-300 transition-all">
                        Sync Environments
                    </button>
                    <button className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(2,132,199,0.4)] transition-all">
                        Connect Account
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Assets", value: "1,248", icon: Server, color: "text-slate-400" },
                    { label: "Passed Checks", value: "98.2%", icon: Globe, color: "text-emerald-400" },
                    { label: "Misconfigurations", value: "12", icon: AlertCircle, color: "text-red-400" },
                    { label: "Data Stores", value: "34", icon: Database, color: "text-blue-400" },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className="glass-panel p-5 rounded-2xl flex items-center justify-between border border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                        <div>
                            <span className="block text-sm font-medium text-slate-500 mb-1">{s.label}</span>
                            <span className="text-2xl font-bold text-slate-200">{s.value}</span>
                        </div>
                        <div className={cn("p-3 rounded-full bg-slate-900", s.color)}>
                            <s.icon className="w-5 h-5" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="glass-panel rounded-2xl border border-slate-800/50 flex-1 min-h-[500px] flex items-center justify-center p-8">
                <div className="text-center">
                    <CloudCog className="w-16 h-16 text-sky-500/30 mx-auto mb-6 animate-pulse" />
                    <h3 className="text-xl font-bold text-slate-300 mb-2">Aggregating Cloud Logs</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">Connecting to AWS Config and Azure Resource Graph APIs. The visualization map will compile shortly.</p>
                </div>
            </div>
        </div>
    );
}
