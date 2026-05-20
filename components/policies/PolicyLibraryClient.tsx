"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FileText, Search, ChevronRight, ShieldCheck, Clock, FilePen,
    Sliders, Plus, Sparkles, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, cn } from "@/components/ui/Card";
import {
    FRAMEWORKS, FRAMEWORK_CLASSES, CATEGORIES,
    STATUS_LABEL, STATUS_CLASSES, normaliseStatus,
    type PolicyListItem, type PolicyStatusV2,
} from "./policy-shared";
import { CustomPolicyWizardModal } from "./CustomPolicyWizardModal";

interface Props {
    policies: PolicyListItem[];
    orgName: string;
}

function StatusPill({ status }: { status: string }) {
    const s = normaliseStatus(status);
    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider", STATUS_CLASSES[s])}>
            <span className={cn("w-1.5 h-1.5 rounded-full",
                s === "active" ? "bg-emerald-400" : s === "in_review" ? "bg-amber-400" : s === "superseded" ? "bg-muted-foreground/50" : "bg-muted-foreground")} />
            {STATUS_LABEL[s]}
        </span>
    );
}

function FrameworkChip({ id, mini = false }: { id: string; mini?: boolean }) {
    const fw = FRAMEWORKS.find(f => f.id === id);
    if (!fw) return null;
    return (
        <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded border font-mono font-semibold",
            FRAMEWORK_CLASSES[id] ?? "bg-secondary/40 text-muted-foreground border-border",
            mini ? "text-[9px]" : "text-[10px]")}
        >
            {fw.short}
        </span>
    );
}

function AckRing({ pct, size = 56, stroke = 5 }: { pct: number; size?: number; stroke?: number }) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const dash = (pct / 100) * c;
    const ringColor = pct === 100 ? "stroke-emerald-400" : pct >= 50 ? "stroke-orange-400" : "stroke-amber-400";
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-border" strokeWidth={stroke} />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                className={ringColor}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${c}`}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
            <text x={size / 2} y={size / 2 + 3} textAnchor="middle" className="fill-foreground font-bold" style={{ fontSize: size * 0.28 }}>
                {pct}%
            </text>
        </svg>
    );
}

export function PolicyLibraryClient({ policies, orgName }: Props) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | PolicyStatusV2>("all");
    const [fwFilter, setFwFilter] = useState<string>("all");
    const [catFilter, setCatFilter] = useState<string>("all");
    const [wizardOpen, setWizardOpen] = useState(false);

    const counts = useMemo(() => {
        const c: Record<PolicyStatusV2, number> = { draft: 0, in_review: 0, awaiting_approval: 0, active: 0, superseded: 0 };
        policies.forEach(p => { c[normaliseStatus(p.status)]++; });
        return c;
    }, [policies]);

    const filtered = useMemo(() => policies.filter(p => {
        const norm = normaliseStatus(p.status);
        if (statusFilter !== "all" && norm !== statusFilter) return false;
        if (fwFilter !== "all" && !p.frameworks_list.includes(fwFilter)) return false;
        if (catFilter !== "all" && p.category !== catFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!p.title.toLowerCase().includes(q) && !(p.code ?? "").toLowerCase().includes(q)) return false;
        }
        return true;
    }), [policies, statusFilter, fwFilter, catFilter, search]);

    const totalAcks = policies.filter(p => normaliseStatus(p.status) === "active").reduce((s, p) => s + p.ackDone, 0);
    const totalAckTotal = policies.filter(p => normaliseStatus(p.status) === "active").reduce((s, p) => s + p.ackTotal, 0);
    const ackPct = totalAckTotal ? Math.round((totalAcks / totalAckTotal) * 100) : 0;

    const hasAnyFilter = search || statusFilter !== "all" || fwFilter !== "all" || catFilter !== "all";

    return (
        <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <FileText className="w-7 h-7 text-primary" />
                        Policy Management
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {policies.length} framework-mapped policies for {orgName}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/policies/variables">
                        <Button variant="ghost" size="sm" className="gap-2"><Sliders className="w-4 h-4" /> Variables</Button>
                    </Link>
                    <Button variant="default" size="sm" className="gap-2" onClick={() => setWizardOpen(true)}>
                        <Plus className="w-4 h-4" /> New policy
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Active policies" value={counts.active} sub={`of ${policies.length} applicable`}
                    icon={<ShieldCheck className="w-5 h-5" />} tone="emerald" />
                <KpiCard label="In review" value={counts.in_review} sub="awaiting approval"
                    icon={<Clock className="w-5 h-5" />} tone="amber" />
                <KpiCard label="Drafts" value={counts.draft} sub="edit & submit"
                    icon={<FilePen className="w-5 h-5" />} tone="slate" />
                <Card variant="solid" className="p-4 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Acknowledgement</div>
                        <div className="text-3xl font-bold text-foreground mt-1 tracking-tight">{ackPct}%</div>
                        <div className="text-xs text-muted-foreground mt-1">{totalAcks} / {totalAckTotal} employees</div>
                    </div>
                    <AckRing pct={ackPct} size={64} stroke={6} />
                </Card>
            </div>

            {/* Filters */}
            <Card variant="solid" className="p-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search policy name or code…"
                            className="w-full bg-secondary/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/50"
                        />
                    </div>
                    <FilterPill label="Status" value={statusFilter} onChange={v => setStatusFilter(v as "all" | PolicyStatusV2)}
                        options={[
                            { value: "all", label: "All statuses" },
                            { value: "active", label: `Active (${counts.active})` },
                            { value: "in_review", label: `In Review (${counts.in_review})` },
                            { value: "awaiting_approval", label: `Awaiting Approval (${counts.awaiting_approval})` },
                            { value: "draft", label: `Draft (${counts.draft})` },
                            { value: "superseded", label: `Superseded (${counts.superseded})` },
                        ]}
                    />
                    <FilterPill label="Framework" value={fwFilter} onChange={setFwFilter}
                        options={[
                            { value: "all", label: "All frameworks" },
                            ...FRAMEWORKS.map(f => ({ value: f.id, label: f.label })),
                        ]}
                    />
                    <FilterPill label="Category" value={catFilter} onChange={setCatFilter}
                        options={[
                            { value: "all", label: "All categories" },
                            ...CATEGORIES.map(c => ({ value: c, label: c })),
                        ]}
                    />
                    {hasAnyFilter && (
                        <Button variant="ghost" size="sm"
                            onClick={() => { setSearch(""); setStatusFilter("all"); setFwFilter("all"); setCatFilter("all"); }}
                            className="gap-1">
                            <X className="w-3.5 h-3.5" /> Clear
                        </Button>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">{filtered.length} of {policies.length}</span>
                </div>
            </Card>

            {/* Table */}
            <Card variant="solid" className="overflow-hidden p-0">
                {filtered.length === 0 ? (
                    <div className="p-12 flex flex-col items-center text-center gap-3">
                        <Sparkles className="w-10 h-10 text-muted-foreground/40" />
                        <div className="text-sm font-medium text-muted-foreground">No policies match your filters.</div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider bg-secondary/30 border-b border-border">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Policy</th>
                                    <th className="px-3 py-3 font-medium">Category</th>
                                    <th className="px-3 py-3 font-medium">Frameworks</th>
                                    <th className="px-3 py-3 font-medium">Status</th>
                                    <th className="px-3 py-3 font-medium">Version</th>
                                    <th className="px-3 py-3 font-medium">Acknowledgement</th>
                                    <th className="px-3 py-3 font-medium">Last updated</th>
                                    <th className="px-3 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filtered.map(p => {
                                    const ackPct = p.ackTotal ? Math.round((p.ackDone / p.ackTotal) * 100) : null;
                                    const norm = normaliseStatus(p.status);
                                    return (
                                        <tr key={p.id}
                                            onClick={() => router.push(`/policies/${p.id}`)}
                                            className="cursor-pointer hover:bg-secondary/30 transition-colors"
                                        >
                                            <td className="px-5 py-3">
                                                <div className="text-sm text-foreground font-medium">{p.title}</div>
                                                {p.code && <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{p.code}</div>}
                                            </td>
                                            <td className="px-3 py-3"><span className="text-xs text-muted-foreground">{p.category ?? "—"}</span></td>
                                            <td className="px-3 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {p.frameworks_list.length > 0
                                                        ? p.frameworks_list.map(f => <FrameworkChip key={f} id={f} />)
                                                        : <span className="text-xs text-muted-foreground/60">—</span>}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3"><StatusPill status={p.status} /></td>
                                            <td className="px-3 py-3"><span className="text-xs font-mono text-foreground">{p.version}</span></td>
                                            <td className="px-3 py-3">
                                                {norm === "active" && p.ackTotal > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                            <div className={cn("h-full rounded-full", ackPct === 100 ? "bg-emerald-500" : "bg-primary")}
                                                                style={{ width: `${ackPct}%` }} />
                                                        </div>
                                                        <span className="text-[11px] font-mono text-muted-foreground">{p.ackDone}/{p.ackTotal}</span>
                                                    </div>
                                                ) : <span className="text-xs text-muted-foreground/60">—</span>}
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(p.updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                                </div>
                                                {p.updatedBy && <div className="text-[11px] text-muted-foreground/70 mt-0.5">{p.updatedBy}</div>}
                                            </td>
                                            <td className="px-3 py-3"><ChevronRight className="w-4 h-4 text-muted-foreground/60" /></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {wizardOpen && (
                <CustomPolicyWizardModal
                    onClose={() => setWizardOpen(false)}
                    onComplete={(policyId) => {
                        setWizardOpen(false);
                        router.push(`/policies/${policyId}`);
                    }}
                />
            )}
        </div>
    );
}

function KpiCard({ label, value, sub, icon, tone }: { label: string; value: number; sub: string; icon: React.ReactNode; tone: "emerald" | "amber" | "slate" }) {
    const toneClass = {
        emerald: "bg-emerald-500/10 text-emerald-400",
        amber: "bg-amber-500/10 text-amber-400",
        slate: "bg-secondary/60 text-muted-foreground",
    }[tone];
    return (
        <Card variant="solid" className="p-4 flex items-center justify-between">
            <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">{label}</div>
                <div className="text-3xl font-bold text-foreground mt-1 tracking-tight">{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{sub}</div>
            </div>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", toneClass)}>{icon}</div>
        </Card>
    );
}

function FilterPill({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
    const isAll = value === "all";
    const current = options.find(o => o.value === value);
    return (
        <label className={cn("relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer",
            isAll ? "border-border bg-secondary/40 text-muted-foreground" : "border-primary/40 bg-primary/10 text-primary")}>
            <span className="font-medium">{label}:</span>
            <span>{isAll ? "All" : current?.label}</span>
            <ChevronRight className="w-3 h-3 rotate-90" />
            <select value={value} onChange={e => onChange(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer">
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </label>
    );
}
