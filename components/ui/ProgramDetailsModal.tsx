"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    LayoutGrid,
    Activity,
    Trello,
    ShieldCheck,
    TrendingUp,
    Layers,
    Map,
} from "lucide-react";
import { MetricsCardsWidget } from "@/components/widgets/MetricsCardsWidget";
import { HeatmapWidget } from "@/components/widgets/HeatmapWidget";
import { TabularWidget } from "@/components/widgets/TabularWidget";
import {
    RadarWidget,
    TimelineWidget,
    ScatterWidget,
    RadialWidget,
    GaugeWidget,
    BarWidget,
    TreemapWidget,
} from "@/components/widgets/ChartsWidgets";
import { ControlsBreakdownUX } from "@/components/ui/ControlsBreakdownUX";
import { ExecutiveSummaryWidget } from "@/components/widgets/overview/ExecutiveSummaryWidget";
import { cn } from "@/components/ui/Card";

export function ProgramDetailsModal({
    isOpen,
    onClose,
    frameworkId,
}: {
    isOpen: boolean;
    onClose: () => void;
    frameworkId: string;
}) {
    const [activeTab, setActiveTab] = useState("Summary");
    const [mainTab, setMainTab] = useState<"Insights" | "Breakdown">("Insights");

    if (!isOpen) return null;

    const tabs = [
        {
            id: "Summary",
            label: "Summary",
            icon: Activity,
            description: "Key KPIs at a glance",
        },
        {
            id: "Risk Analysis",
            label: "Risk Analysis",
            icon: ShieldCheck,
            description: "Category risk posture",
        },
        {
            id: "Compliance Tracker",
            label: "Compliance Tracker",
            icon: TrendingUp,
            description: "Historical progress",
        },
        {
            id: "Control Distribution",
            label: "Control Distribution",
            icon: Layers,
            description: "Structural control view",
        },
        {
            id: "Coverage Map",
            label: "Coverage Map",
            icon: Map,
            description: "Density & velocity",
        },
    ];

    // Categories for the Sub-Control Matrix
    const categories = [
        { name: "Access Control", count: 14, status: "Good" },
        { name: "Risk Assessment", count: 8, status: "Warning" },
        { name: "Cryptography", count: 12, status: "Critical" },
        { name: "Physical Security", count: 9, status: "Good" },
        { name: "Operations Security", count: 20, status: "Warning" },
    ];

    function renderTabContent() {
        switch (activeTab) {
            case "Summary":
                return (
                    <div className="flex flex-col space-y-8">
                        <MetricsCardsWidget frameworkId={frameworkId} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ExecutiveSummaryWidget />
                            <GaugeWidget frameworkId={frameworkId} />
                        </div>
                        <RadialWidget frameworkId={frameworkId} />
                    </div>
                );
            case "Risk Analysis":
                return (
                    <div className="flex flex-col space-y-8">
                        <RadarWidget frameworkId={frameworkId} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ScatterWidget frameworkId={frameworkId} />
                            <div className="h-[300px]">
                                <HeatmapWidget frameworkId={frameworkId} />
                            </div>
                        </div>
                    </div>
                );
            case "Compliance Tracker":
                return (
                    <div className="flex flex-col space-y-8">
                        <TimelineWidget frameworkId={frameworkId} />
                        <BarWidget frameworkId={frameworkId} />
                        <TabularWidget frameworkId={frameworkId} />
                    </div>
                );
            case "Control Distribution":
                return (
                    <div className="flex flex-col space-y-8">
                        <TreemapWidget frameworkId={frameworkId} />
                        {/* Sub-Control Categorization Matrix */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center">
                                <Trello className="w-5 h-5 mr-3 text-slate-400" />
                                Sub-Control Categorization Matrix
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories.map((cat, i) => (
                                    <div key={i} className="glass-panel p-5 rounded-xl border border-slate-800/50">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-sm font-semibold text-slate-300">
                                                {cat.name}
                                            </h4>
                                            <span
                                                className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${cat.status === "Good"
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : cat.status === "Warning"
                                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                            : "bg-red-500/10 text-red-400 border-red-500/20"
                                                    }`}
                                            >
                                                {cat.status}
                                            </span>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div className="text-3xl font-bold text-slate-100 tracking-tighter">
                                                {cat.count}
                                            </div>
                                            <span className="text-xs text-slate-500 font-mono uppercase">
                                                Controls
                                            </span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-800 mt-4 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${cat.status === "Good"
                                                        ? "bg-emerald-500 w-[85%]"
                                                        : cat.status === "Warning"
                                                            ? "bg-amber-500 w-[45%]"
                                                            : "bg-red-500 w-[15%]"
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case "Coverage Map":
                return (
                    <div className="flex flex-col space-y-8">
                        <div className="h-[300px]">
                            <HeatmapWidget frameworkId={frameworkId} />
                        </div>
                        <RadialWidget frameworkId={frameworkId} />
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-[1400px] h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-8 pt-6 pb-0 border-b border-slate-800/50 flex flex-col justify-between bg-slate-900/50 flex-shrink-0">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                                    {frameworkId.toUpperCase()} Deep Dive
                                </h2>
                                <p className="text-sm text-slate-400 mt-1 font-medium tracking-wide">
                                    Comprehensive Analysis & Visualization
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Top Level Tabs */}
                        <div className="flex space-x-6 px-2">
                            <button
                                onClick={() => setMainTab("Insights")}
                                className={cn(
                                    "pb-4 text-sm font-semibold transition-colors relative",
                                    mainTab === "Insights"
                                        ? "text-blue-400"
                                        : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                Executive Insights
                                {mainTab === "Insights" && (
                                    <motion.div
                                        layoutId="mainTabIndicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full shadow-[0_-2px_8px_rgba(59,130,246,0.5)]"
                                    />
                                )}
                            </button>
                            <button
                                onClick={() => setMainTab("Breakdown")}
                                className={cn(
                                    "pb-4 text-sm font-semibold transition-colors relative",
                                    mainTab === "Breakdown"
                                        ? "text-blue-400"
                                        : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                63 Controls Breakdown
                                {mainTab === "Breakdown" && (
                                    <motion.div
                                        layoutId="mainTabIndicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full shadow-[0_-2px_8px_rgba(59,130,246,0.5)]"
                                    />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden bg-[#020617]/50">
                        {mainTab === "Insights" ? (
                            <>
                                {/* Sidebar Tabs */}
                                <div className="w-64 border-r border-slate-800/50 bg-slate-900/30 overflow-y-auto no-scrollbar p-4 flex flex-col space-y-1.5 flex-shrink-0">
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3 px-3">
                                        Analysis Views
                                    </span>
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                "flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all text-left",
                                                activeTab === tab.id
                                                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                                            )}
                                        >
                                            <tab.icon className="w-4 h-4 flex-shrink-0" />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-medium tracking-wide truncate">
                                                    {tab.label}
                                                </span>
                                                <span className="text-[10px] text-slate-500 truncate">
                                                    {tab.description}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Active Visualization */}
                                <div className="flex-1 overflow-y-auto p-8 relative">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4 }}
                                        className="max-w-7xl mx-auto w-full"
                                    >
                                        {renderTabContent()}
                                    </motion.div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 p-8 overflow-hidden">
                                <ControlsBreakdownUX />
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
