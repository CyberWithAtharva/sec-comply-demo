"use client";

import React from "react";
import { FolderGit2, CheckCircle2, ShieldAlert, FileText, Search } from "lucide-react";
import { cn } from "@/components/ui/Card";

const artifacts = [
    { title: "AWS Security Group Configs", control: "CC6.1", type: "JSON", status: "approved" },
    { title: "Q3 Threat Model Output", control: "CC3.2", type: "PDF", status: "rejected" },
    { title: "Okta Admin Access Log", control: "CC6.3", type: "CSV", status: "pending" },
    { title: "SOC2 Type II - AWS Data Center", control: "CC6.4", type: "PDF", status: "approved" },
];

export function EvidenceArtifactGrid() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <FolderGit2 className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Recent Artifacts</h3>
                </div>
                <div className="relative group">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search evidence..."
                        className="bg-slate-900/50 border border-slate-700/50 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
                    />
                </div>
            </div>

            <div className="w-full overflow-hidden flex-1 flex flex-col">
                <div className="grid grid-cols-12 gap-4 px-4 pb-2 border-b border-slate-800/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-6">Document Title</div>
                    <div className="col-span-2">Control</div>
                    <div className="col-span-2">Format</div>
                    <div className="col-span-2 text-right">Status</div>
                </div>

                <div className="flex-1 overflow-y-auto mt-2 space-y-2 no-scrollbar">
                    {artifacts.map((artifact, i) => (
                        <div key={i} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-slate-800/30 rounded-xl transition-colors border border-transparent hover:border-slate-700/50 cursor-pointer">
                            <div className="col-span-6 flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                </div>
                                <span className="text-sm font-medium text-slate-200 truncate">{artifact.title}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">{artifact.control}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-xs text-slate-500 font-medium">{artifact.type}</span>
                            </div>
                            <div className="col-span-2 flex justify-end">
                                {artifact.status === "approved" ? (
                                    <div className="flex items-center space-x-1.5 text-emerald-400">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wide">Valid</span>
                                    </div>
                                ) : artifact.status === "rejected" ? (
                                    <div className="flex items-center space-x-1.5 text-red-400">
                                        <ShieldAlert className="w-4 h-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wide">Reject</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-1.5 text-amber-400">
                                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                        <span className="text-xs font-semibold uppercase tracking-wide">Pending</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
