"use client";

import React, { useState } from "react";
import { BookOpen, MoreVertical, PlayCircle, Award, Clock } from "lucide-react";
import { cn } from "@/components/ui/Card";

const courses = [
    { id: "SEC-101", title: "Information Security Fundamentals", duration: "45m", completion: 98, status: "Mandatory" },
    { id: "PHISH-2X", title: "Advanced Spear Phishing Defense", duration: "20m", completion: 64, status: "Active" },
    { id: "PRIV-11", title: "Data Privacy & GDPR Handling", duration: "60m", completion: 82, status: "Mandatory" },
    { id: "DEV-SEC", title: "Secure Coding (OWASP Top 10)", duration: "120m", completion: 45, status: "Optional" },
];

export function CourseGridWidget() {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    return (
        <div className="glass-panel rounded-2xl border border-slate-800/50 flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/40">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Active Training Modules</h3>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800/80 bg-slate-900/20">
                            <th className="py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Module Title</th>
                            <th className="py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                            <th className="py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Duration</th>
                            <th className="py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[150px]">Completion progress</th>
                            <th className="py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {courses.map((c) => (
                            <tr
                                key={c.id}
                                onMouseEnter={() => setHoveredRow(c.id)}
                                onMouseLeave={() => setHoveredRow(null)}
                                className="group hover:bg-slate-800/30 transition-colors cursor-default"
                            >
                                <td className="py-4 px-6">
                                    <div className="flex items-center space-x-3">
                                        <PlayCircle className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-200">{c.title}</span>
                                            <span className="text-xs font-mono text-slate-500">{c.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={cn(
                                        "inline-flex items-center px-2 py-1 rounded text-xs font-medium border",
                                        c.status === "Mandatory" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                            c.status === "Optional" ? "bg-slate-800 text-slate-300 border-slate-700" :
                                                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    )}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-slate-400 flex items-center">
                                    <Clock className="w-3 h-3 mr-1.5 opacity-50" />
                                    {c.duration}
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full", c.completion >= 90 ? "bg-emerald-500" : c.completion >= 60 ? "bg-amber-500" : "bg-red-500")}
                                                style={{ width: `${c.completion}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-mono text-slate-300 w-8">{c.completion}%</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className={cn(
                                        "flex items-center justify-end space-x-2 transition-opacity duration-200",
                                        hoveredRow === c.id ? "opacity-100" : "opacity-0"
                                    )}>
                                        <button className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"><Award className="w-4 h-4" /></button>
                                        <button className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"><MoreVertical className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
