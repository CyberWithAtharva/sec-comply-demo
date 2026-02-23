"use client";

import React from "react";
import { AlertOctagon, ExternalLink } from "lucide-react";
import { cn } from "@/components/ui/Card";

const criticalVendors = [
    { name: "CloudHost Pro", service: "Primary Hosting", score: 42, threat: "Unpatched CVE-2024", trend: "down" },
    { name: "PayGateway Inc", service: "Payment Processing", score: 58, threat: "SOC2 Expired", trend: "down" },
    { name: "DataSync Solutions", service: "CRM Integration", score: 65, threat: "Open Data Port", trend: "up" },
];

export function TopVendorRisksWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <AlertOctagon className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Critical Watchlist</h3>
                </div>
            </div>

            <div className="flex flex-col space-y-3 flex-1 justify-center">
                {criticalVendors.map((vendor, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex flex-col group hover:bg-slate-800/40 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-200 group-hover:text-indigo-400 transition-colors flex items-center">
                                    {vendor.name}
                                    <ExternalLink className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </span>
                                <span className="text-[11px] text-slate-500">{vendor.service}</span>
                            </div>
                            <span className={cn(
                                "text-xs font-mono font-bold px-2 py-0.5 rounded",
                                vendor.score < 50 ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                            )}>
                                {vendor.score}/100
                            </span>
                        </div>
                        <div className="flex items-center text-[10px] text-slate-400 bg-slate-900/50 p-1.5 rounded-lg border border-slate-800/50">
                            <span className="text-red-400 mr-1 min-w-[50px]">Risk:</span> {vendor.threat}
                        </div>
                    </div>
                ))}
            </div>

            <button className="text-xs text-indigo-400 hover:text-indigo-300 mt-4 text-center font-medium transition-colors">
                View Risk Mitigation Plans →
            </button>
        </div>
    );
}
