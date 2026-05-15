"use client";

import React from "react";
import { UserCheck, ShieldAlert, CalendarClock } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

export function AccessCampaignsWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Active UAR Campaigns</h3>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-5">
                {/* Campaign 1 */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Q3 Enterprise Access Review</span>
                        <span className="text-xs font-bold text-emerald-400">82%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>412/502 Users Verified</span>
                        <span className="flex items-center text-amber-500"><CalendarClock className="w-3 h-3 mr-1" /> 4 Days Left</span>
                    </div>
                </div>

                {/* Campaign 2 */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-muted-foreground">AWS Production IAM Audit</span>
                        <span className="text-xs font-bold text-amber-400">45%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>18/40 Roles Verified</span>
                        <span className="flex items-center text-red-400"><ShieldAlert className="w-3 h-3 mr-1" /> High Priority</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs pt-4 border-t border-border/50">
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-indigo-400 font-bold text-lg">3</span>
                    <span className="text-indigo-200/50 uppercase tracking-widest text-[9px] mt-0.5">Active</span>
                </div>
                <Button variant="secondary" className="w-full space-x-1.5">
                    <span>Manage</span>
                </Button>
            </div>
        </div>
    );
}
