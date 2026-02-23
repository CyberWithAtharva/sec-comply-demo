"use client";

import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { CloudCog } from "lucide-react";

const data = [
    { subject: 'IAM', AWS: 100, Azure: 85, GCP: 90 },
    { subject: 'Network', AWS: 90, Azure: 70, GCP: 85 },
    { subject: 'Compute', AWS: 85, Azure: 90, GCP: 80 },
    { subject: 'Storage', AWS: 95, Azure: 95, GCP: 100 },
    { subject: 'DB', AWS: 80, Azure: 75, GCP: 85 },
    { subject: 'K8s', AWS: 70, Azure: 60, GCP: 95 },
];

export function MultiCloudPostureWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <CloudCog className="w-5 h-5 text-sky-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Multi-Cloud Posture</h3>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#1e293b" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="AWS" dataKey="AWS" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                        <Radar name="Azure" dataKey="Azure" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                        <Radar name="GCP" dataKey="GCP" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }}
                            itemStyle={{ color: "#e2e8f0" }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
