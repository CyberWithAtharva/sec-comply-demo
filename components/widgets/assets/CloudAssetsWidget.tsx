"use client";

import React from "react";
import { Cloud, Server, Database, Globe } from "lucide-react";
import { cn } from "@/components/ui/Card";

export function CloudAssetsWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Cloud className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Cloud Footprint</h3>
                </div>
                <div className="flex space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground font-mono">Live Sync</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-4">
                <div className="bg-card/40 border border-border/50 p-4 rounded-xl flex items-center justify-between group hover:bg-secondary/40 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                            <Server className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-foreground">Compute Instances</span>
                            <span className="block text-xs text-muted-foreground">EC2 & Functions</span>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-foreground">1,248</span>
                </div>

                <div className="bg-card/40 border border-border/50 p-4 rounded-xl flex items-center justify-between group hover:bg-secondary/40 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <Database className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-foreground">Storage & RDS</span>
                            <span className="block text-xs text-muted-foreground">S3, Postgres, Dynamo</span>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-foreground">412</span>
                </div>

                <div className="bg-card/40 border border-border/50 p-4 rounded-xl flex items-center justify-between group hover:bg-secondary/40 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <Globe className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-foreground">Network Topology</span>
                            <span className="block text-xs text-muted-foreground">VPCs & Load Balancers</span>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-foreground">86</span>
                </div>
            </div>
        </div>
    );
}
