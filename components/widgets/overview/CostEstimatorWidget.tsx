"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CostEstimatorWidget() {
    const [employees, setEmployees] = useState(150);
    const [systems, setSystems] = useState(25);

    // Formula heuristics
    const currentCost = (employees * 1200) + (systems * 4500);
    const optimizedCost = (employees * 300) + (systems * 800) + 15000; // OmniGuard Base
    const savings = currentCost - optimizedCost;
    const roi = Math.round((savings / optimizedCost) * 100);

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full relative overflow-hidden group border border-border/50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-700 group-hover:scale-110" />

            <div className="flex items-center justify-between mb-4 z-10">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <Calculator className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">Compliance ROI Estimator</h3>
                </div>
                <span className="text-xs font-mono bg-secondary text-muted-foreground px-2 py-1 rounded">Architect Tool</span>
            </div>

            <div className="flex flex-col gap-4 z-10">
                {/* Inputs */}
                <div className="flex flex-col space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm tracking-wide text-muted-foreground">Headcount (Employees)</label>
                            <span className="text-sm font-bold text-foreground">{employees}</span>
                        </div>
                        <input
                            type="range"
                            min="10" max="2000" step="10"
                            value={employees}
                            onChange={(e) => setEmployees(Number(e.target.value))}
                            className="w-full accent-emerald-500 bg-secondary h-2 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm tracking-wide text-muted-foreground">Cloud Systems / Repos</label>
                            <span className="text-sm font-bold text-foreground">{systems}</span>
                        </div>
                        <input
                            type="range"
                            min="5" max="500" step="5"
                            value={systems}
                            onChange={(e) => setSystems(Number(e.target.value))}
                            className="w-full accent-emerald-500 bg-secondary h-2 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Output */}
                <div className="bg-card/50 rounded-xl p-4 border border-border/50 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />

                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Projected Annual Savings</span>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-black text-foreground tracking-tighter">
                            ${(savings / 1000).toFixed(1)}k
                        </span>
                        <div className="flex items-center text-emerald-400 text-sm font-medium">
                            <TrendingDown className="w-4 h-4 mr-1" />
                            {roi}% ROI
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Manual Cost: <span className="line-through text-muted-foreground/70">${(currentCost / 1000).toFixed(1)}k</span></span>
                        <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-blue-400 hover:text-blue-300 font-medium hover:no-underline"
                        >
                            Export PDF <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
