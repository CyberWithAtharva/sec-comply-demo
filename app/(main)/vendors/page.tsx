"use client";

import React from "react";
import { motion } from "framer-motion";
import { Building2, MailWarning, Clock, Filter, Plus } from "lucide-react";
import { cn } from "@/components/ui/Card";

import { VendorRiskDistributionWidget } from "@/components/widgets/vendors/VendorRiskDistributionWidget";
import { TopVendorRisksWidget } from "@/components/widgets/vendors/TopVendorRisksWidget";
import { VendorQuestionnairesWidget } from "@/components/widgets/vendors/VendorQuestionnairesWidget";
import { VendorMapWidget } from "@/components/widgets/vendors/VendorMapWidget";
import { VendorActionListWidget } from "@/components/widgets/vendors/VendorActionListWidget";

export default function VendorsPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <Building2 className="w-8 h-8 mr-3 text-indigo-500" />
                        Vendor Risk Management
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Third-party security assessments, tiering, and continuous monitoring.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="px-5 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-300 transition-all flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter Vendors
                    </button>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Onboard Vendor
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Active Vendors", value: "142", icon: Building2, color: "text-slate-200" },
                    { label: "High Risk (Tier 1)", value: "18", icon: MailWarning, color: "text-red-400" },
                    { label: "Pending Assessments", value: "7", icon: Clock, color: "text-amber-400" },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-slate-800/50"
                    >
                        <div>
                            <span className="text-3xl font-bold text-slate-100 mb-1 block">{s.value}</span>
                            <span className="text-sm font-medium text-slate-500 tracking-wide">{s.label}</span>
                        </div>
                        <div className={cn("p-4 rounded-xl bg-slate-800/50", s.color)}>
                            <s.icon className={"w-6 h-6"} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Top Widget Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 h-[300px]">
                    <VendorRiskDistributionWidget />
                </div>
                <div className="lg:col-span-2 h-[300px]">
                    <VendorQuestionnairesWidget />
                </div>
            </div>

            {/* Bottom Widget Row */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-[400px]">
                <div className="xl:col-span-1">
                    <TopVendorRisksWidget />
                </div>
                <div className="xl:col-span-2">
                    <VendorMapWidget />
                </div>
                <div className="xl:col-span-1">
                    <VendorActionListWidget />
                </div>
            </div>
        </div>
    );
}
