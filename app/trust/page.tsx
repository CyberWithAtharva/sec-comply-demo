"use client";

import React from "react";
import { BadgeCheck, Globe, Link2, ExternalLink, Activity } from "lucide-react";

export default function TrustCenterPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <BadgeCheck className="w-8 h-8 mr-3 text-blue-500" />
                        Public Trust Center
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Manage your customer-facing security posture and compliance certifications.</p>
                </div>
                <button className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Preview Live Site
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-blue-900/10 to-slate-900/50">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">Published</span>
                            <h2 className="text-2xl font-bold text-slate-100 mb-2">OmniGuard Security Portal</h2>
                            <p className="text-slate-400 max-w-md">Your real-time security posture is currently visible to 48 active prospects under NDA.</p>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
                            <Globe className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg flex items-center px-4 py-3">
                            <span className="text-slate-500 text-sm">trust.omniguard.com/security</span>
                        </div>
                        <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
                            <Link2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-200 mb-1">Access Requests</h3>
                        <p className="text-sm text-slate-500">Pending NDA approvals</p>
                    </div>
                    <div className="text-right">
                        <span className="text-6xl font-black text-slate-100 tracking-tighter">14</span>
                    </div>
                    <button className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 py-2.5 rounded-xl transition-colors font-medium text-sm">
                        Review Requests
                    </button>
                </div>
            </div>

            <div className="glass-panel rounded-2xl border border-slate-800 flex-1 min-h-[300px] flex items-center justify-center text-center">
                <div>
                    <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-slate-300">Analytics Dashboard</h3>
                    <p className="text-slate-500 text-sm">Visitor metrics and document download tracking will appear here.</p>
                </div>
            </div>
        </div>
    );
}
