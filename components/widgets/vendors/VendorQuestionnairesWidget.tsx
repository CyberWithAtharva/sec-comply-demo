"use client";

import React from "react";
import { FileQuestion, CheckCircle2, Clock, XCircle, Send } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

const assessments = [
    { vendor: "Logistics Global", type: "SIG-Core", status: "completed", date: "Oct 12", score: 92 },
    { vendor: "HR Platform X", type: "Custom Privacy", status: "pending", date: "Sent 3d ago", score: null },
    { vendor: "Marketing AI", type: "SOC2 Type II", status: "reviewing", date: "Under Audit", score: null },
    { vendor: "DevTools Inc", type: "VSAQ", status: "overdue", date: "Due Sep 30", score: null },
];

export function VendorQuestionnairesWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <FileQuestion className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Assessment Pipeline</h3>
                </div>
                <Button variant="plain" size="sm" className="h-auto px-2 py-1 text-xs text-indigo-400 hover:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded border border-indigo-500/20">
                    <Send className="w-3 h-3 mr-1" />
                    Send New
                </Button>
            </div>

            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-border/50">
                        {assessments.map((a, i) => (
                            <tr key={i} className="group hover:bg-secondary/30 transition-colors">
                                <td className="py-3 px-2">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">{a.vendor}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">{a.type}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-2 text-right">
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center space-x-1">
                                            {a.status === "completed" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                                            {a.status === "pending" && <Clock className="w-3 h-3 text-muted-foreground" />}
                                            {a.status === "reviewing" && <Clock className="w-3 h-3 text-amber-400 animate-pulse" />}
                                            {a.status === "overdue" && <XCircle className="w-3 h-3 text-red-500" />}
                                            <span className={cn(
                                                "text-xs capitalize font-medium",
                                                a.status === "completed" ? "text-emerald-400" : a.status === "reviewing" ? "text-amber-400" : a.status === "overdue" ? "text-red-500" : "text-muted-foreground"
                                            )}>{a.status}</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground mt-0.5">{a.score ? `Score: ${a.score}` : a.date}</span>
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
