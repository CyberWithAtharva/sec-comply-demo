"use client";

import React from "react";
import { Laptop, Smartphone, MonitorOff, AlertCircle } from "lucide-react";
import { cn } from "@/components/ui/Card";

export function HardwareInventoryWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center space-x-2">
                    <Laptop className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Hardware Fleet</h3>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center relative z-10">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" className="stroke-slate-800" strokeWidth="12" fill="none" />
                        {/* MDM Enrolled */}
                        <circle cx="64" cy="64" r="56" className="stroke-blue-500" strokeWidth="12" fill="none" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * 88) / 100} strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-bold text-slate-100">88%</span>
                        <span className="text-[9px] text-blue-400 uppercase tracking-widest font-bold mt-1 text-center leading-tight">MDM<br />Enrolled</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 relative z-10">
                <div className="bg-slate-900/40 border border-slate-800/50 p-2.5 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-slate-300">BYOD</span>
                    </div>
                    <span className="font-bold text-slate-200">114</span>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <MonitorOff className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-slate-300">Missing</span>
                    </div>
                    <span className="font-bold text-red-400 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> 7</span>
                </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}
