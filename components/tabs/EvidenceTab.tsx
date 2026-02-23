"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileBadge, FileJson, FileLock2, UploadCloud } from "lucide-react";

export function EvidenceTab({ frameworkId }: { frameworkId: string }) {
    const getMultiplier = (id: string) => (id === "iso27001" ? 2 : id === "dpd" ? 0.5 : 1);
    const m = getMultiplier(frameworkId);

    const evidence = [
        { id: `EV-992${frameworkId === "soc2" ? "" : "i"}`, name: "Q3 Access Review", type: "PDF", size: "2.4 MB", date: "Oct 12", icon: FileBadge, mapped: Math.max(1, Math.round(4 * m)) },
        { id: `EV-993${frameworkId === "soc2" ? "" : "i"}`, name: "AWS CloudTrail Logs", type: "JSON", size: "14.1 MB", date: "Oct 14", icon: FileJson, mapped: Math.max(1, Math.round(12 * m)) },
        { id: `EV-994${frameworkId === "soc2" ? "" : "i"}`, name: "Penetration Test Report", type: "PDF", size: "8.9 MB", date: "Sep 22", icon: FileLock2, mapped: Math.max(1, Math.round(2 * m)) },
        { id: `EV-995${frameworkId === "soc2" ? "" : "i"}`, name: "DB Encryption Config", type: "JSON", size: "45 KB", date: "Oct 01", icon: FileJson, mapped: Math.max(1, Math.round(1 * m)) },
    ];

    return (
        <motion.div
            key="evidence"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col space-y-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Upload Dropzone */}
                <div className="glass-panel border-dashed border-2 border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/20 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group col-span-1 min-h-[200px]">
                    <div className="p-4 bg-slate-800/50 rounded-full group-hover:scale-110 group-hover:bg-blue-500/10 transition-all mb-4">
                        <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-400" />
                    </div>
                    <span className="text-sm font-semibold text-slate-300">Upload Evidence</span>
                    <span className="text-xs text-slate-500 mt-1 max-w-[150px] text-center">Drag & drop files or click to browse</span>
                </div>

                {/* Evidence Artifacts */}
                {evidence.map((ev) => (
                    <div key={ev.id} className="glass-panel p-6 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors flex flex-col justify-between group">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-slate-800/50 rounded-lg group-hover:bg-slate-800 transition-colors">
                                <ev.icon className="w-6 h-6 text-slate-300 group-hover:text-blue-400 transition-colors" />
                            </div>
                            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">{ev.type}</span>
                        </div>

                        <div className="mt-6 flex flex-col">
                            <span className="text-xs font-mono text-slate-500 mb-1">{ev.id}</span>
                            <span className="text-sm font-semibold text-slate-200 line-clamp-1 group-hover:text-blue-400 transition-colors">{ev.name}</span>
                            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                                <span>{ev.size}</span>
                                <span>{ev.date}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center text-xs">
                            <span className="text-slate-400">Mapped Controls:</span>
                            <span className="font-medium text-slate-200 bg-slate-800 px-2 py-0.5 rounded-full">{ev.mapped}</span>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
