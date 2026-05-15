"use client";

import React from "react";
import { Target, ShieldAlert, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AssetCriticalityWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Criticality Matrix</h3>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-5">
                {/* Critical */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-muted-foreground flex items-center"><ShieldAlert className="w-4 h-4 mr-1.5 text-red-500" /> Tier 1: Mission Critical</span>
                        <span className="text-xs font-bold text-red-500">42</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '12%' }} />
                    </div>
                </div>

                {/* High */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-muted-foreground flex items-center"><Cpu className="w-4 h-4 mr-1.5 text-amber-500" /> Tier 2: Core Infrastructure</span>
                        <span className="text-xs font-bold text-amber-500">186</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
                    </div>
                </div>

                {/* Moderate */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Tier 3: Standard Assets</span>
                        <span className="text-xs font-bold text-emerald-500">814</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                    </div>
                </div>
            </div>

            <Button variant="link" className="h-auto p-0 hover:no-underline text-xs text-red-400 hover:text-red-300 mt-6 text-center font-medium border-t border-border/50 pt-4 w-full rounded-none">
                Review Default Security Baselines
            </Button>
        </div>
    );
}
