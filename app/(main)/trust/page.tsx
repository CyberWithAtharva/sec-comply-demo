"use client";

import React from "react";
import { BadgeCheck, Lock, ExternalLink } from "lucide-react";

export default function TrustCenterPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <BadgeCheck className="w-8 h-8 mr-3 text-emerald-500" />
                        Trust Center
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Public-facing compliance portal for customers and partners.</p>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-24 text-center border border-slate-800 rounded-2xl bg-slate-900/40">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-100 mb-2">Trust Center Coming Soon</h2>
                <p className="text-sm text-slate-400 max-w-md mb-6">
                    Your public Trust Center will automatically publish your compliance certifications,
                    security documentation, and sub-processor list once your compliance programs are complete.
                </p>
                <div className="flex flex-col gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Auto-publishes when SOC 2 / ISO 27001 is active
                    </div>
                    <div className="flex items-center gap-2">
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Share a public URL with customers requesting security review
                    </div>
                    <div className="flex items-center gap-2">
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                        Hosted at trust.yourcompany.com
                    </div>
                </div>
            </div>
        </div>
    );
}
