"use client";

import React from "react";
import { Building2, ChevronRight, ShieldAlert, Award } from "lucide-react";
import { cn } from "@/components/ui/Card";

const departments = [
    { name: "Engineering", completion: 98, score: "A+" },
    { name: "Sales & Marketing", completion: 74, score: "C" },
    { name: "Human Resources", completion: 100, score: "S" },
    { name: "Finance & Legal", completion: 88, score: "B" },
    { name: "Customer Support", completion: 92, score: "A" },
];

export function DepartmentMetricsWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Department Leaderboard</h3>
                </div>
            </div>

            <div className="flex-1 w-full overflow-hidden flex flex-col space-y-3">
                {departments.map((dept, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 flex flex-col group hover:bg-slate-800/40 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-200">{dept.name}</span>
                            <div className="flex flex-col items-end">
                                <span className={cn(
                                    "text-lg font-bold leading-none tracking-tighter",
                                    dept.completion >= 90 ? "text-emerald-400" : dept.completion >= 80 ? "text-blue-400" : "text-amber-400"
                                )}>{dept.completion}%</span>
                                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Completion</span>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full",
                                dept.completion >= 90 ? "bg-emerald-500" : dept.completion >= 80 ? "bg-blue-500" : "bg-amber-500"
                            )} style={{ width: `${dept.completion}%` }} />
                        </div>
                        <div className="mt-2 flex justify-between items-center w-full">
                            <span className="text-[10px] text-slate-400 flex items-center">
                                Grade: <span className="text-slate-300 font-bold ml-1">{dept.score}</span>
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

            <button className="text-xs text-indigo-500 hover:text-indigo-400 mt-4 text-center font-medium transition-colors border-t border-slate-800/50 pt-4 w-full flex items-center justify-center">
                View Full Team Matrix <ChevronRight className="w-4 h-4 ml-1" />
            </button>
        </div>
    );
}
