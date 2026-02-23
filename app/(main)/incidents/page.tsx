"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    ActivitySquare, PhoneCall, AlertTriangle, ShieldCheck,
    Clock, Users, BookOpen, Timer, Flag, CheckCircle2,
    TrendingDown, Flame, FileText, Radio, ChevronRight
} from "lucide-react";
import { cn } from "@/components/ui/Card";

const incidentTimeline = [
    { id: "INC-2024-012", title: "Phishing Campaign Detected", severity: "P2", status: "Investigating", assignee: "SOC Team", time: "42 days ago", duration: "6h 14m", type: "Phishing" },
    { id: "INC-2024-011", title: "Unauthorized S3 Bucket Access", severity: "P1", status: "Resolved", assignee: "Cloud Security", time: "58 days ago", duration: "2h 31m", type: "Data Exposure" },
    { id: "INC-2024-010", title: "DDoS Attack on CDN Edge", severity: "P2", status: "Resolved", assignee: "Infra Team", time: "74 days ago", duration: "1h 47m", type: "DDoS" },
    { id: "INC-2024-009", title: "Credential Stuffing Attempt", severity: "P3", status: "Resolved", assignee: "Identity Team", time: "95 days ago", duration: "4h 02m", type: "Brute Force" },
    { id: "INC-2024-008", title: "Malware in CI Pipeline", severity: "P1", status: "Resolved", assignee: "DevSecOps", time: "112 days ago", duration: "8h 55m", type: "Supply Chain" },
];

const mttrData = [
    { month: "Jul", value: 340 },
    { month: "Aug", value: 285 },
    { month: "Sep", value: 310 },
    { month: "Oct", value: 220 },
    { month: "Nov", value: 195 },
    { month: "Dec", value: 174 },
];

const runbooks = [
    { name: "Ransomware Response", lastRun: "2024-10-15", steps: 24, owner: "CISO Office", status: "Active" },
    { name: "Data Breach Notification", lastRun: "2024-09-22", steps: 18, owner: "Legal + SecOps", status: "Active" },
    { name: "DDoS Mitigation", lastRun: "2024-11-01", steps: 12, owner: "Infra Team", status: "Active" },
    { name: "Insider Threat Protocol", lastRun: "2024-08-30", steps: 20, owner: "HR + Security", status: "Draft" },
    { name: "Supply Chain Compromise", lastRun: "Never", steps: 16, owner: "DevSecOps", status: "Draft" },
];

const tabletopExercises = [
    { scenario: "Ransomware: Encrypted Prod DB", date: "2025-01-15", participants: 12, score: 87, status: "Completed" },
    { scenario: "Zero-Day in Auth Service", date: "2025-02-28", participants: 8, score: null, status: "Scheduled" },
    { scenario: "Cloud Account Takeover", date: "2024-10-20", participants: 15, score: 72, status: "Completed" },
    { scenario: "Insider Data Exfiltration", date: "2025-03-15", participants: 10, score: null, status: "Scheduled" },
];

export default function IncidentsPage() {
    const maxMttr = Math.max(...mttrData.map(d => d.value));

    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <ActivitySquare className="w-8 h-8 mr-3 text-rose-500" />
                        Incident Response
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Active investigations, runbooks, and tabletop exercise logs.</p>
                </div>
                <button className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all flex items-center">
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Declare Incident
                </button>
            </div>

            {/* Status Banner */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between bg-gradient-to-r from-slate-900/80 to-slate-900/20">
                <div className="flex items-center space-x-6 mb-4 lg:mb-0">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100 mb-0.5">Zero Active Incidents</h2>
                        <p className="text-slate-400 text-sm">All systems are currently operating normally. Last incident was 42 days ago.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-8">
                    <div className="text-center">
                        <span className="block text-3xl font-black text-slate-100 tracking-tighter">142</span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Days Since P1</span>
                    </div>
                    <div className="text-center">
                        <span className="block text-3xl font-black text-emerald-400 tracking-tighter">2.9h</span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Avg MTTR</span>
                    </div>
                    <div className="text-center">
                        <span className="block text-3xl font-black text-slate-100 tracking-tighter">47</span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Total YTD</span>
                    </div>
                </div>
            </div>

            {/* Row 2: MTTR Trend + Severity Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* MTTR Trend */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800/50 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-2">
                            <Timer className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-semibold text-slate-100">Mean Time to Resolve (MTTR)</h3>
                        </div>
                        <div className="flex items-center space-x-1 text-emerald-400 text-xs font-medium">
                            <TrendingDown className="w-3.5 h-3.5" /> -49% YoY
                        </div>
                    </div>
                    <div className="flex-1 flex items-end space-x-3 min-h-[160px] px-2">
                        {mttrData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center space-y-2">
                                <div className="w-full flex justify-center" style={{ height: "140px" }}>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(d.value / maxMttr) * 100}%` }}
                                        transition={{ duration: 0.6, delay: i * 0.1 }}
                                        className="w-full max-w-[40px] bg-blue-500/20 rounded-t-lg border border-blue-500/20 relative group cursor-pointer hover:bg-blue-500/30 transition-colors"
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-blue-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">
                                            {Math.round(d.value / 60)}h {d.value % 60}m
                                        </div>
                                    </motion.div>
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Incident Severity Distribution */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/50 flex flex-col">
                    <div className="flex items-center space-x-2 mb-5">
                        <Flag className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-semibold text-slate-100">By Severity (YTD)</h3>
                    </div>
                    <div className="flex flex-col space-y-4 flex-1 justify-center">
                        {[
                            { label: "P1 — Critical", count: 3, pct: 6, color: "bg-red-500" },
                            { label: "P2 — High", count: 11, pct: 23, color: "bg-orange-500" },
                            { label: "P3 — Medium", count: 22, pct: 47, color: "bg-amber-500" },
                            { label: "P4 — Low", count: 11, pct: 24, color: "bg-emerald-500" },
                        ].map((s, i) => (
                            <div key={i} className="flex flex-col space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-300 font-medium">{s.label}</span>
                                    <span className="text-slate-500">{s.count}</span>
                                </div>
                                <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${s.pct}%` }}
                                        transition={{ duration: 0.6, delay: i * 0.1 }}
                                        className={cn("h-full rounded-full", s.color)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 3: Recent Investigations Timeline */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/50 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center space-x-2">
                        <Radio className="w-5 h-5 text-rose-400" />
                        <h3 className="text-lg font-semibold text-slate-100">Recent Investigations</h3>
                    </div>
                    <button className="text-xs text-slate-400 hover:text-slate-200 flex items-center transition-colors">View All <ChevronRight className="w-3 h-3 ml-1" /></button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900/40">
                            <tr>
                                <th className="px-4 py-3 font-medium rounded-tl-lg">Incident</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">Severity</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Assignee</th>
                                <th className="px-4 py-3 font-medium">Duration</th>
                                <th className="px-4 py-3 font-medium rounded-tr-lg">Occurred</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {incidentTimeline.map((inc) => (
                                <tr key={inc.id} className="hover:bg-slate-800/30 transition-colors group cursor-pointer">
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-mono text-slate-500">{inc.id}</span>
                                            <span className="text-sm font-medium text-slate-200 group-hover:text-rose-400 transition-colors">{inc.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3"><span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">{inc.type}</span></td>
                                    <td className="px-4 py-3">
                                        <span className={cn(
                                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded border",
                                            inc.severity === "P1" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                inc.severity === "P2" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        )}>{inc.severity}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={cn(
                                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded border flex items-center w-max gap-1",
                                            inc.status === "Resolved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                        )}>
                                            {inc.status === "Resolved" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {inc.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-300">{inc.assignee}</td>
                                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{inc.duration}</td>
                                    <td className="px-4 py-3 text-xs text-slate-500">{inc.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Row 4: Runbooks + Tabletop Exercises */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Runbooks */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/50 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-lg font-semibold text-slate-100">Runbook Library</h3>
                        </div>
                        <button className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">+ New Runbook</button>
                    </div>
                    <div className="flex flex-col space-y-3 flex-1">
                        {runbooks.map((r, i) => (
                            <div key={i} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex items-center justify-between group hover:bg-slate-800/40 transition-colors cursor-pointer">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">{r.name}</span>
                                    <div className="flex items-center space-x-3 mt-1 text-[10px] text-slate-500">
                                        <span>{r.steps} steps</span>
                                        <span>{r.owner}</span>
                                        <span>Last run: {r.lastRun}</span>
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded border",
                                    r.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                        "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                )}>{r.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabletop Exercises */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/50 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-2">
                            <Flame className="w-5 h-5 text-amber-400" />
                            <h3 className="text-lg font-semibold text-slate-100">Tabletop Exercises</h3>
                        </div>
                        <button className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Schedule New</button>
                    </div>
                    <div className="flex flex-col space-y-3 flex-1">
                        {tabletopExercises.map((ex, i) => (
                            <div key={i} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex items-center justify-between group hover:bg-slate-800/40 transition-colors cursor-pointer">
                                <div className="flex flex-col flex-1 mr-3">
                                    <span className="text-sm font-medium text-slate-200 group-hover:text-amber-400 transition-colors">{ex.scenario}</span>
                                    <div className="flex items-center space-x-3 mt-1 text-[10px] text-slate-500">
                                        <span className="flex items-center"><Users className="w-2.5 h-2.5 mr-0.5" />{ex.participants}</span>
                                        <span className="flex items-center"><Clock className="w-2.5 h-2.5 mr-0.5" />{ex.date}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {ex.score !== null && (
                                        <span className={cn(
                                            "text-sm font-bold",
                                            ex.score >= 80 ? "text-emerald-400" : "text-amber-400"
                                        )}>{ex.score}%</span>
                                    )}
                                    <span className={cn(
                                        "text-[10px] uppercase font-bold px-2 py-0.5 rounded border",
                                        ex.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                            "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                    )}>{ex.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
