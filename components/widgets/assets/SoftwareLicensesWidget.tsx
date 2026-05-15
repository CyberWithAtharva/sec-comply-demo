"use client";

import React from "react";
import { Component, DollarSign, CalendarX2 } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

export function SoftwareLicensesWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <Component className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Software Licenses</h3>
                </div>
            </div>

            <div className="flex-1 w-full overflow-hidden flex flex-col">
                <div className="relative pl-4 border-l border-border space-y-6 flex-1 overflow-y-auto no-scrollbar pb-2">

                    {/* License 1 */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 p-1 bg-card rounded-full border border-border">
                            <CalendarX2 className="w-3 h-3 text-red-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">JetBrains All Products Pack</span>
                            <span className="text-xs text-muted-foreground mt-1">45 allocated to leaving developers. Need de-provisioning.</span>
                            <span className="text-[10px] text-red-400 font-mono tracking-widest uppercase mt-2">Cost Waste: $1,400/mo</span>
                        </div>
                    </div>

                    {/* License 2 */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 p-1 bg-card rounded-full border border-border">
                            <DollarSign className="w-3 h-3 text-amber-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">Salesforce Enterprise</span>
                            <span className="text-xs text-muted-foreground mt-1">Renewal deadline approaching. 98% utilization rate.</span>
                            <span className="text-[10px] text-amber-500 font-mono tracking-widest uppercase mt-2">Renews in 18 Days</span>
                        </div>
                    </div>

                    {/* License 3 */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 p-1 bg-card rounded-full border border-border">
                            <Component className="w-3 h-3 text-emerald-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">Figma Org Plan</span>
                            <span className="text-xs text-muted-foreground mt-1">Usage is optimal. No idle licenses detected.</span>
                            <span className="text-[10px] text-emerald-500 font-mono tracking-widest uppercase mt-2">Healthy</span>
                        </div>
                    </div>

                </div>
            </div>

            <Button variant="link" className="h-auto p-0 hover:no-underline text-xs text-indigo-400 hover:text-indigo-300 mt-4 text-center font-medium border-t border-border/50 pt-4 w-full rounded-none">
                Run FinOps Optimization
            </Button>
        </div>
    );
}
