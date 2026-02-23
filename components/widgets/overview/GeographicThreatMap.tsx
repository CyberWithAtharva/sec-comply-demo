"use client";

import React from "react";
import { Globe, MapPin } from "lucide-react";

const nodes = [
    { top: "30%", left: "20%", size: "w-2 h-2", ping: "red" },     // US West
    { top: "35%", left: "25%", size: "w-3 h-3", ping: "amber" },   // US East
    { top: "25%", left: "48%", size: "w-2 h-2", ping: "emerald" }, // UK
    { top: "30%", left: "55%", size: "w-4 h-4", ping: "red" },     // Central Europe
    { top: "45%", left: "75%", size: "w-2 h-2", ping: "emerald" }, // India
    { top: "35%", left: "85%", size: "w-3 h-3", ping: "amber" },   // Japan
    { top: "60%", left: "80%", size: "w-2 h-2", ping: "emerald" }, // Australia
];

export function GeographicThreatMap() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            <div className="flex items-center justify-between mb-4 z-10">
                <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Active Geo-Threats</h3>
                </div>
                <div className="flex space-x-2 items-center text-xs text-slate-400">
                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1" /> Critical</span>
                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1" /> Safe</span>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[250px] relative bg-slate-900/50 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
                {/* Abstract Dot Matrix Background representing the map */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: "radial-gradient(#475569 1px, transparent 1px)",
                        backgroundSize: "20px 20px"
                    }}
                />

                {/* Nodes superimposed on the matrix */}
                {nodes.map((n, i) => (
                    <div
                        key={i}
                        className="absolute flex items-center justify-center"
                        style={{ top: n.top, left: n.left }}
                    >
                        <span className={`absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-${n.ping}-400 duration-1000`} />
                        <span className={`relative inline-flex rounded-full ${n.size} bg-${n.ping}-500`} />
                    </div>
                ))}

                <div className="absolute bottom-4 left-4 z-10 flex flex-col bg-slate-900/80 backdrop-blur-sm p-3 rounded-lg border border-slate-800/80">
                    <div className="flex items-center text-sm font-semibold text-slate-200 mb-1">
                        <MapPin className="w-3 h-3 text-red-400 mr-1" />
                        Frankfurt, DE
                    </div>
                    <span className="text-xs text-slate-400">Brute Force Campaign</span>
                    <span className="text-xs font-mono text-red-500 mt-1">11,402 Blocks/hr</span>
                </div>
            </div>
        </div>
    );
}
