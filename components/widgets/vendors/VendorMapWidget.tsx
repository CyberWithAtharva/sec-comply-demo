"use client";

import React from "react";
import { Globe, MapPin } from "lucide-react";

const locations = [
    { country: "United States", count: 86, color: "text-indigo-400", dot: "bg-indigo-500", top: "40%", left: "20%" },
    { country: "United Kingdom", count: 12, color: "text-emerald-400", dot: "bg-emerald-500", top: "35%", left: "45%" },
    { country: "Germany", count: 24, color: "text-blue-400", dot: "bg-blue-500", top: "38%", left: "50%" },
    { country: "India", count: 15, color: "text-amber-400", dot: "bg-amber-500", top: "55%", left: "70%" },
    { country: "Australia", count: 5, color: "text-purple-400", dot: "bg-purple-500", top: "75%", left: "85%" },
];

export function VendorMapWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Data Processors Geometry</h3>
                </div>
            </div>

            <div className="flex-1 w-full relative min-h-[220px] rounded-xl overflow-hidden bg-slate-900/40 border border-slate-800/50 flex flex-col items-center justify-center">
                {/* Abstract Dotted Map Background */}
                <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="dotGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1.5" fill="#e2e8f0" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dotGrid)" />
                </svg>

                {locations.map((loc, i) => (
                    <div
                        key={i}
                        className="absolute group flex flex-col items-center"
                        style={{ top: loc.top, left: loc.left }}
                    >
                        <div className={`w-3 h-3 rounded-full ${loc.dot} shadow-[0_0_15px_currentColor] animate-pulse`} />
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 whitespace-nowrap bg-slate-900 border border-slate-700 p-2 rounded-lg z-10 flex flex-col items-center shadow-xl">
                            <span className="text-xs font-bold text-slate-200">{loc.country}</span>
                            <span className={`text-[10px] ${loc.color}`}>{loc.count} Vendors</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs pt-4 border-t border-slate-800/50">
                {locations.slice(0, 3).map((loc, i) => (
                    <div key={i} className="flex items-center space-x-1.5 bg-slate-800/50 px-2 py-1 rounded border border-slate-700">
                        <MapPin className={`w-3 h-3 ${loc.color}`} />
                        <span className="text-slate-300">{loc.country}</span>
                    </div>
                ))}
                <div className="flex items-center space-x-1.5 bg-slate-800/50 px-2 py-1 rounded border border-slate-700">
                    <span className="text-slate-400">+2 more</span>
                </div>
            </div>
        </div>
    );
}
