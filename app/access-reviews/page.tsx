"use client";

import React from "react";
import { motion } from "framer-motion";
import { Key, Users, CheckSquare, XSquare, AlertCircle } from "lucide-react";

export default function AccessReviewsPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <Key className="w-8 h-8 mr-3 text-cyan-500" />
                        User Access Reviews (UAR)
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Quarterly recertification campaigns and identity governance.</p>
                </div>
                <button className="bg-slate-100 hover:bg-white text-slate-900 px-5 py-2.5 rounded-xl text-sm font-medium shadow-glow transition-all">
                    Start Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Identities", value: "3,104", icon: Users, color: "text-slate-300" },
                    { label: "Approved Access", value: "2,840", icon: CheckSquare, color: "text-emerald-400" },
                    { label: "Revoked", value: "112", icon: XSquare, color: "text-red-400" },
                    { label: "Pending Review", value: "152", icon: AlertCircle, color: "text-amber-400" },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-slate-800/50"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{s.label}</span>
                            <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <span className="text-3xl font-bold text-slate-100 tracking-tighter">{s.value}</span>
                    </motion.div>
                ))}
            </div>

            <div className="glass-panel flex-1 rounded-2xl border border-slate-800/50 min-h-[400px] flex items-center justify-center p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent z-10" />
                <div className="z-20">
                    <Key className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-200 mb-2">Campaign Initializing</h3>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto">Syncing with Okta, Google Workspace, and Azure AD to compile current entitlement assignments.</p>
                </div>
            </div>
        </div>
    );
}
