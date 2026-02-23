"use client";

import React from "react";
import { Users, FileCheck2, ArrowRight } from "lucide-react";

const tasks = [
    { title: "Review SOC2 Onboarding Evidences", count: 12, due: "Today" },
    { title: "Approve Architecture Diagrams", count: 3, due: "Tomorrow" },
    { title: "Validate Access Terminations", count: 45, due: "In 3 days" },
];

export function ReviewerQueueWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">My Review Queue</h3>
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-glow-blue">24</div>
            </div>

            <div className="flex flex-col space-y-3 flex-1 justify-center">
                <p className="text-xs text-slate-400 mb-2">Pending documentation approvals requiring your sign-off.</p>
                {tasks.map((task, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex flex-col group hover:bg-slate-800/40 transition-colors cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-[100%] pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <span className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors pr-6">{task.title}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 relative z-10">
                            <span className="flex items-center"><FileCheck2 className="w-3 h-3 mr-1 text-slate-400" /> {task.count} items</span>
                            <span className="font-mono tracking-widest uppercase text-blue-400/80">{task.due}</span>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 flex items-center justify-center space-x-2 text-sm text-slate-400 hover:text-blue-400 font-medium transition-colors">
                <span>Open Task Inbox</span>
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}
