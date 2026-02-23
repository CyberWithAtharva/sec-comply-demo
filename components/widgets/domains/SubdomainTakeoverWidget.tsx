"use client";

import React from "react";
import { ServerCrash, Cpu, CloudRain } from "lucide-react";

const risks = [
    { target: "assets.omniguard.app", cname: "ghs.googlehosted.com", provider: "GCP", severity: "critical" },
    { target: "blog.omniguard.app", cname: "omniguard.zendesk.com", provider: "Zendesk", severity: "high" },
    { target: "old-api.omniguard.app", cname: "ec2-192-x.aws.com", provider: "AWS", severity: "high" },
];

export function SubdomainTakeoverWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <ServerCrash className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Dangling DNS Risks</h3>
                </div>
                <span className="text-xs font-mono text-red-500 bg-red-500/10 px-2 py-1 rounded">Action Required</span>
            </div>

            <div className="flex flex-col space-y-3 flex-1 justify-center">
                <p className="text-xs text-slate-400 mb-2">Vulnerable CNAMEs pointing to unclaimed external resources.</p>
                {risks.map((risk, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex flex-col group hover:bg-slate-800/40 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-medium text-slate-200 group-hover:text-red-400 transition-colors">{risk.target}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">{risk.severity}</span>
                        </div>
                        <div className="flex items-center text-[10px] text-slate-500 bg-slate-900/50 p-1.5 rounded-lg border border-slate-800/50">
                            <span className="text-slate-400 mr-1">CNAME:</span> {risk.cname}
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-sm font-medium text-red-400 py-2.5 rounded-lg border border-red-500/20 transition-colors">
                Remediate DNS Records
            </button>
        </div>
    );
}
