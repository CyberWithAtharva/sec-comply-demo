"use client";

import React from "react";
import { Users, CheckCircle2, UserX } from "lucide-react";

export function AcknowledgeTrackingWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Acknowledgements</h3>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-slate-300">Information Security Policy</span>
                        <span className="text-xs font-bold text-emerald-400">92%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-slate-300">Acceptable Use Policy</span>
                        <span className="text-xs font-bold text-amber-400">76%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '76%' }} />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-slate-300">Incident Response Plan</span>
                        <span className="text-xs font-bold text-emerald-400">88%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }} />
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs pt-4 border-t border-slate-800/50">
                <div className="flex items-center justify-center space-x-1.5 bg-slate-800/50 py-2 rounded-lg text-slate-300 border border-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>214 Signed</span>
                </div>
                <button className="flex items-center justify-center space-x-1.5 bg-red-500/10 hover:bg-red-500/20 py-2 rounded-lg text-red-400 border border-red-500/20 transition-colors">
                    <UserX className="w-3.5 h-3.5" />
                    <span>Remind 32</span>
                </button>
            </div>
        </div>
    );
}
