"use client";

import React from "react";
import { Server, Database, Globe, Box, Cpu, HardDrive } from "lucide-react";
import { cn } from "@/components/ui/Card";

const inventory = [
    { type: "Compute Instances", count: 342, provider: "AWS", icon: Server, color: "text-amber-400" },
    { type: "Relational DBs", count: 85, provider: "GCP", icon: Database, color: "text-blue-400" },
    { type: "Storage Buckets", count: 120, provider: "AWS", icon: HardDrive, color: "text-emerald-400" },
    { type: "Load Balancers", count: 42, provider: "Azure", icon: Globe, color: "text-sky-400" },
    { type: "Serverless Funcs", count: 489, provider: "AWS", icon: Cpu, color: "text-purple-400" },
    { type: "Containers", count: 1250, provider: "GCP", icon: Box, color: "text-pink-400" },
];

export function ResourceInventoryWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Server className="w-5 h-5 text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Resource Inventory</h3>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {inventory.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 hover:bg-slate-800/40 transition-colors flex items-center space-x-3">
                        <div className={cn("p-2 rounded-lg bg-slate-800", item.color)}>
                            <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-slate-200 leading-none">{item.count}</span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{item.type}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
