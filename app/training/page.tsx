"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Users, Shield, TrendingUp, Mail } from "lucide-react";
import { cn } from "@/components/ui/Card";

export default function TrainingPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <GraduationCap className="w-8 h-8 mr-3 text-emerald-500" />
                        Awareness Training
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Employee security modules, phishing simulations, and performance tracking.</p>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                    Launch Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Completion Rate", value: "94%", detail: "↑ 2% this month", icon: Users, color: "text-emerald-400" },
                    { label: "Phish Resilient", value: "88%", detail: "Last campaign: Q3", icon: Shield, color: "text-blue-400" },
                    { label: "Active Modules", value: "3", detail: "Due in 14 days", icon: Mail, color: "text-amber-400" },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="glass-panel p-6 rounded-2xl flex flex-col border border-slate-800/50"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{s.label}</span>
                            <s.icon className={cn("w-5 h-5", s.color)} />
                        </div>
                        <span className="text-4xl font-bold text-slate-100 tracking-tighter mb-2">{s.value}</span>
                        <span className="text-xs text-slate-500 font-medium flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {s.detail}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Campaign Grid Placeholder */}
            <div className="glass-panel rounded-2xl border border-slate-800/50 flex-1 min-h-[400px] flex items-center justify-center p-8 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80 z-10" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />

                <div className="z-20 flex flex-col items-center">
                    <GraduationCap className="w-20 h-20 text-emerald-500/20 mb-6" />
                    <h3 className="text-2xl font-bold text-slate-200 mb-2">Campaign Intelligence Hub</h3>
                    <p className="text-slate-400 max-w-md">Syncing HRIS directories and pulling historic completion logs for dynamic table generation.</p>
                </div>
            </div>
        </div>
    );
}
