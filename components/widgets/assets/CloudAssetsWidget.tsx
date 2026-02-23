"use client";

import React from "react";
import { Cloud, Server, Database, Globe } from "lucide-react";
import { cn } from "@/components/ui/Card";

export function CloudAssetsWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Cloud className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Cloud Footprint</h3>
                </div>
                <div className="flex space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-4">
                <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-xl flex items-center justify-between group hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                            <Server className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-slate-200">Compute Instances</span>
                            <span className="block text-xs text-slate-400">EC2 & Functions</span>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-slate-100">1,248</span>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-xl flex items-center justify-between group hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <Database className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-slate-200">Storage & RDS</span>
                            <span className="block text-xs text-slate-400">S3, Postgres, Dynamo</span>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-slate-100">412</span>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-xl flex items-center justify-between group hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <Globe className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-slate-200">Network Topology</span>
                            <span className="block text-xs text-slate-400">VPCs & Load Balancers</span>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-slate-100">86</span>
                </div>
            </div>
        </div>
    );
}
