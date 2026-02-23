"use client";

import React from "react";
import { ActivitySquare, PhoneCall, AlertTriangle, ShieldCheck } from "lucide-react";

export default function IncidentsPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <ActivitySquare className="w-8 h-8 mr-3 text-rose-500" />
                        Incident Response
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Active investigations, runbooks, and tabletop exercise logs.</p>
                </div>
                <button className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all flex items-center animate-pulse">
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Declare Incident
                </button>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between bg-gradient-to-r from-slate-900/80 to-slate-900/20">
                <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-100 mb-1">Zero Active Incidents</h2>
                        <p className="text-slate-400">All systems are currently operating normally. Last incident was 42 days ago.</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="block text-4xl font-black text-slate-100 tracking-tighter">142</span>
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Days Since Level 1 Breach</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[300px]">
                <div className="glass-panel rounded-2xl border border-slate-800 p-6">
                    <div className="border-b border-slate-800 pb-4 mb-4 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-200">Recent Investigations</h3>
                        <span className="text-xs text-slate-500">View All</span>
                    </div>
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500 opacity-60">
                        <AlertTriangle className="w-10 h-10 mb-2" />
                        <p>No recent anomalies detected.</p>
                    </div>
                </div>
                <div className="glass-panel rounded-2xl border border-slate-800 p-6">
                    <div className="border-b border-slate-800 pb-4 mb-4 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-200">Tabletop Exercises</h3>
                        <button className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300">Schedule New</button>
                    </div>
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500 opacity-60">
                        <ActivitySquare className="w-10 h-10 mb-2" />
                        <p>Ransomware Scenario Q3 simulation pending.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
