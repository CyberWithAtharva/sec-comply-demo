"use client";

import React from "react";
import { Send, FileVideo, CheckCircle2 } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

export function RecentCampaignsWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <Send className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Recent Campaigns</h3>
                </div>
            </div>

            <div className="flex-1 w-full overflow-hidden flex flex-col">
                <div className="relative pl-4 border-l border-border space-y-6 flex-1 overflow-y-auto no-scrollbar pb-2">

                    {/* Campaign 1 */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 p-1 bg-card rounded-full border border-border">
                            <Send className="w-3 h-3 text-purple-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">Quarterly Spear Phishing (C-Suite)</span>
                            <span className="text-xs text-muted-foreground mt-1">Targeted payload simulating an urgent wire transfer request.</span>
                            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase mt-2">Active running...</span>
                        </div>
                    </div>

                    {/* Campaign 2 */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 p-1 bg-card rounded-full border border-border">
                            <FileVideo className="w-3 h-3 text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">Annual Compliance Overview</span>
                            <span className="text-xs text-muted-foreground mt-1">Video module covering SOC2, GDPR, and Acceptable Use.</span>
                            <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase mt-2">Completed (98% Cov)</span>
                        </div>
                    </div>

                    {/* Campaign 3 */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 p-1 bg-card rounded-full border border-border">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">Secure Development Lifecycle (Devs)</span>
                            <span className="text-xs text-muted-foreground mt-1">Training on OWASP Top 10 and static analysis usage.</span>
                            <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase mt-2">Completed (100% Cov)</span>
                        </div>
                    </div>

                </div>
            </div>

            <Button variant="link" className="h-auto p-0 hover:no-underline text-xs text-purple-500 hover:text-purple-400 mt-4 text-center font-medium border-t border-border/50 pt-4 w-full rounded-none">
                Create New Campaign
            </Button>
        </div>
    );
}
