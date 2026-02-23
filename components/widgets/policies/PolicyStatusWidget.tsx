"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { FileText } from "lucide-react";

const data = [
    { name: "Approved", value: 18, color: "#10b981" },
    { name: "Needs Review", value: 4, color: "#f59e0b" },
    { name: "Outdated", value: 2, color: "#ef4444" },
];

export function PolicyStatusWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Policy Status</h3>
                </div>
                <div className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded">24 Total</div>
            </div>

            <div className="flex-1 w-full min-h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }}
                            itemStyle={{ color: "#e2e8f0" }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-slate-100 pb-2">75%</span>
                    <span className="text-xs text-slate-500 font-medium">Approved</span>
                </div>
            </div>
        </div>
    );
}
