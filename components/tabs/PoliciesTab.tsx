"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, MoreVertical, CheckCircle2, Clock, ChevronDown, Shield, Users, History, Link } from "lucide-react";
import { cn } from "@/components/ui/Card";

export function PoliciesTab({ frameworkId }: { frameworkId: string }) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const policies = [
        {
            id: "POL-01", title: `${frameworkId.toUpperCase()} Information Security Policy`, status: "Approved", updated: "2 days ago", owner: "SecOps",
            details: {
                version: "3.2", approvers: ["CISO", "CTO", "Head of Engineering"],
                linkedControls: ["CC1.1", "CC1.2", "CC1.3", "CC6.1"],
                history: [
                    { version: "3.2", date: "2 days ago", action: "Minor update — encryption standards" },
                    { version: "3.1", date: "2 months ago", action: "Annual review completed" },
                    { version: "3.0", date: "8 months ago", action: "Major revision — cloud controls" },
                ]
            }
        },
        {
            id: "POL-02", title: "Access Control Policy", status: frameworkId === "dpd" ? "Approved" : "Under Review", updated: "5 hours ago", owner: "IT Admin",
            details: {
                version: "2.1", approvers: ["CISO", "IT Director"],
                linkedControls: ["CC6.1", "CC6.2", "CC6.3"],
                history: [
                    { version: "2.1", date: "5 hours ago", action: "Added MFA requirements for contractors" },
                    { version: "2.0", date: "4 months ago", action: "Revised least-privilege guidelines" },
                ]
            }
        },
        {
            id: "POL-03", title: "Incident Response Plan", status: "Approved", updated: "1 month ago", owner: "SecOps",
            details: {
                version: "4.0", approvers: ["CISO", "VP Engineering", "Legal"],
                linkedControls: ["CC7.1", "CC7.2", "CC7.3", "CC7.4", "CC7.5"],
                history: [
                    { version: "4.0", date: "1 month ago", action: "Added ransomware playbook" },
                    { version: "3.5", date: "6 months ago", action: "Updated escalation matrix" },
                ]
            }
        },
        {
            id: "POL-04", title: "Data Retention Policy", status: "Draft", updated: "10 mins ago", owner: "Legal",
            details: {
                version: "1.0-draft", approvers: [],
                linkedControls: ["CC8.1"],
                history: [
                    { version: "1.0-draft", date: "10 mins ago", action: "Initial draft created" },
                ]
            }
        },
        {
            id: "POL-05", title: "Vendor Risk Management", status: "Approved", updated: "3 months ago", owner: "Procurement",
            details: {
                version: "2.3", approvers: ["CISO", "CFO", "Procurement Lead"],
                linkedControls: ["CC9.1", "CC9.2"],
                history: [
                    { version: "2.3", date: "3 months ago", action: "Added tiering criteria update" },
                    { version: "2.2", date: "9 months ago", action: "SOC 2 requirement for Tier 1" },
                ]
            }
        },
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
                            {policies.map((pol) => {
                                const isExpanded = expandedId === pol.id;
                                return (
                                    <React.Fragment key={pol.id}>
                                        <tr
                                            onClick={() => setExpandedId(isExpanded ? null : pol.id)}
                                            className={cn("transition-colors group cursor-pointer", isExpanded ? "bg-blue-500/[0.03]" : "hover:bg-slate-800/30")}
                                        >
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
                                                <div className="flex items-center justify-end space-x-2">
                                                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                                        <ChevronDown className={cn("w-4 h-4", isExpanded ? "text-blue-400" : "text-slate-500")} />
                                                    </motion.div>
                                                    <button
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Expanded Row */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-0">
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                {/* Approvers */}
                                                                <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
                                                                    <div className="flex items-center space-x-2 mb-3">
                                                                        <Users className="w-4 h-4 text-blue-400" />
                                                                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Approvers</span>
                                                                    </div>
                                                                    <div className="flex flex-col space-y-1.5">
                                                                        {pol.details.approvers.length > 0 ? pol.details.approvers.map((a, i) => (
                                                                            <div key={i} className="flex items-center space-x-2 text-xs text-slate-400">
                                                                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                                                <span>{a}</span>
                                                                            </div>
                                                                        )) : <span className="text-xs text-slate-500 italic">Pending approval</span>}
                                                                    </div>
                                                                    <div className="mt-3 pt-2 border-t border-slate-800/50 text-[10px] text-slate-500">
                                                                        Version: <span className="text-slate-300 font-mono">{pol.details.version}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Linked Controls */}
                                                                <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
                                                                    <div className="flex items-center space-x-2 mb-3">
                                                                        <Link className="w-4 h-4 text-emerald-400" />
                                                                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Linked Controls</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {pol.details.linkedControls.map((c, i) => (
                                                                            <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{c}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Version History */}
                                                                <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
                                                                    <div className="flex items-center space-x-2 mb-3">
                                                                        <History className="w-4 h-4 text-amber-400" />
                                                                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">History</span>
                                                                    </div>
                                                                    <div className="flex flex-col space-y-2">
                                                                        {pol.details.history.map((h, i) => (
                                                                            <div key={i} className="flex flex-col text-[10px]">
                                                                                <div className="flex items-center space-x-2">
                                                                                    <span className="font-mono text-slate-300">v{h.version}</span>
                                                                                    <span className="text-slate-600">•</span>
                                                                                    <span className="text-slate-500">{h.date}</span>
                                                                                </div>
                                                                                <span className="text-slate-400 mt-0.5">{h.action}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
