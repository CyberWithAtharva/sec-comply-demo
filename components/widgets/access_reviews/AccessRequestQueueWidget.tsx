"use client";

import React from "react";
import { UserPlus, Clock, Check, X as Reject } from "lucide-react";
import { cn } from "@/components/ui/Card";

export function AccessRequestQueueWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <UserPlus className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Request Queue</h3>
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-glow-blue">24</div>
            </div>

            <div className="flex flex-col space-y-3 flex-1 justify-center">
                <p className="text-xs text-slate-400 mb-2">Pending role expansions awaiting manager approval.</p>

                {/* Request 1 */}
                <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex flex-col group hover:bg-slate-800/40 transition-colors cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-[100%] pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors pr-6">Github: Repo Admin (frontend-monorepo)</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 relative z-10 mb-2">
                        <span>Requester: <span className="text-slate-300 font-medium">David K.</span></span>
                        <span className="font-mono tracking-widest uppercase text-amber-400/80"><Clock className="w-3 h-3 inline pb-0.5" /> 2 Hrs</span>
                    </div>
                    <div className="flex space-x-2 mt-1 relative z-10">
                        <button className="flex-1 py-1.5 flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-400 rounded text-xs transition border border-emerald-500/20"><Check className="w-3.5 h-3.5 mr-1" /> Approve</button>
                        <button className="flex-1 py-1.5 flex items-center justify-center bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded text-xs transition border border-slate-700/50 hover:border-red-500/30"><Reject className="w-3.5 h-3.5 mr-1" /> Deny</button>
                    </div>
                </div>

                {/* Request 2 */}
                <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex flex-col group hover:bg-slate-800/40 transition-colors cursor-pointer relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors">Okta: Financial Data Read</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 relative z-10">
                        <span>Requester: <span className="text-slate-300 font-medium">Elena S.</span></span>
                        <span className="font-mono tracking-widest uppercase text-amber-400/80"><Clock className="w-3 h-3 inline pb-0.5" /> 1 Day</span>
                    </div>
                </div>

            </div>

            <button className="text-xs text-blue-500 hover:text-blue-400 mt-4 text-center font-medium transition-colors border-t border-slate-800/50 pt-4 w-full">
                Open Access Inbox
            </button>
        </div>
    );
}
