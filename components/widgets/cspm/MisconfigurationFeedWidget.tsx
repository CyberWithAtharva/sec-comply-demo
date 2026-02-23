"use client";

import React from "react";
import { AlertCircle, ServerCrash, ShieldX, Unlock } from "lucide-react";
import { cn } from "@/components/ui/Card";

const alerts = [
    { id: "ALR-842", type: "s3", msg: "S3 Bucket 'customer-backups-prd' has public Read ACL", time: "2m ago", severity: "critical" },
    { id: "ALR-841", type: "iam", msg: "Root user logged in without MFA (AWS Prod)", time: "15m ago", severity: "high" },
    { id: "ALR-840", type: "sg", msg: "Security Group 'sg-web-01' allows 0.0.0.0/0 on port 22", time: "1h ago", severity: "high" },
    { id: "ALR-839", type: "rds", msg: "RDS Instance 'db-analytics' missing encryption at rest", time: "3h ago", severity: "medium" },
];

export function MisconfigurationFeedWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Live Misconfigurations</h3>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                {alerts.map((alert) => (
                    <div key={alert.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex space-x-3 group cursor-pointer hover:bg-slate-800/40 transition-colors">
                        <div className="mt-0.5">
                            {alert.severity === "critical" ? (
                                <ServerCrash className="w-4 h-4 text-red-500" />
                            ) : alert.severity === "high" ? (
                                <ShieldX className="w-4 h-4 text-orange-400" />
                            ) : (
                                <Unlock className="w-4 h-4 text-amber-400" />
                            )}
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-sm text-slate-200 leading-snug group-hover:text-sky-400 transition-colors">{alert.msg}</span>
                            <div className="flex items-center justify-between mt-1">
                                <span className={cn(
                                    "text-[10px] uppercase font-bold tracking-wider",
                                    alert.severity === "critical" ? "text-red-500" : alert.severity === "high" ? "text-orange-400" : "text-amber-400"
                                )}>
                                    {alert.severity} Risk
                                </span>
                                <span className="text-[10px] text-slate-500">{alert.time}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="text-xs text-slate-400 hover:text-sky-400 mt-4 text-center font-medium transition-colors">
                View All Findings →
            </button>
        </div>
    );
}
