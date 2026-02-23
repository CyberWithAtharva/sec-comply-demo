"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, Filter, Plus, FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/components/ui/Card";

export default function PoliciesPage() {
    const stats = [
        { label: "Total Policies", value: "24", icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
        { label: "Fully Approved", value: "18", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { label: "Needs Review", value: "4", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
        { label: "Outdated", value: "2", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
    ];

    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <BookOpen className="w-8 h-8 mr-3 text-blue-500" />
                        Policies & Procedures
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Centralized governance document management and approvals.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-glow transition-all flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    New Policy
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="glass-panel p-6 rounded-2xl flex items-center space-x-4 border border-slate-800/50 hover:border-slate-700 transition-colors cursor-default"
                    >
                        <div className={cn("p-3 rounded-xl border border-slate-800", s.bg)}>
                            <s.icon className={cn("w-6 h-6", s.color)} />
                        </div>
                        <div>
                            <span className="block text-2xl font-bold text-slate-100">{s.value}</span>
                            <span className="text-sm text-slate-500 font-medium">{s.label}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Content Area */}
            <div className="glass-panel rounded-2xl border border-slate-800/50 flex flex-col flex-1 min-h-[500px]">
                <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
                    <div className="flex space-x-2">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                className="bg-slate-900/50 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 w-64 transition-colors"
                            />
                        </div>
                        <button className="px-4 py-2 border border-slate-800 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 flex items-center transition-colors">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </button>
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                    <BookOpen className="w-16 h-16 mb-4 text-slate-600" />
                    <p className="text-lg font-medium text-slate-400">Policy grid rendering initializing...</p>
                    <p className="text-sm">Connecting to document storage.</p>
                </div>
            </div>
        </div>
    );
}
