"use client";

import React from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis, RadialBarChart, RadialBar, Cell, BarChart, Bar, CartesianGrid, Treemap } from "recharts";

const getMult = (f?: string) => f === 'iso27001' ? 1.2 : f === 'dpd' ? 0.8 : 1;

// -------------------------
// 1. Radar Chart (Category Strength)
// -------------------------
const RADAR_DATA = [
    { subject: 'Access Policy', A: 120, B: 110, fullMark: 150 },
    { subject: 'Data Encryption', A: 98, B: 130, fullMark: 150 },
    { subject: 'Incident Response', A: 86, B: 130, fullMark: 150 },
    { subject: 'Endpoint Sec', A: 99, B: 100, fullMark: 150 },
    { subject: 'Network Sec', A: 85, B: 90, fullMark: 150 },
    { subject: 'Risk Assessment', A: 65, B: 85, fullMark: 150 },
];

export function RadarWidget({ frameworkId = "soc2" }: { frameworkId?: string }) {
    const data = React.useMemo(() => RADAR_DATA.map(d => ({ ...d, A: Math.min(150, d.A * getMult(frameworkId)) })), [frameworkId]);
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-slate-400 self-start mb-2">Category Strength Analysis</h3>
            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar name="Current" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                        <Radar name="Target" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                        <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// -------------------------
// 2. Area Chart (Timeline Progress)
// -------------------------
const AREA_DATA = [
    { name: 'W1', score: 40, risk: 80 },
    { name: 'W2', score: 45, risk: 75 },
    { name: 'W3', score: 55, risk: 60 },
    { name: 'W4', score: 70, risk: 45 },
    { name: 'W5', score: 85, risk: 20 },
    { name: 'W6', score: 92, risk: 10 },
];

export function TimelineWidget({ frameworkId = "soc2" }: { frameworkId?: string }) {
    const data = React.useMemo(() => AREA_DATA.map(d => ({ ...d, score: Math.min(100, d.score * getMult(frameworkId)) })), [frameworkId]);
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
            <h3 className="text-sm font-semibold text-slate-400 mb-4">Historical Progress vs Risk</h3>
            <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                        <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// -------------------------
// 3. Scatter Plot (Risk Array)
// -------------------------
const SCATTER_DATA = [
    { x: 10, y: 30, z: 200, name: 'Access Control' },
    { x: 30, y: 200, z: 260, name: 'Encryption' },
    { x: 45, y: 100, z: 400, name: 'Logging' },
    { x: 50, y: 400, z: 280, name: 'Vendors' },
    { x: 70, y: 150, z: 500, name: 'Network' },
    { x: 100, y: 250, z: 200, name: 'Endpoint' },
];

export function ScatterWidget({ frameworkId = "soc2" }: { frameworkId?: string }) {
    const data = React.useMemo(() => SCATTER_DATA.map(d => ({ ...d, x: Math.min(100, d.x * getMult(frameworkId)) })), [frameworkId]);
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Risk Impact Mapping</h3>
            <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <XAxis type="number" dataKey="x" name="Probability" hide />
                        <YAxis type="number" dataKey="y" name="Impact" hide />
                        <ZAxis type="number" dataKey="z" range={[60, 400]} name="Density" />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3', stroke: '#334155' }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                            itemStyle={{ color: '#94a3b8' }}
                        />
                        <Scatter name="Controls" data={data} fill="#f59e0b" shape="circle">
                            {SCATTER_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#f97316" : "#eab308"} className="drop-shadow-lg opacity-80 hover:opacity-100 transition-opacity" />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// -------------------------
// 4. Radial Bar (Sub-framework metrics)
// -------------------------
const RADIAL_DATA = [
    { name: 'CC1', uv: 31, fill: '#1e293b' },
    { name: 'CC2', uv: 26, fill: '#3b82f6' },
    { name: 'CC3', uv: 15, fill: '#60a5fa' },
    { name: 'CC4', uv: 15, fill: '#93c5fd' },
    { name: 'CC5', uv: 100, fill: '#10b981' },
];
export function RadialWidget({ frameworkId = "soc2" }: { frameworkId?: string }) {
    const data = React.useMemo(() => RADIAL_DATA.map(d => ({ ...d, uv: Math.min(100, d.uv * getMult(frameworkId)) })), [frameworkId]);
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center">
            <h3 className="text-sm font-semibold text-slate-400 self-start mb-2">Sub-domain Velocity</h3>
            <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={8} data={data}>
                        <RadialBar background={{ fill: '#0f172a' }} dataKey="uv" cornerRadius={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// -------------------------
// 5. Gauge / Simplified Chart
// -------------------------
export function GaugeWidget({ frameworkId = "soc2" }: { frameworkId?: string }) {
    const percent = Math.min(100, Math.round(82 * getMult(frameworkId)));
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center items-center relative">
            <div className="absolute top-6 left-6 text-sm font-semibold text-slate-400">Readiness</div>

            <svg className="w-32 h-32" viewBox="0 0 100 100">
                <path d="M 20 80 A 40 40 0 1 1 80 80" fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
                <motion.path
                    d="M 20 80 A 40 40 0 1 1 80 80"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray="188"
                    initial={{ strokeDashoffset: 188 }}
                    animate={{ strokeDashoffset: 188 - (188 * percent) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%] text-center">
                <span className="text-3xl font-bold text-slate-100">{percent}</span><span className="text-sm text-slate-500">%</span>
            </div>
        </div>
    );
}

// -------------------------
// 6. Bar Chart (Category Breakdown)
// -------------------------
const BAR_DATA = [
    { name: 'CC1', val: 400 },
    { name: 'CC2', val: 300 },
    { name: 'CC3', val: 200 },
    { name: 'CC4', val: 278 },
    { name: 'CC5', val: 189 },
];
export function BarWidget({ frameworkId = "soc2" }: { frameworkId?: string }) {
    const data = React.useMemo(() => BAR_DATA.map(d => ({ ...d, val: d.val * getMult(frameworkId) })), [frameworkId]);
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
            <h3 className="text-sm font-semibold text-slate-400 mb-4">Category Issues</h3>
            <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: '#0f172a' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                        <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// -------------------------
// 7. Treemap (Subcategory distribution)
// -------------------------
const TREE_DATA = [
    { name: 'Logical', size: 1400 },
    { name: 'Physical', size: 2300 },
    { name: 'Policy', size: 1800 },
    { name: 'Vendors', size: 500 },
    { name: 'Network', size: 800 },
];
export function TreemapWidget({ frameworkId = "soc2" }: { frameworkId?: string }) {
    const data = React.useMemo(() => TREE_DATA.map(d => ({ ...d, size: d.size * getMult(frameworkId) })), [frameworkId]);
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative col-span-1 md:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold text-slate-400 absolute top-6 left-6 z-10">Control Distribution</h3>
            <div className="w-full h-56 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                        data={data}
                        dataKey="size"
                        stroke="#020617"
                        fill="#3b82f6"
                    >
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                    </Treemap>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
