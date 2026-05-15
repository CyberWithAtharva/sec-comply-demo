"use client";

import React from "react";
import { MailPlus, Send, ArrowRight } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

export function UpcomingCampaignsWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <MailPlus className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Campaign Queue</h3>
                </div>
            </div>

            <div className="flex flex-col space-y-3 flex-1 justify-center">
                {[
                    { title: "Spear Phishing: Payroll Update", date: "Scheduled: Tomorrow", target: "All Employees", bg: "bg-blue-500/10", border: "border-blue-500/20", color: "text-blue-400" },
                    { title: "Module: Clean Desk Policy", date: "Scheduled: Oct 20", target: "New Hires", bg: "bg-emerald-500/10", border: "border-emerald-500/20", color: "text-emerald-400" },
                ].map((act, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-card/40 border border-border/50 hover:bg-secondary/40 transition-colors cursor-pointer group">
                        <div className="flex items-center space-x-3">
                            <div className={cn("p-2 rounded-lg border", act.bg, act.border)}>
                                <Send className={cn("w-4 h-4 text-muted-foreground", act.color)} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground group-hover:text-amber-400 transition-colors leading-tight">{act.title}</span>
                                <span className="text-[11px] text-muted-foreground mt-1">{act.date} · {act.target}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button variant="secondary" className="w-full mt-4 h-auto py-2.5 space-x-2 text-sm">
                <span>View Global Calendar</span>
                <ArrowRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
