"use client";

import React from "react";
import { Cloud, Flame } from "lucide-react";

const accounts = [
    { name: "aws-prod-main", id: "049382019382", score: 94, provider: "AWS" },
    { name: "aws-dev-sandbox", id: "593820938492", score: 62, provider: "AWS" },
    { name: "gcp-data-lake-01", id: "data-lake-pr", score: 88, provider: "GCP" },
    { name: "azure-eu-west", id: "sub-9283-abc", score: 75, provider: "Azure" },
];

export function TopCloudAccountsWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Cloud className="w-5 h-5 text-sky-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">At-Risk Accounts</h3>
                </div>
            </div>

            <div className="flex flex-col space-y-3 flex-1 justify-center">
                {accounts.sort((a, b) => a.score - b.score).map((acc, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex flex-col relative overflow-hidden group hover:bg-slate-800/40 transition-colors cursor-pointer">
                        <div className="flex justify-between items-center z-10">
                            <div className="flex items-center space-x-2">
                                {acc.score < 70 && <Flame className="w-4 h-4 text-orange-500 animate-pulse" />}
                                <span className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{acc.name}</span>
                            </div>
                            <span className="text-xs font-mono text-slate-300 font-bold">{acc.score}/100</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 z-10">
                            <span className="text-[10px] text-slate-500 font-mono">{acc.id}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">{acc.provider}</span>
                        </div>

                        {/* Background Progress Bar reflecting score inverted (lower is worse) */}
                        <div
                            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 opacity-50 transition-all duration-1000"
                            style={{ width: `${acc.score}%` }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
