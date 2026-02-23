"use client";

import React from "react";
import { Clock, ArrowRight, AlertOctagon } from "lucide-react";

const overdue = [
    { title: "Acceptable Use Policy", days: 14, owner: "Emily Chen" },
    { title: "Incident Response Plan", days: 3, owner: "Marcus Webb" },
];

export function OverdueReviewsWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Overdue Reviews</h3>
                </div>
                <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 font-mono">
                    2 Pending
                </div>
            </div>

            <div className="flex flex-col space-y-3 flex-1 justify-center">
                {overdue.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex items-center justify-between group cursor-pointer hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-start space-x-3">
                            <AlertOctagon className="w-4 h-4 text-amber-500 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{item.title}</span>
                                <span className="text-xs text-slate-500">Owner: {item.owner}</span>
                            </div>
                        </div>
                        <span className="text-xs font-mono text-amber-400">{item.days}d</span>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-slate-800/50 hover:bg-slate-800 text-sm text-slate-200 py-2.5 rounded-lg border border-slate-700/50 transition-colors">
                <span>Send Reminders</span>
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}
