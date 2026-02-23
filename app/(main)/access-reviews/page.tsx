"use client";

import React from "react";
import { UserCheck, SlidersHorizontal, KeyRound } from "lucide-react";

import { AccessCampaignsWidget } from "@/components/widgets/access_reviews/AccessCampaignsWidget";
import { RevokedAccessWidget } from "@/components/widgets/access_reviews/RevokedAccessWidget";
import { OverPermissionedWidget } from "@/components/widgets/access_reviews/OverPermissionedWidget";
import { PrivilegedAccessWidget } from "@/components/widgets/access_reviews/PrivilegedAccessWidget";
import { AccessRequestQueueWidget } from "@/components/widgets/access_reviews/AccessRequestQueueWidget";

export default function AccessReviewsPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <KeyRound className="w-8 h-8 mr-3 text-red-500" />
                        Identity & Access Management
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Enforce least-privilege policies, orchestrate user access reviews, and govern privileged vaulting.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="px-5 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-300 transition-all flex items-center">
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Configure Rules
                    </button>
                    <button className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all flex items-center">
                        <UserCheck className="w-4 h-4 mr-2" />
                        New Campaign
                    </button>
                </div>
            </div>

            {/* Top Row: UAR Campaigns, Revoked, Over-Permissioned */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 h-[320px]">
                    <AccessCampaignsWidget />
                </div>
                <div className="md:col-span-1 lg:col-span-1 h-[320px]">
                    <RevokedAccessWidget />
                </div>
                <div className="md:col-span-2 lg:col-span-1 h-[320px]">
                    <OverPermissionedWidget />
                </div>
            </div>

            {/* Bottom Row: Privileged Access, Request Queue */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[380px]">
                <div className="xl:col-span-2">
                    <PrivilegedAccessWidget />
                </div>
                <div className="xl:col-span-1">
                    <AccessRequestQueueWidget />
                </div>
            </div>
        </div>
    );
}
