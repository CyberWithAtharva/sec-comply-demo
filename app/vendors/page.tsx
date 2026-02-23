"use client";

import React from "react";
import { motion } from "framer-motion";
import { Building2, MailWarning, Clock, Filter, Plus } from "lucide-react";
import { cn } from "@/components/ui/Card";

export default function VendorsPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <Building2 className="w-8 h-8 mr-3 text-indigo-500" />
                        Vendor Risk Management
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Third-party security assessments, tiering, and continuous monitoring.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="px-5 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-300 transition-all flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter Vendors
                    </button>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Onboard Vendor
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Active Vendors", value: "142", icon: Building2, color: "text-slate-200" },
                    { label: "High Risk (Tier 1)", value: "18", icon: MailWarning, color: "text-red-400" },
                    { label: "Pending Assessments", value: "7", icon: Clock, color: "text-amber-400" },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-slate-800/50"
                    >
                        <div>
                            <span className="text-3xl font-bold text-slate-100 mb-1 block">{s.value}</span>
                            <span className="text-sm font-medium text-slate-500 tracking-wide">{s.label}</span>
                        </div>
                        <div className={cn("p-4 rounded-xl bg-slate-800/50", s.color)}>
                            <s.icon className={"w-6 h-6"} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Placeholder Table */}
            <div className="glass-panel rounded-2xl border border-slate-800/50 flex flex-col flex-1 min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-xs text-slate-500 font-mono uppercase bg-slate-900/40 border-b border-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 font-medium rounded-tl-xl">Vendor Name</th>
                                <th className="px-6 py-4 font-medium">Risk Tier</th>
                                <th className="px-6 py-4 font-medium">Assessment Status</th>
                                <th className="px-6 py-4 font-medium text-right rounded-tr-xl">Last Review</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {[1, 2, 3, 4, 5].map((_, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 flex items-center">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 mr-3 animate-pulse" />
                                        <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
                                    </td>
                                    <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-800/50 rounded animate-pulse" /></td>
                                    <td className="px-6 py-4"><div className="h-5 w-24 bg-slate-800/50 rounded-full animate-pulse" /></td>
                                    <td className="px-6 py-4 flex justify-end"><div className="h-4 w-20 bg-slate-800/50 rounded animate-pulse" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
