"use client";

import React from "react";
import { Building2, ChevronRight, ShieldAlert, Award } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

const departments = [
    { name: "Engineering", completion: 98, score: "A+" },
    { name: "Sales & Marketing", completion: 74, score: "C" },
    { name: "Human Resources", completion: 100, score: "S" },
    { name: "Finance & Legal", completion: 88, score: "B" },
    { name: "Customer Support", completion: 92, score: "A" },
];

export function DepartmentMetricsWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Department Leaderboard</h3>
                </div>
            </div>

            <div className="flex-1 w-full overflow-hidden flex flex-col space-y-3">
                {departments.map((dept, idx) => (
                    <div key={idx} className="bg-card/40 p-3 rounded-xl border border-border/50 flex flex-col group hover:bg-secondary/40 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-foreground">{dept.name}</span>
                            <div className="flex flex-col items-end">
                                <span className={cn(
                                    "text-lg font-bold leading-none tracking-tighter",
                                    dept.completion >= 90 ? "text-emerald-400" : dept.completion >= 80 ? "text-blue-400" : "text-amber-400"
                                )}>{dept.completion}%</span>
                                <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Completion</span>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full",
                                dept.completion >= 90 ? "bg-emerald-500" : dept.completion >= 80 ? "bg-blue-500" : "bg-amber-500"
                            )} style={{ width: `${dept.completion}%` }} />
                        </div>
                        <div className="mt-2 flex justify-between items-center w-full">
                            <span className="text-[10px] text-muted-foreground flex items-center">
                                Grade: <span className="text-muted-foreground font-bold ml-1">{dept.score}</span>
                            </span>
                            {dept.completion < 80 && (
                                <span className="text-[10px] text-red-400 flex items-center bg-red-500/10 px-1.5 rounded items-center">
                                    <ShieldAlert className="w-3 h-3 mr-1" /> Requires Intervention
                                </span>
                            )}
                            {dept.completion === 100 && (
                                <span className="text-[10px] text-yellow-400 flex items-center bg-yellow-500/10 px-1.5 rounded items-center">
                                    <Award className="w-3 h-3 mr-1" /> Perfect Score
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Button variant="link" className="h-auto p-0 hover:no-underline text-xs text-indigo-500 hover:text-indigo-400 mt-4 text-center font-medium border-t border-border/50 pt-4 w-full rounded-none">
                View Full Team Matrix <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
        </div>
    );
}
