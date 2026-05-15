"use client";

import React from "react";
import { Fish, MousePointerClick, AlertTriangle } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

export function PhishingSimulationWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <Fish className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Recent Phishing Test</h3>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-card px-2 py-1 rounded border border-border">Campaign Q3</span>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-muted-foreground flex items-center"><MousePointerClick className="w-4 h-4 mr-1.5 text-amber-400" /> Clicked Link</span>
                        <span className="text-xs font-bold text-amber-400">4.2%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '4.2%' }} />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-muted-foreground flex items-center"><AlertTriangle className="w-4 h-4 mr-1.5 text-red-500" /> Submitted Credentials</span>
                        <span className="text-xs font-bold text-red-500">1.1%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '1.1%' }} />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-muted-foreground flex items-center"><Fish className="w-4 h-4 mr-1.5 text-blue-400" /> Reported to Security</span>
                        <span className="text-xs font-bold text-blue-400">85.4%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '85.4%' }} />
                    </div>
                </div>
            </div>

            <Button variant="link" className="h-auto p-0 hover:no-underline text-xs text-blue-500 hover:text-blue-400 mt-6 text-center font-medium border-t border-border/50 pt-4 w-full rounded-none">
                Configure Next Scenario →
            </Button>
        </div>
    );
}
