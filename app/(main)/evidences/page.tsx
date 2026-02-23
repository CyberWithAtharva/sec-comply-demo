"use client";

import React from "react";
import { FolderGit2, FileCheck, CloudUpload } from "lucide-react";

import { EvidencePipelineWidget } from "@/components/widgets/evidences/EvidencePipelineWidget";
import { ControlCoverageWidget } from "@/components/widgets/evidences/ControlCoverageWidget";
import { StaleEvidenceWidget } from "@/components/widgets/evidences/StaleEvidenceWidget";
import { EvidenceArtifactGrid } from "@/components/widgets/evidences/EvidenceArtifactGrid";
import { ReviewerQueueWidget } from "@/components/widgets/evidences/ReviewerQueueWidget";

export default function EvidencesPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <FolderGit2 className="w-8 h-8 mr-3 text-indigo-500" />
                        Evidence Vault
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Centralized repository for compliance artifacts, automated synchronizations, and review workflows.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="px-5 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-300 transition-all flex items-center">
                        <FileCheck className="w-4 h-4 mr-2" />
                        Bulk Review
                    </button>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all flex items-center">
                        <CloudUpload className="w-4 h-4 mr-2" />
                        Upload Artifact
                    </button>
                </div>
            </div>

            {/* Top Row: Pipeline, Coverage, Stale */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 h-[320px]">
                    <EvidencePipelineWidget />
                </div>
                <div className="lg:col-span-1 h-[320px]">
                    <ControlCoverageWidget />
                </div>
                <div className="lg:col-span-1 h-[320px]">
                    <StaleEvidenceWidget />
                </div>
            </div>

            {/* Bottom Row: Artifact Grid, Reviewer Queue */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[380px]">
                <div className="xl:col-span-2">
                    <EvidenceArtifactGrid />
                </div>
                <div className="xl:col-span-1">
                    <ReviewerQueueWidget />
                </div>
            </div>
        </div>
    );
}
