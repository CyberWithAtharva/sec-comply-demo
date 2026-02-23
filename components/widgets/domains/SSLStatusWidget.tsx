"use client";

import React from "react";
import { Lock, ShieldAlert, ShieldCheck, Shield } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts";

const data = [
    { name: "Valid TLS 1.3", value: 142, color: "#10b981" },
    { name: "Expiring <30d", value: 12, color: "#f59e0b" },
    { name: "Expired/Invalid", value: 3, color: "#ef4444" },
];

export function SSLStatusWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">SSL/TLS Health</h3>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[180px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={55}
                            outerRadius={75}
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
                    <span className="text-2xl font-bold text-slate-100 pb-1">157</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">Certs</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 mt-2 pt-4 border-t border-slate-800/50">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/30">
                        <div className="flex items-center space-x-2">
                            {item.color === "#10b981" ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> :
                                item.color === "#f59e0b" ? <Shield className="w-4 h-4 text-amber-500" /> :
                                    <ShieldAlert className="w-4 h-4 text-red-500" />}
                            <span className="text-xs text-slate-300 font-medium">{item.name}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
