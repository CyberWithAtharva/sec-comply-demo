"use client";

import React from "react";
import { GraduationCap, PlayCircle, Library } from "lucide-react";

import { TrainingCompletionWidget } from "@/components/widgets/training/TrainingCompletionWidget";
import { PhishingSimulationWidget } from "@/components/widgets/training/PhishingSimulationWidget";
import { OverdueTrainingWidget } from "@/components/widgets/training/OverdueTrainingWidget";
import { DepartmentMetricsWidget } from "@/components/widgets/training/DepartmentMetricsWidget";
import { RecentCampaignsWidget } from "@/components/widgets/training/RecentCampaignsWidget";

export default function TrainingPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <GraduationCap className="w-8 h-8 mr-3 text-emerald-500" />
                        Security Awareness
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Manage employee compliance modules, phishing simulations, and human-risk metrics.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="px-5 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-300 transition-all flex items-center">
                        <Library className="w-4 h-4 mr-2" />
                        Course Library
                    </button>
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Launch Campaign
                    </button>
                </div>
            </div>

            {/* Top Row: Completion, Phishing, Overdue */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 h-[320px]">
                    <TrainingCompletionWidget />
                </div>
                <div className="md:col-span-1 lg:col-span-1 h-[320px]">
                    <PhishingSimulationWidget />
                </div>
                <div className="md:col-span-2 lg:col-span-1 h-[320px]">
                    <OverdueTrainingWidget />
                </div>
            </div>

            {/* Bottom Row: Dept Leaderboard, Recent Campaigns */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-[380px]">
                <div className="xl:col-span-1">
                    <DepartmentMetricsWidget />
                </div>
                <div className="xl:col-span-1">
                    <RecentCampaignsWidget />
                </div>
            </div>
        </div>
    );
}
