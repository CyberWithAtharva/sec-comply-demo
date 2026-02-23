"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

const data = [
    { name: 'W1', issues: 124, resolved: 40 },
    { name: 'W2', issues: 110, resolved: 65 },
    { name: 'W3', issues: 95, resolved: 80 },
    { name: 'W4', issues: 80, resolved: 110 },
    { name: 'W5', issues: 50, resolved: 145 },
    { name: 'W6', issues: 30, resolved: 180 },
];

export function BurnRateChart() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-6 pb-2">
                <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Remediation Velocity</h3>
                </div>
                <div className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">280% Sprint ↑</div>
            </div>

            <div className="flex-1 w-full min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }}
                            itemStyle={{ color: "#e2e8f0" }}
                        />
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
                        <Area type="monotone" dataKey="issues" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorIssues)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex justify-between items-center text-sm pt-4 border-t border-slate-800/50">
                <span className="text-slate-400 flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2" /> Resolved Controls
                </span>
                <span className="text-slate-400 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2" /> Open Vulnerabilities
                </span>
            </div>
        </div>
    );
}
