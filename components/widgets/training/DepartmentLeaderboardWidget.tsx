"use client";

import React from "react";
import { Trophy, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/components/ui/Card";

const depts = [
    { name: "Engineering", score: 98, trend: "up", rank: 1 },
    { name: "Human Resources", score: 95, trend: "up", rank: 2 },
    { name: "Executive", score: 82, trend: "down", rank: 3 },
    { name: "Sales & Marketing", score: 71, trend: "down", rank: 4 },
];

export function DepartmentLeaderboardWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Department Leaderboard</h3>
                </div>
            </div>

            <div className="flex flex-col space-y-3 mt-2">
                {depts.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center space-x-4">
                            <span className={cn(
                                "text-lg font-black w-6 text-center",
                                d.rank === 1 ? "text-amber-400" : d.rank === 2 ? "text-slate-300" : d.rank === 3 ? "text-amber-600" : "text-slate-600"
                            )}>{d.rank}</span>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-200">{d.name}</span>
                                <div className="flex items-center mt-0.5">
                                    <span className={cn("text-xs font-mono", d.score >= 90 ? "text-emerald-400" : d.score >= 80 ? "text-amber-400" : "text-red-400")}>
                                        {d.score} PhishScore
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800 p-2 rounded-lg">
                            {d.score >= 90 ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-red-400" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
