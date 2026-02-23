"use client";

import React from "react";
import { motion } from "framer-motion";
import { ServerCrash, Laptop, Database, Globe, Search } from "lucide-react";

export default function AssetsPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <ServerCrash className="w-8 h-8 mr-3 text-orange-500" />
                        Asset Inventory
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Comprehensive tracking of devices, infrastructure, and code repositories.</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search assets (IP, MAC, Hostname)..."
                        className="bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 min-w-[300px] focus:outline-none focus:border-orange-500/50 transition-colors shadow-inner"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Hardware Assets", count: "4,192", icon: Laptop },
                    { label: "Cloud Resources", count: "1,844", icon: Globe },
                    { label: "Data Stores", count: "128", icon: Database },
                    { label: "Unmanaged", count: "14", icon: AlertCircle },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className="glass-panel p-5 rounded-2xl flex items-center space-x-4 border border-slate-800/50"
                    >
                        <div className="p-3 bg-slate-800/50 rounded-xl text-slate-400">
                            <s.icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-slate-100 mb-0.5">{s.count}</span>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{s.label}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="glass-panel rounded-2xl border border-slate-800/50 min-h-[500px] flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm text-center">
                    <ServerCrash className="w-12 h-12 text-slate-500 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-lg font-bold text-slate-200 mb-2">Asset CMDB Sync</h3>
                    <p className="text-slate-400 text-sm max-w-[300px] mx-auto">Ingesting data from Jamf, Intune, and AWS Systems Manager.</p>
                </div>
            </div>
        </div>
    );
}

// Temporary inline import for missing icon
function AlertCircle(props: React.SVGProps<SVGSVGElement>) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
}
