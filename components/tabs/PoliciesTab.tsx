"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, MoreVertical, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/components/ui/Card";

export function PoliciesTab({ frameworkId }: { frameworkId: string }) {
    const policies = [
        { id: "POL-01", title: `${frameworkId.toUpperCase()} Information Security Policy`, status: "Approved", updated: "2 days ago", owner: "SecOps" },
        { id: "POL-02", title: "Access Control Policy", status: frameworkId === "dpd" ? "Approved" : "Under Review", updated: "5 hours ago", owner: "IT Admin" },
        { id: "POL-03", title: "Incident Response Plan", status: "Approved", updated: "1 month ago", owner: "SecOps" },
        { id: "POL-04", title: "Data Retention Policy", status: "Draft", updated: "10 mins ago", owner: "Legal" },
        { id: "POL-05", title: "Vendor Risk Management", status: "Approved", updated: "3 months ago", owner: "Procurement" },
    ];

    return (
        <motion.div
            key="policies"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col space-y-6"
        >
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/50">
                <div className="flex justify-between items-center mb-6 border-b border-slate-800/50 pb-4">
                    <h3 className="text-lg font-semibold text-slate-100">Governing Standards</h3>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                        Add Policy
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-xs text-slate-500 font-mono uppercase bg-slate-900/40">
                            <tr>
                                <th className="px-6 py-4 font-medium rounded-tl-lg">Document ID</th>
                                <th className="px-6 py-4 font-medium">Policy Name</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Owner</th>
                                <th className="px-6 py-4 font-medium">Last Updated</th>
                                <th className="px-6 py-4 font-medium rounded-tr-lg text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {policies.map((pol) => (
                                <tr key={pol.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-slate-300 group-hover:text-blue-400 transition-colors">
                                        <div className="flex items-center space-x-2">
                                            <FileText className="w-4 h-4 text-slate-500" />
                                            <span>{pol.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-200">{pol.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded border flex items-center w-max gap-1.5",
                                            pol.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                pol.status === "Under Review" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                    "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                        )}>
                                            {pol.status === "Approved" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {pol.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">{pol.owner}</td>
                                    <td className="px-6 py-4 text-slate-500">{pol.updated}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
