"use client";

import React from "react";
import { UserCheck, ShieldAlert, CalendarClock } from "lucide-react";
import { cn } from "@/components/ui/Card";

export function AccessCampaignsWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Active UAR Campaigns</h3>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-5">
                {/* Campaign 1 */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-slate-300">Q3 Enterprise Access Review</span>
                        <span className="text-xs font-bold text-emerald-400">82%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>412/502 Users Verified</span>
                        <span className="flex items-center text-amber-500"><CalendarClock className="w-3 h-3 mr-1" /> 4 Days Left</span>
                    </div>
                </div>

                {/* Campaign 2 */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-slate-300">AWS Production IAM Audit</span>
                        <span className="text-xs font-bold text-amber-400">45%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>18/40 Roles Verified</span>
                        <span className="flex items-center text-red-400"><ShieldAlert className="w-3 h-3 mr-1" /> High Priority</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs pt-4 border-t border-slate-800/50">
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-indigo-400 font-bold text-lg">3</span>
                    <span className="text-indigo-200/50 uppercase tracking-widest text-[9px] mt-0.5">Active</span>
                </div>
                <button className="flex items-center justify-center space-x-1.5 bg-slate-800/50 hover:bg-slate-700/50 py-2 rounded-lg text-slate-300 border border-slate-700 transition-colors">
                    <span>Manage</span>
                </button>
            </div>
        </div>
    );
}
