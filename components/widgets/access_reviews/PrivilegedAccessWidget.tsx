"use client";

import React from "react";
import { Shield, KeyRound, Unlock, Activity } from "lucide-react";

export function PrivilegedAccessWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Privileged Vault Activity</h3>
                </div>
                <Activity className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>

            <div className="flex-1 w-full overflow-hidden flex flex-col">
                <div className="relative pl-4 border-l border-slate-800 space-y-6 flex-1 overflow-y-auto no-scrollbar pb-2">

                    {/* Event 1 */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 p-1 bg-slate-900 rounded-full border border-slate-700">
                            <Unlock className="w-3 h-3 text-red-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-200">DBA Root Accessed (Production)</span>
                            <span className="text-xs text-slate-400 mt-1">Checked out by <strong>sarah.j</strong>. Reason: Emergency failover patch.</span>
                            <span className="text-[10px] text-red-500 font-mono tracking-widest uppercase mt-2">Currently Active</span>
                        </div>
                    </div>

                    {/* Event 2 */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 p-1 bg-slate-900 rounded-full border border-slate-700">
                            <KeyRound className="w-3 h-3 text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-200">AWS Organization Admin</span>
                            <span className="text-xs text-slate-400 mt-1">Checked in by <strong>devops-bot</strong>. Duration: 14 mins.</span>
                            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-2">1 Hour Ago</span>
                        </div>
                    </div>

                    {/* Event 3 */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 p-1 bg-slate-900 rounded-full border border-slate-700">
                            <KeyRound className="w-3 h-3 text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-200">GitHub Owner PAT</span>
                            <span className="text-xs text-slate-400 mt-1">Rotated successfully by secrets manager.</span>
                            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-2">3 Hours Ago</span>
                        </div>
                    </div>

                </div>
            </div>

            <button className="text-xs text-amber-500 hover:text-amber-400 mt-4 text-center font-medium transition-colors border-t border-slate-800/50 pt-4 w-full">
                Review Full PAM Logs
            </button>
        </div>
    );
}
