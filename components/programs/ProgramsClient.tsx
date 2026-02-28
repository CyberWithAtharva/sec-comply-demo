"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

import Link from "next/link";
import { OverviewTab } from "@/components/tabs/OverviewTab";
import { ControlsTab } from "@/components/tabs/ControlsTab";
import { DomainsTab } from "@/components/tabs/DomainsTab";
import { PoliciesTab } from "@/components/tabs/PoliciesTab";
import { EvidenceTab } from "@/components/tabs/EvidenceTab";
import { ProgramDetailsModal } from "@/components/ui/ProgramDetailsModal";
import { AlertTriangle } from "lucide-react";

export interface PolicyData {
    id: string;
    title: string;
    status: string;
    framework_id: string | null;
    owner_id: string | null;
    next_review: string | null;
    version: string;
    updated_at: string;
}

export interface FrameworkData {
    id: string;
    frameworkId: string;
    name: string;
    version: string;
    totalControls: number;
    verifiedControls: number;
    inProgressControls: number;
    notStartedControls: number;
    evidenceCount: number;
    percentage: number;
    status: "Good" | "Warning" | "Critical";
}

export interface ControlData {
    id: string;
    frameworkId: string;
    controlId: string;
    title: string;
    domain: string;
    category: string;
    status: string;
}

interface ProgramsClientProps {
    frameworks: FrameworkData[];
    controls: ControlData[];
    gapCounts?: Record<string, number>;
    policiesByFramework?: Record<string, PolicyData[] | null | undefined>;
}

const STATUS_COLOR: Record<string, string> = {
    Good: "text-emerald-500",
    Warning: "text-amber-500",
    Critical: "text-red-500",
};

export function ProgramsClient({ frameworks, controls, gapCounts = {}, policiesByFramework = {} }: ProgramsClientProps) {
    const [activeFrameworkId, setActiveFrameworkId] = useState(
        frameworks[0]?.frameworkId ?? ""
    );
    const [activeTab, setActiveTab] = useState("Overview");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Shape data for the OverviewTab CircularProgress cards
    const overviewFrameworks = frameworks.map(fw => ({
        id: fw.frameworkId,
        title: fw.name,
        subtitle: `v${fw.version} · ${fw.verifiedControls} of ${fw.totalControls} controls verified`,
        value: fw.percentage,
        status: fw.status,
        colorClass: STATUS_COLOR[fw.status] ?? "text-slate-400",
        gapCount: gapCounts[fw.frameworkId] ?? 0,
    }));

    // Stats for the active framework (used by MetricsCardsWidget)
    const activeFramework = frameworks.find(f => f.frameworkId === activeFrameworkId);

    // Controls for the active framework (used by TabularWidget)
    const activeControls = controls.filter(c => c.frameworkId === activeFrameworkId);

    // Policies for the active framework
    const activePolicies = (policiesByFramework[activeFrameworkId] ?? []) as PolicyData[];
    const activeGapCount = gapCounts[activeFrameworkId] ?? 0;

    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">

            {/* Header Breadcrumb */}
            <div className="flex items-center justify-between">
                <div className="flex items-center text-sm font-mono text-slate-400 tracking-wide">
                    <span className="hover:text-slate-200 cursor-pointer transition-colors">Home</span>
                    <ChevronRight className="w-4 h-4 mx-2 opacity-50" />
                    <span className="text-slate-100">Programs</span>
                </div>
                <div className="flex items-center gap-3">
                    {activeGapCount > 0 && (
                        <Link href="/gap-assessment" className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors">
                            <AlertTriangle className="w-4 h-4" />
                            {activeGapCount} Gap{activeGapCount !== 1 ? "s" : ""}
                        </Link>
                    )}
                    <a href="/questionnaire" className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-glow transition-all">
                        Go to Assessment &rarr;
                    </a>
                </div>
            </div>

            {/* Layout Tabs */}
            <div className="pt-8 mb-4">
                <div className="flex space-x-8 border-b border-slate-800 pb-px relative overflow-x-auto no-scrollbar">
                    {["Overview", "Controls", "Domains", "Policies", "Evidence"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-medium tracking-wide whitespace-nowrap transition-colors relative ${activeTab === tab
                                ? "text-blue-400"
                                : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dynamic Tab Area */}
            <div className="pb-20">
                <AnimatePresence mode="wait">
                    {activeTab === "Overview" && (
                        <OverviewTab
                            key="overview"
                            activeFramework={activeFrameworkId}
                            setActiveFramework={setActiveFrameworkId}
                            frameworks={overviewFrameworks}
                            setIsModalOpen={setIsModalOpen}
                            activeFrameworkData={activeFramework}
                        />
                    )}
                    {activeTab === "Controls" && (
                        <ControlsTab
                            key="controls"
                            frameworkId={activeFrameworkId}
                            frameworkStats={activeFramework}
                            controls={activeControls}
                        />
                    )}
                    {activeTab === "Domains" && <DomainsTab key="domains" frameworkId={activeFrameworkId} />}
                    {activeTab === "Policies" && <PoliciesTab key="policies" frameworkId={activeFrameworkId} policies={activePolicies} />}
                    {activeTab === "Evidence" && <EvidenceTab key="evidence" frameworkId={activeFrameworkId} />}
                </AnimatePresence>
            </div>

            {/* Deep Dive Modal */}
            <ProgramDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                frameworkId={activeFrameworkId}
                frameworkName={activeFramework?.name}
                frameworkStats={activeFramework}
                controls={activeControls}
            />
        </div>
    );
}
