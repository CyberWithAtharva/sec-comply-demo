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
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Server className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Resource Inventory</h3>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {inventory.map((item, idx) => (
                    <div key={idx} className="p-3 bg-card/40 rounded-xl border border-border/50 hover:bg-secondary/40 transition-colors flex items-center space-x-3">
                        <div className={cn("p-2 rounded-lg bg-secondary", item.color)}>
                            <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-foreground leading-none">{item.count}</span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">{item.type}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
