"use client";

import React from "react";
import { FileSearch, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/components/ui/Card";

const missingPolicies = [
    { title: "AI Generation Policy", framework: "ISO 27001:2022" },
    { title: "Supplier Security Agreement", framework: "SOC2 CC9.2" },
    { title: "Bring Your Own Device (BYOD)", framework: "HIPAA Security Rule" },
];

export function MissingPoliciesWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <FileSearch className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Detected Framework Gaps</h3>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">3</div>
            </div>

            <div className="flex flex-col space-y-3 flex-1 justify-center">
                <p className="text-xs text-slate-400 mb-2">Policies required for your targeted compliance frameworks.</p>
                {missingPolicies.map((policy, idx) => (
                    <div key={idx} className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/20 flex flex-col group hover:bg-purple-500/10 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-slate-200">{policy.title}</span>
                            <button className="text-purple-400 hover:text-purple-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Sparkles className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center text-[10px] text-slate-500">
                            <AlertCircle className="w-3 h-3 mr-1 text-purple-500/50" />
                            Required by: <span className="font-mono text-slate-400 ml-1">{policy.framework}</span>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-purple-500/10 hover:bg-purple-500/20 text-sm text-purple-400 py-2.5 rounded-lg border border-purple-500/30 transition-colors font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Auto-Generate Drafts with AI</span>
            </button>
        </div>
    );
}
