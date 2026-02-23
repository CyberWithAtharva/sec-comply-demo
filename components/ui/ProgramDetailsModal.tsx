"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LayoutGrid, Activity, Trello, PieChart, BarChart2, TrendingUp, ScatterChart, Target, Columns, Map } from "lucide-react";
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
    TreemapWidget
} from "@/components/widgets/ChartsWidgets";

export function ProgramDetailsModal({
    isOpen,
    onClose,
    frameworkId
}: {
    isOpen: boolean;
    onClose: () => void;
    frameworkId: string
}) {
    const [activeTab, setActiveTab] = useState("Metrics");

    if (!isOpen) return null;

    const tabs = [
        { id: "Metrics", icon: Activity, component: MetricsCardsWidget },
        { id: "Table", icon: Columns, component: TabularWidget },
        { id: "Radar", icon: Target, component: RadarWidget },
        { id: "Heatmap", icon: Map, component: HeatmapWidget },
        { id: "Timeline", icon: TrendingUp, component: TimelineWidget },
        { id: "Scatter", icon: ScatterChart, component: ScatterWidget },
        { id: "Radial", icon: PieChart, component: RadialWidget },
        { id: "Gauge", icon: Activity, component: GaugeWidget },
        { id: "Bar", icon: BarChart2, component: BarWidget },
        { id: "Treemap", icon: LayoutGrid, component: TreemapWidget },
    ];

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || MetricsCardsWidget;

    // Generate dummy 63 controls grouped natively
    const categories = [
        { name: "Access Control", count: 14, status: "Good" },
        { name: "Risk Assessment", count: 8, status: "Warning" },
        { name: "Cryptography", count: 12, status: "Critical" },
        { name: "Physical Security", count: 9, status: "Good" },
        { name: "Operations Security", count: 20, status: "Warning" },
    ];

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

                {/* Modal View */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-[1400px] h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/50">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                                {frameworkId.toUpperCase()} Deep Dive
                            </h2>
                            <p className="text-sm text-slate-400 mt-1 font-medium tracking-wide">63 Controls Analysis & Visualization</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar Tabs */}
                        <div className="w-64 border-r border-slate-800/50 bg-slate-900/30 overflow-y-auto no-scrollbar p-4 flex flex-col space-y-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 px-3">Visualization Modes</span>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                                            ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="text-sm font-medium tracking-wide">{tab.id} View</span>
                                </button>
                            ))}
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 overflow-y-auto p-8 bg-[#020617]/50">
                            {/* The massive widget takes up the top section */}
                            <div className="w-full mb-12">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <ActiveComponent frameworkId={frameworkId} />
                                </motion.div>
                            </div>

                            {/* The 63 Controls Breakdown */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center">
                                    <Trello className="w-5 h-5 mr-3 text-slate-400" />
                                    Sub-Control Categorization Matrix
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {categories.map((cat, i) => (
                                        <div key={i} className="glass-panel p-5 rounded-xl border border-slate-800/50">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="text-sm font-semibold text-slate-300">{cat.name}</h4>
                                                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${cat.status === "Good" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                        cat.status === "Warning" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                            "bg-red-500/10 text-red-400 border-red-500/20"
                                                    }`}>
                                                    {cat.status}
                                                </span>
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <div className="text-3xl font-bold text-slate-100 tracking-tighter">
                                                    {cat.count}
                                                </div>
                                                <span className="text-xs text-slate-500 font-mono uppercase">Controls</span>
                                            </div>
                                            {/* Decorative mini progress bar */}
                                            <div className="w-full h-1 bg-slate-800 mt-4 rounded-full overflow-hidden">
                                                <div className={`h-full ${cat.status === "Good" ? "bg-emerald-500 w-[85%]" :
                                                        cat.status === "Warning" ? "bg-amber-500 w-[45%]" :
                                                            "bg-red-500 w-[15%]"
                                                    }`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
