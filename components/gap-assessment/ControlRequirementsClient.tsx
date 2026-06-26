"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Layers,
  Search,
  FileText,
  MinusCircle,
  X,
  Info,
  Calendar,
  Hash,
} from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

interface DomainSection {
  label: string;
  total: number;
  fulfilled: number;
}

interface Framework {
  id: string;
  name: string;
  version: string;
}

interface FrameworkStat {
  frameworkId: string;
  totalControls: number;
  fulfilledControls: number;
  overallScore: number;
  autoFulfilled: number;
  criticalPending: number;
  notStarted: number;
  evidencePending: number;
  domainSections: DomainSection[];
}

interface ControlListItem {
  id: string;
  frameworkId: string;
  code: string;
  title: string;
  description?: string | null;
  domain: string;
  category: string;
  sortOrder?: number;
}

interface ControlStatusItem {
  controlId: string;
  status: "verified" | "in_progress" | "not_started" | "not_applicable";
  evidenceCount: number;
  notes?: string | null;
  lastUpdated?: string | null;
}

type StatusKey = ControlStatusItem["status"];

interface ControlRequirementsClientProps {
  orgId: string;
  frameworks: Framework[];
  frameworkStats: FrameworkStat[];
  controls?: ControlListItem[];
  controlStatuses?: ControlStatusItem[];
}

const TABS = ["Overview", "All Controls"] as const;

export function ControlRequirementsClient({
  frameworks,
  frameworkStats,
  controls = [],
  controlStatuses = [],
}: ControlRequirementsClientProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Overview");
  const [activeFrameworkId, setActiveFrameworkId] = useState(
    frameworks[0]?.id ?? "",
  );
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(
    new Set(),
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StatusKey>("all");
  const [detailControlId, setDetailControlId] = useState<string | null>(null);

  const statusMap = useMemo(() => {
    const m = new Map<string, ControlStatusItem>();
    for (const s of controlStatuses) m.set(s.controlId, s);
    return m;
  }, [controlStatuses]);

  const controlsByFramework = useMemo(() => {
    const m = new Map<string, ControlListItem[]>();
    for (const c of controls) {
      const arr = m.get(c.frameworkId) ?? [];
      arr.push(c);
      m.set(c.frameworkId, arr);
    }
    return m;
  }, [controls]);

  const detailControl = detailControlId
    ? (controls.find((c) => c.id === detailControlId) ?? null)
    : null;
  const detailStatus = detailControl
    ? (statusMap.get(detailControl.id) ?? null)
    : null;
  const detailFramework = detailControl
    ? (frameworks.find((f) => f.id === detailControl.frameworkId) ?? null)
    : null;

  const activeFramework =
    frameworks.find((framework) => framework.id === activeFrameworkId) ??
    frameworks[0];
  const activeStats = frameworkStats.find(
    (stat) => stat.frameworkId === activeFramework?.id,
  );

  const totalControls = activeStats?.totalControls ?? 0;
  const fulfilledControls = activeStats?.fulfilledControls ?? 0;
  const overallScore = activeStats?.overallScore ?? 0;
  const autoFulfilled = activeStats?.autoFulfilled ?? 0;
  const criticalPending = activeStats?.criticalPending ?? 0;
  const notStarted = activeStats?.notStarted ?? 0;
  const evidencePending = activeStats?.evidencePending ?? 0;
  const domainSections = activeStats?.domainSections ?? [];

  const toggleDomain = (label: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <ClipboardList className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Control Requirements
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track your compliance posture and answer gap assessment questions
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((tab) => (
          <Button
            variant="plain"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "h-auto",
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-muted-foreground hover:text-muted-foreground",
            )}
          >
            {tab}
          </Button>
        ))}
      </div>

      {frameworks.length > 1 && (
        <div className="flex flex-wrap items-center gap-1 bg-card/50 border border-border rounded-lg p-1 w-fit">
          {frameworks.map((framework) => (
            <Button
              variant="plain"
              key={framework.id}
              onClick={() => setActiveFrameworkId(framework.id)}
              className={cn(
                "h-auto",
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                framework.id === activeFrameworkId
                  ? "bg-orange-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
              )}
            >
              {framework.name}{" "}
              {framework.version ? `v${framework.version}` : ""}
            </Button>
          ))}
        </div>
      )}

      {activeTab === "Overview" && (
        <div className="space-y-5">
          {/* Overall compliance hero card */}
          <div className="bg-card/60 border border-border rounded-xl p-6">
            <div className="flex items-center gap-8">
              {/* Circular progress */}
              <div className="relative flex-shrink-0">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke={
                      overallScore >= 80
                        ? "#10b981"
                        : overallScore >= 40
                          ? "#f59e0b"
                          : "#ef4444"
                    }
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 70 70)"
                  />
                  <text
                    x="70"
                    y="65"
                    textAnchor="middle"
                    fill="white"
                    fontSize="22"
                    fontWeight="bold"
                  >
                    {overallScore}%
                  </text>
                  <text
                    x="70"
                    y="82"
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                  >
                    overall
                  </text>
                </svg>
              </div>

              <div className="flex-1">
                <p className="text-2xl font-bold text-white mb-1">
                  {fulfilledControls} of {totalControls} controls fulfilled
                </p>
                {activeFramework && (
                  <p className="text-sm text-muted-foreground">
                    {activeFramework.name}{" "}
                    {activeFramework.version
                      ? `v${activeFramework.version}`
                      : ""}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="flex items-center gap-1.5 text-xs text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {criticalPending} Critical Pending
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    {evidencePending} Evidence Pending
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    {notStarted} Not Started
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {autoFulfilled} Auto-Fulfilled
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Overall Score",
                value: `${overallScore}%`,
                icon: BarChart3,
                color: "text-orange-400",
                bg: "bg-orange-500/10 border-orange-500/20",
              },
              {
                label: "Auto-Fulfilled",
                value: autoFulfilled,
                icon: CheckCircle2,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20",
              },
              {
                label: "Critical Pending",
                value: criticalPending,
                icon: AlertTriangle,
                color: "text-red-400",
                bg: "bg-red-500/10 border-red-500/20",
              },
              {
                label: "Not Started",
                value: notStarted,
                icon: XCircle,
                color: "text-muted-foreground",
                bg: "bg-secondary/50 border-border/50",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "bg-card/60 border rounded-xl p-4",
                  stat.bg.split(" ")[1] ? "border-border" : "",
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </span>
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                </div>
                <p className={cn("text-2xl font-bold", stat.color)}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Section Coverage */}
          <div className="bg-card/60 border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">
                  Section Coverage
                </span>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>Select source ↕ Highest</span>
              </div>
            </div>

            {domainSections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Target className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">
                  No control sections found
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {domainSections.map((domain) => {
                  const pct =
                    domain.total > 0
                      ? Math.round((domain.fulfilled / domain.total) * 100)
                      : 0;
                  const isExpanded = expandedDomains.has(domain.label);
                  const domainControls = (
                    controlsByFramework.get(activeFrameworkId) ?? []
                  )
                    .filter((c) => (c.domain || "General") === domain.label)
                    .sort((a, b) => {
                      const aSort = a.sortOrder ?? 0;
                      const bSort = b.sortOrder ?? 0;
                      if (aSort !== bSort) return aSort - bSort;
                      return a.code.localeCompare(b.code, undefined, {
                        numeric: true,
                      });
                    });
                  return (
                    <div key={domain.label}>
                      <Button
                        variant="plain"
                        onClick={() => toggleDomain(domain.label)}
                        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/30 transition-colors text-left h-auto"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground truncate">
                            {domain.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32 bg-secondary rounded-full h-1.5">
                            <div
                              className={cn(
                                "h-1.5 rounded-full",
                                pct >= 80
                                  ? "bg-emerald-500"
                                  : pct >= 40
                                    ? "bg-amber-500"
                                    : "bg-red-500",
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-right tabular-nums">
                            {domain.fulfilled}/{domain.total}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-semibold w-10 text-right tabular-nums",
                              pct >= 80
                                ? "text-emerald-400"
                                : pct >= 40
                                  ? "text-amber-400"
                                  : "text-red-400",
                            )}
                          >
                            {pct}%
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </Button>
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="overflow-hidden bg-background/40 border-t border-border/60"
                          >
                            {domainControls.length === 0 ? (
                              <div className="px-5 py-4 text-xs text-muted-foreground">
                                No controls in this section.
                              </div>
                            ) : (
                              <div className="divide-y divide-border/40">
                                {domainControls.map((c) => {
                                  const s = statusMap.get(c.id);
                                  const statusKey: StatusKey = (s?.status ??
                                    "not_started") as StatusKey;
                                  const meta = metaFor(
                                    statusKey,
                                    activeFramework?.name,
                                  );
                                  const StatusIcon = meta.icon;
                                  return (
                                    <Button
                                      variant="plain"
                                      key={c.id}
                                      type="button"
                                      onClick={() => setDetailControlId(c.id)}
                                      className="w-full flex items-center gap-4 px-5 py-2.5 hover:bg-secondary/30 transition-colors text-left h-auto"
                                    >
                                      <span className="inline-block min-w-[64px] px-2 py-0.5 rounded-md bg-secondary/80 border border-border/60 font-mono text-[11px] text-foreground text-center">
                                        {c.code}
                                      </span>
                                      <span
                                        className="flex-1 text-sm text-muted-foreground leading-tight truncate"
                                        title={c.title}
                                      >
                                        {c.title}
                                      </span>
                                      <span className="hidden md:inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                                        <FileText className="w-3 h-3" />
                                        {s?.evidenceCount ?? 0}
                                      </span>
                                      <span
                                        className={cn(
                                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium",
                                          meta.cls,
                                        )}
                                      >
                                        <StatusIcon className="w-3 h-3" />
                                        {meta.label}
                                      </span>
                                      <ChevronRight className="w-3 h-3 text-muted-foreground/70" />
                                    </Button>
                                  );
                                })}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Frameworks */}
          {frameworks.length > 0 && (
            <div className="bg-card/60 border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-foreground mb-3">
                Active Frameworks
              </p>
              <div className="flex flex-wrap gap-2">
                {frameworks.map((fw) => (
                  <span
                    key={fw.id}
                    className="px-3 py-1.5 bg-secondary/60 border border-border rounded-lg text-xs text-muted-foreground font-medium"
                  >
                    {fw.name} {fw.version && `v${fw.version}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "All Controls" && (
        <AllControlsTab
          activeFrameworkId={activeFrameworkId}
          activeFrameworkName={activeFramework?.name}
          controls={controls}
          statusMap={statusMap}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onView={setDetailControlId}
        />
      )}

      <ControlDetailDialog
        control={detailControl}
        status={detailStatus}
        framework={detailFramework}
        onClose={() => setDetailControlId(null)}
      />
    </div>
  );
}

interface AllControlsTabProps {
  activeFrameworkId: string;
  activeFrameworkName?: string;
  controls: ControlListItem[];
  statusMap: Map<string, ControlStatusItem>;
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: "all" | StatusKey;
  onStatusFilterChange: (v: "all" | StatusKey) => void;
  onView: (controlId: string) => void;
}

const STATUS_META: Record<
  StatusKey,
  {
    label: string;
    cls: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  verified: {
    label: "Verified",
    cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    icon: CheckCircle2,
  },
  in_progress: {
    label: "In Progress",
    cls: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    icon: AlertTriangle,
  },
  not_started: {
    label: "Not Started",
    cls: "bg-secondary/40 text-muted-foreground border-slate-600/40",
    icon: XCircle,
  },
  not_applicable: {
    label: "Not Applicable",
    cls: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    icon: MinusCircle,
  },
};

// ISO 9001 auditors think in conformance vocabulary, not security-control
// status. For the quality framework we relabel the same underlying statuses
// (the stored enum and scoring are unchanged) to Conformant / Minor NC /
// Major NC / Excluded. See Overwatch ISO 9001 plan §3.1.
const QMS_STATUS_META: Record<StatusKey, (typeof STATUS_META)[StatusKey]> = {
  verified: {
    label: "Conformant",
    cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    icon: CheckCircle2,
  },
  in_progress: {
    label: "Minor NC",
    cls: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    icon: AlertTriangle,
  },
  not_started: {
    label: "Major NC",
    cls: "bg-red-500/10 text-red-300 border-red-500/30",
    icon: XCircle,
  },
  not_applicable: {
    label: "Excluded (N/A)",
    cls: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    icon: MinusCircle,
  },
};

function isQmsFramework(name?: string | null): boolean {
  return (name ?? "").toLowerCase().startsWith("iso 9001");
}

function metaFor(
  statusKey: StatusKey,
  frameworkName?: string | null,
): (typeof STATUS_META)[StatusKey] {
  return isQmsFramework(frameworkName)
    ? QMS_STATUS_META[statusKey]
    : STATUS_META[statusKey];
}

function statusFiltersFor(
  frameworkName?: string | null,
): Array<{ value: "all" | StatusKey; label: string }> {
  const qms = isQmsFramework(frameworkName);
  return [
    { value: "all", label: "All" },
    { value: "verified", label: qms ? "Conformant" : "Verified" },
    { value: "in_progress", label: qms ? "Minor NC" : "In Progress" },
    { value: "not_started", label: qms ? "Major NC" : "Not Started" },
    {
      value: "not_applicable",
      label: qms ? "Excluded (N/A)" : "Not Applicable",
    },
  ];
}

function AllControlsTab({
  activeFrameworkId,
  activeFrameworkName,
  controls,
  statusMap,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onView,
}: AllControlsTabProps) {
  const scoped = useMemo(
    () => controls.filter((c) => c.frameworkId === activeFrameworkId),
    [controls, activeFrameworkId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scoped.filter((c) => {
      if (statusFilter !== "all") {
        const s = statusMap.get(c.id)?.status ?? "not_started";
        if (s !== statusFilter) return false;
      }
      if (!q) return true;
      return (
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q)
      );
    });
  }, [scoped, search, statusFilter, statusMap]);

  // Group by domain
  const grouped = useMemo(() => {
    const map = new Map<string, ControlListItem[]>();
    for (const c of filtered) {
      const arr = map.get(c.domain) ?? [];
      arr.push(c);
      map.set(c.domain, arr);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([domain, items]) => ({
        domain,
        items: items.sort((a, b) =>
          a.code.localeCompare(b.code, undefined, { numeric: true }),
        ),
      }));
  }, [filtered]);

  if (scoped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-card/40 border border-border rounded-xl">
        <Layers className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground font-medium">
          No controls found
          {activeFrameworkName ? ` for ${activeFrameworkName}` : ""}
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          Ask your admin to seed controls for this framework.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by code, name, domain…"
            className="w-full bg-background/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          />
        </div>
        <div className="flex items-center gap-1 bg-card/50 border border-border rounded-lg p-1">
          {statusFiltersFor(activeFrameworkName).map((f) => (
            <Button
              variant="plain"
              key={f.value}
              type="button"
              onClick={() => onStatusFilterChange(f.value)}
              className={cn(
                "h-auto",
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                statusFilter === f.value
                  ? "bg-orange-600 text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
              )}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {filtered.length} of {scoped.length} controls
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card/40 border border-border rounded-xl">
          <Search className="w-10 h-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground text-sm">
            No controls match your filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((g) => (
            <div
              key={g.domain}
              className="bg-card/40 border border-border rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-card/60">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">
                    {g.domain}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {g.items.length}
                </span>
              </div>
              <div className="divide-y divide-border/40">
                {g.items.map((c) => {
                  const s = statusMap.get(c.id);
                  const statusKey: StatusKey = (s?.status ??
                    "not_started") as StatusKey;
                  const meta = metaFor(statusKey, activeFrameworkName);
                  const StatusIcon = meta.icon;
                  return (
                    <Button
                      variant="plain"
                      key={c.id}
                      type="button"
                      onClick={() => onView(c.id)}
                      className="w-full flex items-center gap-4 px-5 py-3 hover:bg-secondary/30 transition-colors text-left group h-auto"
                    >
                      <span className="inline-block min-w-[64px] px-2 py-0.5 rounded-md bg-secondary/80 border border-border/60 font-mono text-xs text-foreground text-center">
                        {c.code}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm text-foreground leading-tight truncate"
                          title={c.title}
                        >
                          {c.title}
                        </p>
                        {c.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {c.description}
                          </p>
                        )}
                      </div>
                      <span className="hidden md:inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                        <FileText className="w-3 h-3" />
                        {s?.evidenceCount ?? 0}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium",
                          meta.cls,
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {meta.label}
                      </span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground/70 group-hover:text-muted-foreground transition-colors" />
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ControlDetailDialogProps {
  control: ControlListItem | null;
  status: ControlStatusItem | null;
  framework: Framework | null;
  onClose: () => void;
}

function ControlDetailDialog({
  control,
  status,
  framework,
  onClose,
}: ControlDetailDialogProps) {
  const open = !!control;
  const meta = control
    ? metaFor((status?.status ?? "not_started") as StatusKey, framework?.name)
    : null;
  const StatusIcon = meta?.icon ?? Info;

  return (
    <AnimatePresence>
      {open && control && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-card border border-border/60 rounded-2xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 pt-6 pb-4 border-b border-border/60 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-secondary/80 border border-border/60 font-mono text-xs text-foreground">
                    {control.code}
                  </span>
                  {meta && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium",
                        meta.cls,
                      )}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {meta.label}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-foreground leading-tight">
                  {control.title}
                </h2>
                {framework && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {framework.name}
                    {framework.version ? ` v${framework.version}` : ""}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="plain"
                size="icon-sm"
                onClick={onClose}
                className="text-muted-foreground flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {control.description ? (
                <section>
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Requirement
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {control.description}
                  </p>
                </section>
              ) : (
                <section>
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Requirement
                  </h3>
                  <p className="text-sm text-muted-foreground italic">
                    No description provided.
                  </p>
                </section>
              )}

              <div className="grid grid-cols-2 gap-3">
                <DetailCell
                  icon={Layers}
                  label="Domain"
                  value={control.domain || "—"}
                />
                <DetailCell
                  icon={Hash}
                  label="Sort order"
                  value={String(control.sortOrder ?? 0)}
                  mono
                />
                <DetailCell
                  icon={FileText}
                  label="Evidence linked"
                  value={String(status?.evidenceCount ?? 0)}
                  mono
                />
                <DetailCell
                  icon={Calendar}
                  label="Last updated"
                  value={
                    status?.lastUpdated
                      ? new Date(status.lastUpdated).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "short", day: "numeric" },
                        )
                      : "—"
                  }
                />
              </div>

              {status?.notes && (
                <section>
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Notes
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line bg-background/40 border border-border rounded-lg px-3 py-2">
                    {status.notes}
                  </p>
                </section>
              )}

              {control.category && (
                <section className="text-xs text-muted-foreground">
                  Category:{" "}
                  <span className="text-muted-foreground">
                    {control.category}
                  </span>
                </section>
              )}
            </div>

            <div className="px-6 pb-6 pt-2 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-auto px-4 py-2 rounded-lg text-sm text-muted-foreground"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DetailCell({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <p
        className={cn(
          "text-sm text-foreground",
          mono && "font-mono tabular-nums",
        )}
      >
        {value}
      </p>
    </div>
  );
}
