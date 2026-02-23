"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

import { OverviewTab } from "@/components/tabs/OverviewTab";
import { ControlsTab } from "@/components/tabs/ControlsTab";
import { DomainsTab } from "@/components/tabs/DomainsTab";
import { PoliciesTab } from "@/components/tabs/PoliciesTab";
import { EvidenceTab } from "@/components/tabs/EvidenceTab";
import { ProgramDetailsModal } from "@/components/ui/ProgramDetailsModal";

export default function ProgramsPage() {
  const [activeFramework, setActiveFramework] = useState("soc2");
  const [activeTab, setActiveTab] = useState("Overview");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const frameworks = [
    {
      id: "soc2",
      title: "SOC 2 Type II",
      subtitle: "2017 · AICPA · 0 of 51 controls verified",
      value: 0,
      status: "Critical" as const,
      colorClass: "text-red-500",
    },
    {
      id: "iso27001",
      title: "ISO 27001",
      subtitle: "2022 · 15 of 93 controls verified",
      value: 16,
      status: "Warning" as const,
      colorClass: "text-amber-500",
    },
    {
      id: "dpd",
      title: "DPD Framework",
      subtitle: "Data Protection · 45 of 60 controls verified",
      value: 75,
      status: "Good" as const,
      colorClass: "text-emerald-500",
    }
  ];

  return (
    <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">

      {/* Header Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm font-mono text-slate-400 tracking-wide">
          <span className="hover:text-slate-200 cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-4 h-4 mx-2 opacity-50" />
          <span className="text-slate-100">Programs</span>
        </div>

        {/* Navigate to Questionnaire */}
        <a href="/questionnaire" className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-glow transition-all">
          Go to Assessment &rarr;
        </a>
      </div>

      {/* Replaced by CircularProgress rendering inside OverviewTab */}

      {/* Layout Tabs for the selected framework */}
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
          {activeTab === "Overview" && <OverviewTab key="overview" activeFramework={activeFramework} setActiveFramework={setActiveFramework} frameworks={frameworks} setIsModalOpen={setIsModalOpen} />}
          {activeTab === "Controls" && <ControlsTab key="controls" frameworkId={activeFramework} />}
          {activeTab === "Domains" && <DomainsTab key="domains" frameworkId={activeFramework} />}
          {activeTab === "Policies" && <PoliciesTab key="policies" frameworkId={activeFramework} />}
          {activeTab === "Evidence" && <EvidenceTab key="evidence" frameworkId={activeFramework} />}
        </AnimatePresence>
      </div>
      {/* Deep Dive 63-Control Modal */}
      <ProgramDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        frameworkId={activeFramework}
      />
    </div>
  );
}
