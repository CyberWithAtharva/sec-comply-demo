"use client";

import React from "react";
import { AlertCircle, CalendarClock, ShieldAlert, ArrowRight, Building2 } from "lucide-react";

const actions = [
    { title: "Review Contract Renewal", vendor: "SlackTech", type: "renewal", due: "14 Days" },
    { title: "Review SOC2 Exceptions", vendor: "CloudHost Pro", type: "audit", due: "Immediate" },
    { title: "Update DPA Agreement", vendor: "MarketMail Analytics", type: "legal", due: "7 Days" },
];

export function VendorActionListWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Action Items</h3>
                </div>
            </div>

            <div className="flex flex-col space-y-3 flex-1 justify-center">
                {actions.map((act, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex flex-col group hover:bg-slate-800/40 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">{act.title}</span>
                            <span className="text-xs font-mono font-bold text-amber-500 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">{act.due}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-slate-400">
                            <span className="flex items-center"><Building2 className="w-3 h-3 mr-1" /> {act.vendor}</span>
                            <span className="flex items-center uppercase text-[10px] tracking-widest opacity-60">
                                {act.type === "renewal" ? <CalendarClock className="w-3 h-3 mr-1" /> : <ShieldAlert className="w-3 h-3 mr-1" />}
                                {act.type}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-slate-800/50 hover:bg-slate-800 text-sm text-slate-200 py-2.5 rounded-lg border border-slate-700/50 transition-colors">
                <span>View Action Center</span>
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}
