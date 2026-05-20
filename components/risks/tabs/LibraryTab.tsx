"use client";

import React, { useMemo, useState } from "react";
import { Search, Filter, BookOpen, CheckCircle2 } from "lucide-react";
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

            {/* Table */}
            <div className="rounded-2xl border border-border/60 bg-card/30 overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground text-sm">No library risks match your filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-muted-foreground font-mono uppercase bg-card/50 border-b border-border/60">
                                <tr>
                                    <th className="px-5 py-3 text-left">Risk</th>
                                    <th className="px-5 py-3 text-left">Category</th>
                                    <th className="px-5 py-3 text-center">Score</th>
                                    <th className="px-5 py-3 text-left">Frameworks</th>
                                    <th className="px-5 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {filtered.map(risk => {
                                    const score = risk.defaultLikelihood * risk.defaultImpact;
                                    const sev = severityFromScore(score);
                                    const added = inRegister.has(risk.id);
                                    return (
                                        <tr
                                            key={risk.id}
                                            onClick={() => setSelectedId(risk.id)}
                                            className="hover:bg-secondary/20 transition-colors cursor-pointer"
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sev.dot}`} />
                                                    <span className="font-medium text-foreground truncate max-w-[320px]" title={risk.title}>
                                                        {risk.title}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5 ml-4">
                                                    {risk.id}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5 text-muted-foreground text-xs">{risk.category}</td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${sev.bg} ${sev.color} ${sev.border}`}>
                                                    {score} · {sev.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex flex-wrap gap-1">
                                                    {risk.frameworkMappings.slice(0, 3).map((m, i) => (
                                                        <span key={`${risk.id}-${m.framework}-${m.clause}-${i}`} className={`px-1.5 py-0.5 text-[9px] uppercase font-bold rounded border ${FRAMEWORK_BADGE_COLORS[m.framework]}`}>
                                                            {FRAMEWORK_LABELS[m.framework]}
                                                        </span>
                                                    ))}
                                                    {risk.frameworkMappings.length > 3 && (
                                                        <span className="text-[9px] text-muted-foreground">+{risk.frameworkMappings.length - 3}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                {added ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                                                        <CheckCircle2 className="w-3 h-3" /> in register
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground/70">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="flex items-center justify-end gap-2 px-5 py-2 border-t border-border/40 text-[11px] text-muted-foreground">
                    <Filter className="w-3 h-3" /> {filtered.length} of {RISK_LIBRARY.length}
                </div>
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
