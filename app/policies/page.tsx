"use client";

import React from "react";
import { FileText, Plus, BookOpen } from "lucide-react";

import { PolicyMaturityWidget } from "@/components/widgets/policies/PolicyMaturityWidget";
import { AcknowledgeTrackingWidget } from "@/components/widgets/policies/AcknowledgeTrackingWidget";
import { PolicyExceptionsWidget } from "@/components/widgets/policies/PolicyExceptionsWidget";
import { MissingPoliciesWidget } from "@/components/widgets/policies/MissingPoliciesWidget";
import { RecentUpdatesWidget } from "@/components/widgets/policies/RecentUpdatesWidget";

export default function PoliciesPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <FileText className="w-8 h-8 mr-3 text-indigo-500" />
                        Governance & Policies
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Central command for policy documentation, acknowledgements, exceptions, and framework alignment.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="px-5 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-300 transition-all flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Policy Library
                    </button>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Policy
                    </button>
                </div>
            </div>

            {/* Top Row: Maturity, Acknowledgements, Exceptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 h-[320px]">
                    <PolicyMaturityWidget />
                </div>
                <div className="md:col-span-1 lg:col-span-1 h-[320px]">
                    <AcknowledgeTrackingWidget />
                </div>
                <div className="md:col-span-2 lg:col-span-1 h-[320px]">
                    <PolicyExceptionsWidget />
                </div>
            </div>

            {/* Bottom Row: Missing Policies (Gaps), Recent Updates */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-[380px]">
                <div className="xl:col-span-1">
                    <MissingPoliciesWidget />
                </div>
                <div className="xl:col-span-1">
                    <RecentUpdatesWidget />
                </div>
            </div>
        </div>
    );
}
