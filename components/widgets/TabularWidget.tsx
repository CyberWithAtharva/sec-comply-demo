"use client";

import React from "react";
import { cn } from "../ui/Card";

export interface ControlRow {
    id: string;
    controlId: string;
    title: string;
    status: string;
    domain: string;
}

interface TabularWidgetProps {
    frameworkId?: string;
    controls?: ControlRow[];
}

function getStatusDisplay(status: string): { label: string; classes: string } {
    switch (status) {
        case "verified":
            return { label: "Verified", classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
        case "in_progress":
            return { label: "In Progress", classes: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
        case "not_applicable":
            return { label: "N/A", classes: "bg-slate-600/20 text-slate-400 border-slate-500/20" };
        default:
            return { label: "Not Started", classes: "bg-slate-500/10 text-slate-400 border-slate-500/20" };
    }
}

function domainToSeverity(domain: string): "High" | "Medium" | "Low" {
    const d = domain.toLowerCase();
    if (d.includes("access") || d.includes("security") || d.includes("incident") || d.includes("crypt")) return "High";
    if (d.includes("change") || d.includes("vendor") || d.includes("risk") || d.includes("monitor")) return "Medium";
    return "Low";
}

export function TabularWidget({ controls }: TabularWidgetProps) {
    // Sort: not started first (gaps), then in progress, then verified
    const sorted = [...(controls ?? [])].sort((a, b) => {
        const order: Record<string, number> = { not_started: 0, in_progress: 1, verified: 2, not_applicable: 3 };
        return (order[a.status] ?? 0) - (order[b.status] ?? 0);
    });
    const displayControls = sorted.slice(0, 8);

    return (
        <div className="glass-panel rounded-2xl overflow-hidden col-span-full xl:col-span-2 border border-slate-800/50">
            <div className="p-5 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/20">
                <h3 className="font-semibold text-slate-100">Controls Status</h3>
                <span className="text-xs text-slate-500 font-mono">{controls?.length ?? 0} total</span>
            </div>
            {displayControls.length === 0 ? (
                <div className="px-6 py-10 text-center text-slate-500 text-sm">
                    No controls data available.
                </div>
            ) : (
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-xs text-slate-500 font-mono uppercase bg-slate-900/40">
                            <tr>
                                <th className="px-6 py-3 font-medium">Control ID</th>
                                <th className="px-6 py-3 font-medium">Description</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Priority</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {displayControls.map((row) => {
                                const { label, classes } = getStatusDisplay(row.status);
                                const severity = domainToSeverity(row.domain);
                                return (
                                    <tr key={row.id} className="hover:bg-slate-800/20 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4 font-mono text-slate-300 group-hover:text-blue-400 transition-colors text-xs">{row.controlId}</td>
                                        <td className="px-6 py-4 text-slate-200 max-w-[200px] truncate" title={row.title}>{row.title}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded border", classes)}>
                                                {label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                                <div className={cn("w-1.5 h-1.5 rounded-full", severity === "High" ? "bg-red-500" : severity === "Medium" ? "bg-amber-500" : "bg-emerald-500")} />
                                                <span className="text-xs">{severity}</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
