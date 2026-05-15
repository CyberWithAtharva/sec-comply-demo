"use client";

import React from "react";
import { History, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RecentUpdatesWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <History className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Recent Policy Activity</h3>
                </div>
            </div>

            <div className="flex-1 w-full overflow-hidden flex flex-col">
                <div className="relative pl-4 border-l border-border space-y-6 flex-1 overflow-y-auto no-scrollbar pb-2">

                    {/* Event 1 */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 p-1 bg-card rounded-full border border-border">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">Information Security Policy v2.4</span>
                            <span className="text-xs text-muted-foreground mt-1">Approved by <strong>CISO</strong> during annual review.</span>
                            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase mt-2">Today, 10:42 AM</span>
                        </div>
                    </div>

                    {/* Event 2 */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 p-1 bg-card rounded-full border border-border">
                            <FileText className="w-3 h-3 text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">Data Classification Guidelines</span>
                            <span className="text-xs text-muted-foreground mt-1">New draft proposed by <strong>Compliance Team</strong>. Pending legal review.</span>
                            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase mt-2">Yesterday, 14:15 PM</span>
                        </div>
                    </div>

                    {/* Event 3 */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 p-1 bg-card rounded-full border border-border">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">Asset Management Policy</span>
                            <span className="text-xs text-muted-foreground mt-1">Minor revisions published without requiring re-acknowledgement.</span>
                            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase mt-2">Oct 24, 09:00 AM</span>
                        </div>
                    </div>

                </div>
            </div>

            <Button variant="link" className="h-auto p-0 hover:no-underline text-xs text-blue-500 hover:text-blue-400 mt-4 text-center font-medium border-t border-border/50 pt-4 w-full rounded-none">
                View Full Audit Log
            </Button>
        </div>
    );
}
