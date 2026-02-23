"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Server, Lock, Fingerprint, Eye, ChevronRight, CheckCircle2, AlertTriangle, AlertCircle, Maximize2, ChevronDown, FileText, FileJson, FileBadge } from "lucide-react";
import { cn } from "@/components/ui/Card";

// Mock Data for 3-Level Vertical
const tscDomains = [
    { id: "security", name: "Security", icon: ShieldCheck, status: "Good", progress: 85 },
    { id: "availability", name: "Availability", icon: Server, status: "Warning", progress: 62 },
    { id: "confidentiality", name: "Confidentiality", icon: Lock, status: "Good", progress: 91 },
    { id: "processing", name: "Processing Integrity", icon: Fingerprint, status: "Critical", progress: 34 },
    { id: "privacy", name: "Privacy", icon: Eye, status: "Warning", progress: 58 },
];

const categoriesData: Record<string, any[]> = {
    security: [
        { id: "cc1", name: "Control Environment (CC1)", count: 5, passed: 5 },
        { id: "cc2", name: "Communication & Information (CC2)", count: 3, passed: 2 },
        { id: "cc3", name: "Risk Assessment (CC3)", count: 4, passed: 3 },
        { id: "cc4", name: "Monitoring Activities (CC4)", count: 2, passed: 2 },
        { id: "cc5", name: "Control Activities (CC5)", count: 7, passed: 4 },
        { id: "cc6", name: "Logical & Physical Access (CC6)", count: 8, passed: 7 },
    ],
    availability: [
        { id: "a1", name: "System Availability (A1)", count: 3, passed: 2 },
    ],
    confidentiality: [
        { id: "c1", name: "Confidentiality Processing (C1)", count: 2, passed: 2 },
    ],
    processing: [
        { id: "pi1", name: "System Processing (PI1)", count: 5, passed: 1 },
    ],
    privacy: [
        { id: "p1", name: "Notice & Communication (P1)", count: 8, passed: 4 },
        { id: "p2", name: "Choice & Consent (P2)", count: 3, passed: 2 },
    ]
};

const controlsData: Record<string, any[]> = {
    cc1: [
        { id: "CC1.1", desc: "Entity demonstrates commitment to integrity and ethical values.", status: "passed", type: "Automated" },
        { id: "CC1.2", desc: "Board of directors demonstrates independence from management.", status: "passed", type: "Manual" },
        { id: "CC1.3", desc: "Management establishes structures, reporting lines, and authorities.", status: "passed", type: "Manual" },
        { id: "CC1.4", desc: "Entity demonstrates commitment to attract, develop, and retain competent individuals.", status: "passed", type: "Manual" },
        { id: "CC1.5", desc: "Entity holds individuals accountable for internal control responsibilities.", status: "passed", type: "Automated" },
    ],
    cc2: [
        { id: "CC2.1", desc: "Entity obtains or generates and uses relevant, quality information.", status: "passed", type: "Automated" },
        { id: "CC2.2", desc: "Entity internally communicates information, including objectives and responsibilities for internal control.", status: "failed", type: "Manual" },
        { id: "CC2.3", desc: "Entity communicates with external parties regarding matters affecting functioning of internal control.", status: "passed", type: "Manual" },
    ],
    cc6: [
        { id: "CC6.1", desc: "Entity implements logical access security software, infrastructure, and architectures.", status: "passed", type: "Automated" },
        { id: "CC6.2", desc: "Entity registers and authorizes new internal and external users.", status: "passed", type: "Automated" },
        { id: "CC6.3", desc: "Entity authorizes, modifies, or removes access to data, software, functions.", status: "passed", type: "Automated" },
        { id: "CC6.4", desc: "Entity restricts physical access to facilities and protected information assets.", status: "failed", type: "Manual" },
        { id: "CC6.5", desc: "Entity discontinues logical and physical protections over physical assets.", status: "passed", type: "Manual" },
        { id: "CC6.6", desc: "Entity implements logical access security measures to protect against threats from outside boundaries.", status: "passed", type: "Automated" },
        { id: "CC6.7", desc: "Entity restricts the transmission, movement, and removal of information.", status: "passed", type: "Automated" },
        { id: "CC6.8", desc: "Entity implements controls to prevent or detect and act upon the introduction of unauthorized software.", status: "passed", type: "Automated" },
    ]
};

// Evidence coverage data per control
const evidenceData: Record<string, { files: { name: string; type: string; icon: any }[] }> = {
    "CC1.1": { files: [{ name: "Code of Ethics Policy.pdf", type: "PDF", icon: FileBadge }, { name: "Annual Ethics Training Log", type: "XLSX", icon: FileText }] },
    "CC1.2": { files: [{ name: "Board Meeting Minutes Q3.pdf", type: "PDF", icon: FileBadge }] },
    "CC1.3": { files: [{ name: "Org Chart v4.2.pdf", type: "PDF", icon: FileBadge }, { name: "RACI Matrix.xlsx", type: "XLSX", icon: FileText }] },
    "CC1.4": { files: [{ name: "HR Onboarding Checklist.pdf", type: "PDF", icon: FileBadge }, { name: "Training Completion Report.json", type: "JSON", icon: FileJson }] },
    "CC1.5": { files: [{ name: "Performance Review Policy.pdf", type: "PDF", icon: FileBadge }] },
    "CC2.1": { files: [{ name: "Data Quality Framework.pdf", type: "PDF", icon: FileBadge }] },
    "CC2.2": { files: [{ name: "Internal Communication Policy.pdf", type: "PDF", icon: FileBadge }] },
    "CC2.3": { files: [{ name: "External Communication Log.xlsx", type: "XLSX", icon: FileText }] },
    "CC6.1": { files: [{ name: "AWS IAM Policy Export.json", type: "JSON", icon: FileJson }, { name: "Azure AD Config.json", type: "JSON", icon: FileJson }] },
    "CC6.2": { files: [{ name: "User Provisioning Workflow.pdf", type: "PDF", icon: FileBadge }] },
    "CC6.3": { files: [{ name: "Access Review Report Q3.xlsx", type: "XLSX", icon: FileText }] },
    "CC6.4": { files: [{ name: "Physical Access Audit.pdf", type: "PDF", icon: FileBadge }] },
    "CC6.5": { files: [{ name: "Asset Decommission Log.xlsx", type: "XLSX", icon: FileText }] },
    "CC6.6": { files: [{ name: "Firewall Rules Export.json", type: "JSON", icon: FileJson }, { name: "WAF Config.json", type: "JSON", icon: FileJson }] },
    "CC6.7": { files: [{ name: "DLP Policy Config.json", type: "JSON", icon: FileJson }] },
    "CC6.8": { files: [{ name: "Endpoint Security Report.pdf", type: "PDF", icon: FileBadge }] },
};

// Heatmap data
const INFRA_CATEGORIES = ["AWS", "Azure", "GCP", "On-Premise"];
const SECURITY_SUBCATEGORIES = ["IAM", "Network Security", "Data Protection", "Encryption", "Logging & Monitoring", "Incident Response"];

const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};
const stringToSeed = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash);
};

function getIntensityClass(value: number): string {
    if (value >= 0.85) return "bg-emerald-500/80 text-emerald-50 shadow-emerald-500/20";
    if (value >= 0.7) return "bg-emerald-600/60 text-emerald-100";
    if (value >= 0.5) return "bg-teal-600/50 text-teal-100";
    if (value >= 0.35) return "bg-amber-500/50 text-amber-100";
    if (value >= 0.2) return "bg-orange-500/40 text-orange-100";
    return "bg-red-500/35 text-red-200";
}

function getIntensityLabel(value: number): string {
    if (value >= 0.85) return "Strong";
    if (value >= 0.7) return "Good";
    if (value >= 0.5) return "Partial";
    if (value >= 0.35) return "Weak";
    if (value >= 0.2) return "Low";
    return "Gap";
}

function EvidenceHeatmapInline({ controlId }: { controlId: string }) {
    const baseSeed = stringToSeed(controlId);

    const heatmapData = React.useMemo(() => {
        return INFRA_CATEGORIES.map((_, catIdx) =>
            SECURITY_SUBCATEGORIES.map((_, subIdx) => {
                return seededRandom(baseSeed + catIdx * 100 + subIdx * 17);
            })
        );
    }, [baseSeed]);

    const files = evidenceData[controlId]?.files || [
        { name: "Evidence Artifact.pdf", type: "PDF", icon: FileBadge },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 pt-4 border-t border-slate-700/40"
        >
            {/* Linked Evidence Files */}
            <div className="mb-5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Linked Evidence</span>
                <div className="flex flex-wrap gap-2">
                    {files.map((file, i) => (
                        <div
                            key={i}
                            className="flex items-center space-x-2 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 cursor-pointer hover:border-blue-500/30 hover:bg-slate-800 transition-all group"
                        >
                            <file.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                            <span className="text-xs text-slate-300 font-medium truncate max-w-[150px]">{file.name}</span>
                            <span className="text-[9px] text-slate-500 font-mono uppercase">{file.type}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Heatmap Grid */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Coverage Heatmap</span>
                    <div className="flex items-center space-x-1 text-[9px] text-slate-500">
                        <span>Gap</span>
                        <div className="flex space-x-px">
                            <div className="w-2.5 h-2.5 rounded-sm bg-red-500/35" />
                            <div className="w-2.5 h-2.5 rounded-sm bg-orange-500/40" />
                            <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/50" />
                            <div className="w-2.5 h-2.5 rounded-sm bg-teal-600/50" />
                            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600/60" />
                            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80" />
                        </div>
                        <span>Strong</span>
                    </div>
                </div>

                <div className="grid gap-1" style={{ gridTemplateColumns: "80px repeat(6, 1fr)" }}>
                    {/* Column Headers */}
                    <div />
                    {SECURITY_SUBCATEGORIES.map((sub) => (
                        <div
                            key={sub}
                            className="text-[9px] font-medium text-slate-500 text-center px-0.5 truncate"
                            title={sub}
                        >
                            {sub}
                        </div>
                    ))}

                    {/* Rows */}
                    {INFRA_CATEGORIES.map((cat, catIdx) => (
                        <React.Fragment key={cat}>
                            <div className="text-[11px] font-semibold text-slate-300 flex items-center truncate" title={cat}>
                                {cat}
                            </div>
                            {heatmapData[catIdx].map((value, subIdx) => (
                                <motion.div
                                    key={`${catIdx}-${subIdx}`}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        delay: 0.1 + catIdx * 0.05 + subIdx * 0.03,
                                        duration: 0.25,
                                        ease: "easeOut",
                                    }}
                                    className={cn(
                                        "rounded-md h-8 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:ring-1 hover:ring-white/20 hover:shadow-lg hover:z-10",
                                        getIntensityClass(value)
                                    )}
                                    title={`${cat} → ${SECURITY_SUBCATEGORIES[subIdx]}: ${Math.round(value * 100)}%`}
                                >
                                    <span className="text-[9px] font-bold opacity-90">
                                        {getIntensityLabel(value)}
                                    </span>
                                </motion.div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

export function ControlsBreakdownUX() {
    const [selectedDomain, setSelectedDomain] = useState(tscDomains[0].id);
    const [selectedCategory, setSelectedCategory] = useState("cc6");
    const [expandedControlId, setExpandedControlId] = useState<string | null>(null);

    const activeCategories = categoriesData[selectedDomain] || [];
    const activeControls = controlsData[selectedCategory] || [
        { id: `${selectedCategory.toUpperCase()}.1`, desc: "Placeholder control description for structural completeness.", status: "pending", type: "Automated" },
        { id: `${selectedCategory.toUpperCase()}.2`, desc: "Ensure automated scanners are bound to the correct asset groups.", status: "failed", type: "Automated" },
        { id: `${selectedCategory.toUpperCase()}.3`, desc: "Quarterly review of IAM permissions and role-based policies.", status: "passed", type: "Manual" },
    ];

    return (
        <div className="w-full h-full flex gap-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Level 1: Domains */}
            <div className="w-64 flex-shrink-0 flex flex-col space-y-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-2 mb-1">TSC Domains</span>
                {tscDomains.map((domain) => {
                    const isActive = selectedDomain === domain.id;
                    return (
                        <button
                            key={domain.id}
                            onClick={() => {
                                setSelectedDomain(domain.id);
                                setSelectedCategory(categoriesData[domain.id]?.[0]?.id || "");
                                setExpandedControlId(null);
                            }}
                            className={cn(
                                "flex items-center w-full px-4 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden group border",
                                isActive
                                    ? "bg-slate-800/80 border-slate-700 shadow-xl"
                                    : "bg-slate-900/30 border-transparent hover:bg-slate-800/40"
                            )}
                        >
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />}

                            <domain.icon className={cn(
                                "w-5 h-5 flex-shrink-0 mr-3 transition-colors",
                                isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400"
                            )} />

                            <div className="flex flex-col items-start w-full">
                                <span className={cn("text-sm font-semibold tracking-wide transition-colors", isActive ? "text-slate-100" : "text-slate-400 group-hover:text-slate-200")}>
                                    {domain.name}
                                </span>
                                <div className="w-full mt-2 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-1000",
                                            domain.status === "Good" ? "bg-emerald-500" : domain.status === "Warning" ? "bg-amber-500" : "bg-red-500"
                                        )}
                                        style={{ width: `${domain.progress}%` }}
                                    />
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Level 2: Categories (Sub-Domains) */}
            <div className="w-80 flex-shrink-0 flex flex-col border-l border-slate-800/50 pl-6 space-y-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-2 mb-1">Categories</span>
                <AnimatePresence mode="popLayout">
                    {activeCategories.map((category, idx) => {
                        const isActive = selectedCategory === category.id;
                        const progressPct = Math.round((category.passed / category.count) * 100);
                        return (
                            <motion.button
                                key={category.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={() => { setSelectedCategory(category.id); setExpandedControlId(null); }}
                                className={cn(
                                    "flex flex-col w-full text-left p-4 rounded-xl transition-all duration-200 border",
                                    isActive
                                        ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.1)]"
                                        : "bg-slate-900/40 border-slate-800/50 hover:border-slate-700 hover:bg-slate-800/50"
                                )}
                            >
                                <div className="flex justify-between items-start w-full mb-2">
                                    <span className={cn("text-sm font-medium", isActive ? "text-indigo-300" : "text-slate-300")}>
                                        {category.name}
                                    </span>
                                    {isActive && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                                </div>
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">
                                        {category.passed}/{category.count} Controls
                                    </span>
                                    <span className={cn("text-[10px] font-bold", progressPct === 100 ? "text-emerald-400" : progressPct > 50 ? "text-amber-400" : "text-red-400")}>
                                        {progressPct}%
                                    </span>
                                </div>
                            </motion.button>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Level 3: Controls Detail Matrix */}
            <div className="flex-1 flex flex-col border-l border-slate-800/50 pl-6 pt-2">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/50 mb-4">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center">
                        <span className="text-indigo-400 mr-2">{activeCategories.find(c => c.id === selectedCategory)?.name || "Sub-controls"}</span>
                        Metrics
                    </h3>
                    <button className="text-xs flex items-center bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition">
                        <Maximize2 className="w-3 h-3 mr-1.5" /> Full Screen
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-3">
                    <AnimatePresence mode="popLayout">
                        {activeControls.map((control, idx) => {
                            const isExpanded = expandedControlId === control.id;
                            return (
                                <motion.div
                                    key={control.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={cn(
                                        "glass-panel p-4 rounded-xl border flex flex-col transition-all group cursor-pointer",
                                        isExpanded
                                            ? "border-blue-500/30 bg-blue-500/[0.03] shadow-[0_0_30px_rgba(59,130,246,0.08)]"
                                            : "border-slate-800/50 hover:border-indigo-500/20 hover:bg-slate-800/30"
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start">
                                            <div className="mt-1 mr-3">
                                                {control.status === "passed" ? (
                                                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                    </div>
                                                ) : control.status === "failed" ? (
                                                    <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 border border-slate-700/50 px-2 py-0.5 rounded shadow-inner">
                                                        {control.id}
                                                    </span>
                                                    <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase bg-indigo-500/10 px-2 py-0.5 rounded-full">
                                                        {control.type}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                                    {control.desc}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedControlId(isExpanded ? null : control.id);
                                            }}
                                            className={cn(
                                                "text-xs font-semibold transition-all whitespace-nowrap px-3 py-1.5 rounded border flex items-center space-x-1.5",
                                                isExpanded
                                                    ? "text-blue-400 bg-blue-500/10 border-blue-500/20 opacity-100"
                                                    : "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 opacity-0 group-hover:opacity-100 hover:bg-indigo-500/20"
                                            )}
                                        >
                                            <span>{isExpanded ? "Collapse" : "View Evidence"}</span>
                                            <motion.div
                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown className="w-3 h-3" />
                                            </motion.div>
                                        </button>
                                    </div>

                                    {/* Expanded Evidence Heatmap */}
                                    {isExpanded && (
                                        <EvidenceHeatmapInline controlId={control.id} />
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
