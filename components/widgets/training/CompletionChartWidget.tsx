"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

const data = [
    { name: "Jan", completed: 45, enrolled: 50 },
    { name: "Feb", completed: 80, enrolled: 95 },
    { name: "Mar", completed: 120, enrolled: 125 },
    { name: "Apr", completed: 180, enrolled: 190 },
    { name: "May", completed: 210, enrolled: 220 },
    { name: "Jun", completed: 250, enrolled: 255 },
];

export function CompletionChartWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-6 pb-2">
                <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Cumulative Completions</h3>
                </div>
                <div className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">98% Avg</div>
            </div>

            <div className="flex-1 w-full min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorEnrolled" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }}
                            itemStyle={{ color: "#e2e8f0" }}
                        />
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                        <Area type="monotone" dataKey="enrolled" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorEnrolled)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex justify-between items-center text-sm pt-4 border-t border-slate-800/50">
                <span className="text-slate-400 flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2" /> Completed
                </span>
                <span className="text-slate-400 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" /> Total Enrolled
                </span>
            </div>
        </div>
    );
}
