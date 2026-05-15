"use client";

import React from "react";
import { Users, CheckCircle2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AcknowledgeTrackingWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Acknowledgements</h3>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Information Security Policy</span>
                        <span className="text-xs font-bold text-emerald-400">92%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Acceptable Use Policy</span>
                        <span className="text-xs font-bold text-amber-400">76%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '76%' }} />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Incident Response Plan</span>
                        <span className="text-xs font-bold text-emerald-400">88%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }} />
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs pt-4 border-t border-border/50">
                <div className="flex items-center justify-center space-x-1.5 bg-secondary/50 py-2 rounded-lg text-muted-foreground border border-border">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>214 Signed</span>
                </div>
                <Button variant="plain" className="w-full h-auto py-2 space-x-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-400 rounded-lg border border-red-500/20">
                    <UserX className="w-3.5 h-3.5" />
                    <span>Remind 32</span>
                </Button>
            </div>
        </div>
    );
}
