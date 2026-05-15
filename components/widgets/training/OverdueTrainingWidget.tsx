"use client";

import React from "react";
import { UserX, MailWarning } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

const overdueUsers = [
    { name: "Sarah Jenkins", dept: "Engineering", daysOver: 14, risk: "high" },
    { name: "Michael Chen", dept: "Sales", daysOver: 5, risk: "medium" },
    { name: "David Alaba", dept: "Marketing", daysOver: 31, risk: "critical" },
];

export function OverdueTrainingWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <UserX className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Overdue Learners</h3>
                </div>
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white shadow-glow-red">12</div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col overflow-y-auto pr-1 scrollbar-thin">
                <p className="text-xs text-muted-foreground mb-2 shrink-0">Employees blocking 100% compliance targets.</p>
                <div className="flex flex-col space-y-3">
                    {overdueUsers.map((user, idx) => (
                        <div key={idx} className="p-3 bg-card/40 rounded-xl border border-border/50 flex flex-col group hover:bg-secondary/40 transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-foreground group-hover:text-red-400 transition-colors">{user.name}</span>
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                                    user.risk === "critical" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                        user.risk === "high" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                            "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                )}>{user.daysOver} Days Over</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>{user.dept}</span>
                                <Button variant="link" className="h-auto p-0 text-[10px] text-muted-foreground hover:text-foreground hover:no-underline">
                                    <MailWarning className="w-3.5 h-3.5 mr-1" /> Nudge
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Button variant="plain" className="w-full mt-3 shrink-0 h-auto py-2.5 space-x-2 bg-red-500/10 hover:bg-red-500/20 text-sm font-medium text-red-400 hover:text-red-400 rounded-lg border border-red-500/20">
                <MailWarning className="w-4 h-4" />
                <span>Nudge All Overdue</span>
            </Button>
        </div>
    );
}
