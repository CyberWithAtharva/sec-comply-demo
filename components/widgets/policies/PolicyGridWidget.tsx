"use client";

import React, { useState } from "react";
import { FileText, MoreVertical, Download, ExternalLink, ShieldCheck, ShieldAlert, History } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

const policies = [
    { id: "POL-001", title: "Information Security Policy", status: "Approved", version: "v2.4", date: "Oct 12, 2025", owner: "Security Team" },
    { id: "POL-002", title: "Acceptable Use Policy", status: "Review", version: "v1.9", date: "Sep 01, 2025", owner: "HR" },
    { id: "POL-003", title: "Incident Response Plan", status: "Outdated", version: "v3.0", date: "Jan 15, 2025", owner: "DevSecOps" },
    { id: "POL-004", title: "Data Classification Policy", status: "Approved", version: "v1.2", date: "Nov 05, 2025", owner: "Data Privacy" },
    { id: "POL-005", title: "Vendor Risk Management", status: "Approved", version: "v2.1", date: "Aug 20, 2025", owner: "Procurement" },
    { id: "POL-006", title: "Access Control Policy", status: "Review", version: "v4.5", date: "Jul 11, 2025", owner: "IT Ops" },
];

export function PolicyGridWidget() {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    return (
        <div className="glass-panel rounded-2xl border border-border/50 flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-card/40">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Governance Documents</h3>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border/80 bg-card/20">
                            <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Document Title</th>
                            <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                            <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Version</th>
                            <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Updated</th>
                            <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner</th>
                            <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {policies.map((p) => (
                            <tr
                                key={p.id}
                                onMouseEnter={() => setHoveredRow(p.id)}
                                onMouseLeave={() => setHoveredRow(null)}
                                className="group hover:bg-secondary/30 transition-colors cursor-default"
                            >
                                <td className="py-4 px-6 relative">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-foreground">{p.title}</span>
                                            <span className="text-xs font-mono text-muted-foreground">{p.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={cn(
                                        "inline-flex items-center px-2 py-1 rounded text-xs font-medium border",
                                        p.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                            p.status === "Review" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                "bg-red-500/10 text-red-400 border-red-500/20"
                                    )}>
                                        {p.status === "Approved" && <ShieldCheck className="w-3 h-3 mr-1" />}
                                        {p.status === "Review" && <History className="w-3 h-3 mr-1" />}
                                        {p.status === "Outdated" && <ShieldAlert className="w-3 h-3 mr-1" />}
                                        {p.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-muted-foreground font-mono">{p.version}</td>
                                <td className="py-4 px-6 text-sm text-muted-foreground">{p.date}</td>
                                <td className="py-4 px-6 text-sm text-muted-foreground">{p.owner}</td>
                                <td className="py-4 px-6 text-right">
                                    <div className={cn(
                                        "flex items-center justify-end space-x-2 transition-opacity duration-200",
                                        hoveredRow === p.id ? "opacity-100" : "opacity-0"
                                    )}>
                                        <Button variant="plain" size="icon-sm" className="text-muted-foreground hover:text-blue-400"><Download className="w-4 h-4" /></Button>
                                        <Button variant="plain" size="icon-sm" className="text-muted-foreground hover:text-blue-400"><ExternalLink className="w-4 h-4" /></Button>
                                        <Button variant="plain" size="icon-sm" className="text-muted-foreground hover:text-foreground"><MoreVertical className="w-4 h-4" /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-border/50 bg-card/20 flex items-center justify-between text-sm text-muted-foreground">
                <span>Showing 1 to 6 of 24 documents</span>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="h-auto px-3 py-1">Prev</Button>
                    <Button variant="outline" size="sm" className="h-auto px-3 py-1">Next</Button>
                </div>
            </div>
        </div>
    );
}
