"use client";

import React from "react";
import { FileWarning } from "lucide-react";

const exceptions = [
    { id: "EXC-104", desc: "MFA bypassed for service account sv-billing-01", date: "Today, 10:24 AM", approvedBy: "B. Wayne" },
    { id: "EXC-103", desc: "S3 Public Read allowed temporarily for marketing campaign asset fetch", date: "Yesterday", approvedBy: "C. Kent" },
];

export function RecentExceptionsWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <FileWarning className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Active Exceptions</h3>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                {exceptions.map((ex, i) => (
                    <div key={i} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-mono text-red-400 font-bold">{ex.id}</span>
                            <span className="text-[10px] text-slate-500">{ex.date}</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-snug mb-2">{ex.desc}</p>
                        <div className="text-[11px] text-slate-500 font-medium">Approved by: <span className="text-slate-400">{ex.approvedBy}</span></div>
                    </div>
                ))}
            </div>

            <button className="text-xs text-blue-400 hover:text-blue-300 mt-4 text-center font-medium transition-colors">
                View Exception Registry →
            </button>
        </div>
    );
}
