"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Building2 } from "lucide-react";

const data = [
    { name: "Tier 1 (Critical)", value: 18, color: "#ef4444" },
    { name: "Tier 2 (High)", value: 35, color: "#f97316" },
    { name: "Tier 3 (Medium)", value: 50, color: "#f59e0b" },
    { name: "Tier 4 (Low)", value: 39, color: "#10b981" },
];

export function VendorRiskDistributionWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Risk Distribution</h3>
                </div>
            </div>

            <div className="flex-1 min-h-0 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={50}
                            outerRadius={70}
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

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-100 pb-0.5">142</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">Vendors</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 mt-2 pt-3 shrink-0 border-t border-slate-800/50">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] text-slate-400 truncate">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
