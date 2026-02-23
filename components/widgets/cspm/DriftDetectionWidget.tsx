"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

const data = [
    { name: "Mon", drift: 2, resolved: 0 },
    { name: "Tue", drift: 5, resolved: 2 },
    { name: "Wed", drift: 12, resolved: 8 },
    { name: "Thu", drift: 15, resolved: 14 },
    { name: "Fri", drift: 8, resolved: 7 },
    { name: "Sat", drift: 3, resolved: 3 },
    { name: "Sun", drift: 1, resolved: 1 },
];

export function DriftDetectionWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-6 pb-2">
                <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">IaC Drift Detection</h3>
                </div>
                <div className="text-xs font-mono text-amber-500 bg-amber-500/10 px-2 py-1 rounded">Past 7 Days</div>
            </div>

            <div className="flex-1 w-full min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorDrift" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }}
                            itemStyle={{ color: "#e2e8f0" }}
                        />
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <Area type="monotone" dataKey="drift" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDrift)" />
                        <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex justify-between items-center text-sm pt-4 border-t border-slate-800/50">
                <span className="text-slate-400 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2" /> Diffs Detected
                </span>
                <span className="text-slate-400 flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2" /> Auto-remediated
                </span>
            </div>
        </div>
    );
}
