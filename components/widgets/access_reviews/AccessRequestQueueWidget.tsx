"use client";

import React from "react";
import { UserPlus, Clock, Check, X as Reject } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

export function AccessRequestQueueWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <UserPlus className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Request Queue</h3>
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-glow-blue">24</div>
            </div>

            <div className="flex flex-col space-y-3 flex-1 justify-center">
                <p className="text-xs text-muted-foreground mb-2">Pending role expansions awaiting manager approval.</p>

                {/* Request 1 */}
                <div className="p-3 bg-card/40 rounded-xl border border-border/50 flex flex-col group hover:bg-secondary/40 transition-colors cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-[100%] pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className="text-sm font-medium text-foreground group-hover:text-blue-400 transition-colors pr-6">Github: Repo Admin (frontend-monorepo)</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground relative z-10 mb-2">
                        <span>Requester: <span className="text-muted-foreground font-medium">David K.</span></span>
                        <span className="font-mono tracking-widest uppercase text-amber-400/80"><Clock className="w-3 h-3 inline pb-0.5" /> 2 Hrs</span>
                    </div>
                    <div className="flex space-x-2 mt-1 relative z-10">
                        <Button variant="plain" size="sm" className="flex-1 h-auto py-1.5 bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-400 rounded text-xs border border-emerald-500/20"><Check className="w-3.5 h-3.5 mr-1" /> Approve</Button>
                        <Button variant="plain" size="sm" className="flex-1 h-auto py-1.5 bg-secondary hover:bg-red-500/20 text-muted-foreground hover:text-red-400 rounded text-xs border border-border/50 hover:border-red-500/30"><Reject className="w-3.5 h-3.5 mr-1" /> Deny</Button>
                    </div>
                </div>

                {/* Request 2 */}
                <div className="p-3 bg-card/40 rounded-xl border border-border/50 flex flex-col group hover:bg-secondary/40 transition-colors cursor-pointer relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className="text-sm font-medium text-foreground group-hover:text-blue-400 transition-colors">Okta: Financial Data Read</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground relative z-10">
                        <span>Requester: <span className="text-muted-foreground font-medium">Elena S.</span></span>
                        <span className="font-mono tracking-widest uppercase text-amber-400/80"><Clock className="w-3 h-3 inline pb-0.5" /> 1 Day</span>
                    </div>
                </div>

            </div>

            <Button variant="link" className="h-auto p-0 hover:no-underline text-xs text-blue-500 hover:text-blue-400 mt-4 text-center font-medium border-t border-border/50 pt-4 w-full rounded-none">
                Open Access Inbox
            </Button>
        </div>
    );
}
