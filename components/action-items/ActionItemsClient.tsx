"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
    ListChecks,
    Search,
    ArrowRight,
    AlertOctagon,
    Zap,
    FileSearch,
    ChevronRight,
    Cpu,
} from "lucide-react";
import { cn } from "@/components/ui/Card";

export interface Control {
    id: string;
    control_id: string;
    title: string;
    domain: string;
    category: string;
    framework_id: string;
}

export interface ControlStatus {
    control_id: string;
    status: string;
    evidence_count: number;
}

export interface Framework {
    id: string;
    name: string;
}

export interface ActionItemsClientProps {
    controls: Control[];
    statuses: ControlStatus[];
    frameworks: Framework[];
    orgId: string;
}

type Priority = "critical" | "evidence" | "quickwin" | "other";
type Tab = "all" | "critical" | "quickwin" | "evidence" | "questionnaire";

function isCritical(control: Control): boolean {
    const d = control.domain.toLowerCase();
    const c = control.category.toLowerCase();
    return (
        d.includes("access control") ||
        d.includes("identity") ||
        d.includes("cryptograph") ||
        d.includes("encryption") ||
        c.includes("access control") ||
        c.includes("identity") ||
        c.includes("cryptograph") ||
        c.includes("encryption")
    );
}

function isQuickWin(control: Control): boolean {
    const d = control.domain.toLowerCase();
    const c = control.category.toLowerCase();
    return (
        d.includes("logging") ||
        d.includes("documentation") ||
        d.includes("awareness") ||
        c.includes("logging") ||
        c.includes("documentation") ||
        c.includes("awareness") ||
        control.title.length < 30
    );
}

function isEvidencePending(control: Control, status: ControlStatus | undefined): boolean {
    if (!status) return false;
    return (
        status.status === "in_progress" ||
        (status.evidence_count > 0 && status.status !== "verified")
    );
}

function isAuto(control: Control): boolean {
    const d = control.domain.toLowerCase();
    const c = control.category.toLowerCase();
    return (
        d.includes("access") ||
        d.includes("cloud") ||
        d.includes("network") ||
        c.includes("technical")
    );
}

function getPriority(control: Control, status: ControlStatus | undefined): Priority {
    if (isCritical(control)) return "critical";
    if (isEvidencePending(control, status)) return "evidence";
    if (isQuickWin(control)) return "quickwin";
    return "other";
}

function getPriorityLabel(priority: Priority): string {
    switch (priority) {
        case "critical": return "HIGH";
        case "evidence": return "MEDIUM";
        case "quickwin": return "LOW";
        default: return "LOW";
    }
}

function getPriorityColor(priority: Priority): string {
    switch (priority) {
        case "critical": return "bg-red-500/15 text-red-400 border-red-500/30";
        case "evidence": return "bg-amber-500/15 text-amber-400 border-amber-500/30";
        case "quickwin": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
        default: return "bg-slate-500/15 text-slate-400 border-slate-500/30";
    }
}

interface EnrichedControl {
    control: Control;
    status: ControlStatus | undefined;
    priority: Priority;
    auto: boolean;
}

export function ActionItemsClient({ controls, statuses, frameworks, orgId }: ActionItemsClientProps) {
    const [activeTab, setActiveTab] = useState<Tab>("all");
    const [search, setSearch] = useState("");

    const frameworkMap = useMemo(() => {
        return new Map(frameworks.map(f => [f.id, f.name]));
    }, [frameworks]);

    const statusMap = useMemo(() => {
        return new Map(statuses.map(s => [s.control_id, s]));
    }, [statuses]);

    // Only show controls that are NOT verified or not_applicable
    const pendingControls = useMemo<EnrichedControl[]>(() => {
        return controls
            .filter(c => {
                const s = statusMap.get(c.id);
                const st = s?.status ?? "not_started";
                return st !== "verified" && st !== "not_applicable";
            })
            .map(c => {
                const s = statusMap.get(c.id);
                return {
                    control: c,
                    status: s,
                    priority: getPriority(c, s),
                    auto: isAuto(c),
                };
            });
    }, [controls, statusMap]);

    const filtered = useMemo<EnrichedControl[]>(() => {
        let items = pendingControls;

        // Tab filter
        if (activeTab === "critical") items = items.filter(i => i.priority === "critical");
        else if (activeTab === "quickwin") items = items.filter(i => i.priority === "quickwin");
        else if (activeTab === "evidence") items = items.filter(i => i.priority === "evidence");
        else if (activeTab === "questionnaire") items = items.filter(i => !i.auto);

        // Search filter
        if (search.trim()) {
            const q = search.toLowerCase();
            items = items.filter(i =>
                i.control.title.toLowerCase().includes(q) ||
                i.control.control_id.toLowerCase().includes(q) ||
                i.control.domain.toLowerCase().includes(q)
            );
        }

        return items;
    }, [pendingControls, activeTab, search]);

    // Group into sections (only for "all" tab)
    const critical = filtered.filter(i => i.priority === "critical");
    const evidence = filtered.filter(i => i.priority === "evidence");
    const quickwins = filtered.filter(i => i.priority === "quickwin");
    const others = filtered.filter(i => i.priority === "other");

    const tabs: { id: Tab; label: string; count?: number }[] = [
        { id: "all", label: "All", count: pendingControls.length },
        { id: "critical", label: "Critical", count: pendingControls.filter(i => i.priority === "critical").length },
        { id: "quickwin", label: "Quick Wins", count: pendingControls.filter(i => i.priority === "quickwin").length },
        { id: "evidence", label: "Evidence", count: pendingControls.filter(i => i.priority === "evidence").length },
        { id: "questionnaire", label: "Questionnaire", count: pendingControls.filter(i => !i.auto).length },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <ListChecks className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-100">Action Items</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Your prioritized compliance tasks — address critical gaps and answer questionnaires
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5">
                    <span className="text-sm text-slate-400">Pending</span>
                    <span className="text-sm font-bold text-orange-400">{pendingControls.length}</span>
                </div>
            </div>

            {/* Tabs + Search row */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-slate-900/50 border border-slate-800 rounded-lg p-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                activeTab === tab.id
                                    ? "bg-orange-600 text-white shadow-sm"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                            )}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={cn(
                                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                    activeTab === tab.id
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-800 text-slate-400"
                                )}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search controls…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-60 bg-slate-900/50 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
                    />
                </div>
            </div>

            {/* Content */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <ListChecks className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-slate-400 font-medium">No action items found</p>
                    <p className="text-slate-600 text-sm mt-1">
                        {search ? "Try adjusting your search query" : "All controls are verified or not applicable"}
                    </p>
                </div>
            ) : activeTab === "all" ? (
                <div className="space-y-6">
                    {critical.length > 0 && (
                        <ControlSection
                            title="Critical — Immediate Attention"
                            icon={<AlertOctagon className="w-4 h-4 text-red-400" />}
                            iconBg="bg-red-500/10 border-red-500/20"
                            items={critical}
                            frameworkMap={frameworkMap}
                        />
                    )}
                    {evidence.length > 0 && (
                        <ControlSection
                            title="Evidence Required"
                            icon={<FileSearch className="w-4 h-4 text-amber-400" />}
                            iconBg="bg-amber-500/10 border-amber-500/20"
                            items={evidence}
                            frameworkMap={frameworkMap}
                        />
                    )}
                    {quickwins.length > 0 && (
                        <ControlSection
                            title="Quick Wins"
                            icon={<Zap className="w-4 h-4 text-emerald-400" />}
                            iconBg="bg-emerald-500/10 border-emerald-500/20"
                            items={quickwins}
                            frameworkMap={frameworkMap}
                        />
                    )}
                    {others.length > 0 && (
                        <ControlSection
                            title="Other Tasks"
                            icon={<ListChecks className="w-4 h-4 text-slate-400" />}
                            iconBg="bg-slate-800 border-slate-700"
                            items={others}
                            frameworkMap={frameworkMap}
                        />
                    )}
                </div>
            ) : (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="divide-y divide-slate-800/60">
                        {filtered.map(item => (
                            <ControlRow key={item.control.id} item={item} frameworkMap={frameworkMap} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ControlSection({
    title,
    icon,
    iconBg,
    items,
    frameworkMap,
}: {
    title: string;
    icon: React.ReactNode;
    iconBg: string;
    items: EnrichedControl[];
    frameworkMap: Map<string, string>;
}) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <div className={cn("p-1.5 rounded-lg border", iconBg)}>
                    {icon}
                </div>
                <h2 className="text-sm font-semibold text-slate-300">{title}</h2>
                <span className="text-xs text-slate-500 ml-1">{items.length} item{items.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="divide-y divide-slate-800/60">
                    {items.map(item => (
                        <ControlRow key={item.control.id} item={item} frameworkMap={frameworkMap} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function ControlRow({
    item,
    frameworkMap,
}: {
    item: EnrichedControl;
    frameworkMap: Map<string, string>;
}) {
    const { control, status, priority, auto } = item;
    const priorityLabel = getPriorityLabel(priority);
    const priorityColor = getPriorityColor(priority);
    const fwName = frameworkMap.get(control.framework_id) ?? "";
    const currentStatus = status?.status ?? "not_started";

    return (
        <div className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800/30 transition-colors group">
            {/* Priority badge */}
            <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded border flex-shrink-0",
                priorityColor
            )}>
                {priorityLabel}
            </span>

            {/* Control ID */}
            <span className="text-xs font-mono text-slate-500 flex-shrink-0 w-24 truncate" title={control.control_id}>
                {control.control_id}
            </span>

            {/* Title + domain */}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 font-medium truncate">{control.title}</p>
                <p className="text-xs text-slate-500 truncate">{control.domain}{fwName ? ` · ${fwName}` : ""}</p>
            </div>

            {/* Status */}
            <StatusBadge status={currentStatus} />

            {/* AUTO badge */}
            {auto && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex-shrink-0">
                    <Cpu className="w-2.5 h-2.5" />
                    AUTO
                </span>
            )}

            {/* View button */}
            <Link
                href="/gap-assessment"
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-orange-400 transition-colors flex-shrink-0 group-hover:text-orange-400"
            >
                View
                <ChevronRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        not_started: { label: "Not Started", cls: "text-slate-500 bg-slate-800/60 border-slate-700/50" },
        in_progress: { label: "In Progress", cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
        evidence_pending: { label: "Evidence Pending", cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
        verified: { label: "Verified", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
        not_applicable: { label: "N/A", cls: "text-slate-500 bg-slate-800/60 border-slate-700/50" },
    };
    const info = map[status] ?? { label: status, cls: "text-slate-500 bg-slate-800/60 border-slate-700/50" };
    return (
        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded border flex-shrink-0", info.cls)}>
            {info.label}
        </span>
    );
}
