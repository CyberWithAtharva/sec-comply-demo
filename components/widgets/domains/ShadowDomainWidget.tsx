"use client";

import React from "react";
import { EyeOff, AlertCircle, Trash2 } from "lucide-react";
import { cn } from "@/components/ui/Card";

const shadowItems = [
    { domain: "omniguard-beta.herokuapp.com", source: "CT Log", date: "Found 2h ago" },
    { domain: "dev-dashboard.omniguard.io", source: "Passive DNS", date: "Found 1d ago" },
    { domain: "omniguard-support.zendesk.com", source: "Referer", date: "Found 3d ago" },
];

export function ShadowDomainWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <EyeOff className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Shadow IT Domains</h3>
                </div>
            </div>

            <div className="flex flex-col space-y-3 flex-1 justify-center">
                <p className="text-xs text-slate-400 mb-2">Unsanctioned domains detected via cert logs & DNS.</p>
                {shadowItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex flex-col group hover:bg-slate-800/40 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-slate-200 group-hover:text-purple-400 transition-colors">{item.domain}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="flex items-center"><AlertCircle className="w-3 h-3 mr-1 text-purple-500" /> {item.source}</span>
                            <span className="font-mono tracking-widest uppercase">{item.date}</span>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-slate-800/50 hover:bg-slate-800 text-sm text-slate-200 py-2.5 rounded-lg border border-slate-700/50 transition-colors">
                <Trash2 className="w-4 h-4 text-slate-400" />
                <span>Review Discovered Assets</span>
            </button>
        </div>
    );
}
