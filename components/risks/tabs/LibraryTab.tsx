"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, BookOpen, CheckCircle2, ChevronRight } from "lucide-react";
import {
    RISK_LIBRARY,
    CATEGORIES,
    FRAMEWORK_LABELS,
    FRAMEWORK_BADGE_COLORS,
    type LibraryRisk,
    type Framework,
} from "@/lib/risk-library";
import { severityFromScore } from "@/lib/risk-styles";
import { LibraryRiskDetail } from "../LibraryRiskDetail";
import { AddToRegisterModal } from "../AddToRegisterModal";
import type { RiskRow, StatusHistoryRow } from "../types";

interface Props {
    risks: RiskRow[];
    orgId: string;
    onRiskAdded: (risk: RiskRow, history?: StatusHistoryRow) => void;
}

export function LibraryTab({ risks, orgId, onRiskAdded }: Props) {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [levelFilter, setLevelFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
    const [frameworkFilter, setFrameworkFilter] = useState<"all" | Framework>("all");
    const [hideAdded, setHideAdded] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [addModalRisk, setAddModalRisk] = useState<LibraryRisk | null>(null);

    // Set of library_risk_id values already on the register
    const inRegister = useMemo(() => {
        const set = new Set<string>();
        for (const r of risks) {
            if (r.library_risk_id) set.add(r.library_risk_id);
        }
        return set;
    }, [risks]);

    const filtered = useMemo(() => {
        return RISK_LIBRARY.filter(r => {
            if (search) {
                const q = search.toLowerCase();
                if (!r.title.toLowerCase().includes(q)
                    && !r.description.toLowerCase().includes(q)
                    && !r.category.toLowerCase().includes(q)
                    && !r.id.toLowerCase().includes(q)
                ) return false;
            }
            if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
            if (frameworkFilter !== "all" && !r.frameworkMappings.some(m => m.framework === frameworkFilter)) return false;
            if (levelFilter !== "all") {
                const sev = severityFromScore(r.defaultLikelihood * r.defaultImpact);
                if (sev.level !== levelFilter) return false;
            }
            if (hideAdded && inRegister.has(r.id)) return false;
            return true;
        });
    }, [search, categoryFilter, frameworkFilter, levelFilter, hideAdded, inRegister]);

    const grouped = useMemo(() => {
        const out: Record<string, LibraryRisk[]> = {};
        for (const r of filtered) (out[r.category] ??= []).push(r);
        return out;
    }, [filtered]);

    const selectedRisk = selectedId ? RISK_LIBRARY.find(r => r.id === selectedId) ?? null : null;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Risk Library</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {RISK_LIBRARY.length} pre-loaded risks across {CATEGORIES.length} categories ·
                        {" "}<span className="text-emerald-400">{inRegister.size}</span> in your register
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                <div className="relative col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by title, description, ID…"
                        className="w-full pl-9 pr-4 py-2 bg-card/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                </div>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                    className="px-2 py-2 bg-card/50 border border-border rounded-xl text-xs text-muted-foreground">
                    <option value="all">All categories</option>
                    {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name} ({c.count})</option>)}
                </select>
                <select value={levelFilter} onChange={e => setLevelFilter(e.target.value as typeof levelFilter)}
                    className="px-2 py-2 bg-card/50 border border-border rounded-xl text-xs text-muted-foreground">
                    <option value="all">All levels</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <select value={frameworkFilter} onChange={e => setFrameworkFilter(e.target.value as typeof frameworkFilter)}
                    className="px-2 py-2 bg-card/50 border border-border rounded-xl text-xs text-muted-foreground">
                    <option value="all">All frameworks</option>
                    <option value="iso27001">ISO 27001</option>
                    <option value="soc2">SOC 2</option>
                    <option value="hipaa">HIPAA</option>
                    <option value="gdpr">GDPR</option>
                    <option value="dpdp">DPDP</option>
                </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                    type="checkbox"
                    checked={hideAdded}
                    onChange={e => setHideAdded(e.target.checked)}
                    className="accent-blue-500"
                />
                Hide risks already in my register
            </label>

            {/* Grouped grid */}
            {filtered.length === 0 ? (
                <div className="rounded-2xl border border-border/60 bg-card/30 py-20 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-4 mx-auto" />
                    <p className="text-muted-foreground text-sm">No library risks match your filters.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {CATEGORIES.map(({ name }) => {
                        const items = grouped[name];
                        if (!items?.length) return null;
                        return (
                            <section key={name}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground">{name}</h3>
                                    <span className="text-[11px] text-muted-foreground/70 font-mono">{items.length}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {items.map(risk => {
                                        const score = risk.defaultLikelihood * risk.defaultImpact;
                                        const sev = severityFromScore(score);
                                        const added = inRegister.has(risk.id);
                                        return (
                                            <Button variant="plain"
                                                key={risk.id}
                                                onClick={() => setSelectedId(risk.id)}
                                                className="text-left rounded-2xl border border-border hover:border-border bg-card/40 hover:bg-card/70 p-4 transition-colors group h-auto"
                                            >
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[10px] font-mono text-muted-foreground/70">{risk.id}</span>
                                                    {added && (
                                                        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                                                            <CheckCircle2 className="w-3 h-3" /> in register
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-foreground mb-2 line-clamp-2">{risk.title}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{risk.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${sev.bg} ${sev.color} ${sev.border}`}>
                                                        {sev.label} · {score}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {risk.frameworkMappings.slice(0, 3).map((m, i) => (
                                                            <span key={`${risk.id}-${m.framework}-${m.clause}-${i}`} className={`px-1.5 py-0.5 text-[9px] uppercase font-bold rounded border ${FRAMEWORK_BADGE_COLORS[m.framework]}`}>
                                                                {FRAMEWORK_LABELS[m.framework].replace(" ", "")}
                                                            </span>
                                                        ))}
                                                        {risk.frameworkMappings.length > 3 && (
                                                            <span className="text-[9px] text-muted-foreground">+{risk.frameworkMappings.length - 3}</span>
                                                        )}
                                                        <ChevronRight className="w-3 h-3 text-muted-foreground/70 group-hover:text-muted-foreground ml-1" />
                                                    </div>
                                                </div>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}

            <div className="flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
                <Filter className="w-3 h-3" /> {filtered.length} of {RISK_LIBRARY.length}
            </div>

            {/* Detail panel */}
            {selectedRisk && (
                <LibraryRiskDetail
                    libraryRisk={selectedRisk}
                    alreadyInRegister={inRegister.has(selectedRisk.id)}
                    onClose={() => setSelectedId(null)}
                    onAddToRegister={() => {
                        setAddModalRisk(selectedRisk);
                        setSelectedId(null);
                    }}
                />
            )}

            {/* Add-to-Register modal */}
            {addModalRisk && (
                <AddToRegisterModal
                    libraryRisk={addModalRisk}
                    orgId={orgId}
                    onClose={() => setAddModalRisk(null)}
                    onAdded={onRiskAdded}
                />
            )}
        </div>
    );
}
