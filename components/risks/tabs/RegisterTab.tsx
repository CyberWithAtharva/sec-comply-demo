"use client";

import React, { useMemo, useState } from "react";
import { Plus, Search, Filter, Shield } from "lucide-react";
import {
    severityFromScore,
    STATUS_LABELS,
    STATUS_OPTIONS,
    STATUS_STYLES,
    TREATMENT_LABELS,
    TREATMENT_OPTIONS,
    TREATMENT_STYLES,
    type RiskStatus,
    type Treatment,
} from "@/lib/risk-styles";
import { CATEGORIES, FRAMEWORK_LABELS, FRAMEWORK_BADGE_COLORS } from "@/lib/risk-library";
import { readFrameworkMappings } from "../types";
import { AddRiskModal } from "../AddRiskModal";
import { RegisterRiskDetailPanel } from "../RegisterRiskDetailPanel";
import type { OwnerOption, RiskRow, StatusHistoryRow } from "../types";

interface Props {
    risks: RiskRow[];
    history: StatusHistoryRow[];
    orgId: string;
    owners: OwnerOption[];
    onRiskUpsert: (risk: RiskRow) => void;
    onRiskRemove: (id: string) => void;
    onHistoryAppend: (rows: StatusHistoryRow[]) => void;
}

type DueFilter = "all" | "overdue" | "this_week" | "this_month";

export function RegisterTab({
    risks, history, orgId, owners,
    onRiskUpsert, onRiskRemove, onHistoryAppend,
}: Props) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | RiskStatus>("all");
    const [levelFilter, setLevelFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [frameworkFilter, setFrameworkFilter] = useState("all");
    const [ownerFilter, setOwnerFilter] = useState("all");
    const [treatmentFilter, setTreatmentFilter] = useState<"all" | Treatment | "unset">("all");
    const [dueFilter, setDueFilter] = useState<DueFilter>("all");

    const [openModal, setOpenModal] = useState(false);
    const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return risks.filter(r => {
            const matchSearch =
                r.title.toLowerCase().includes(search.toLowerCase()) ||
                r.category.toLowerCase().includes(search.toLowerCase()) ||
                (r.description ?? "").toLowerCase().includes(search.toLowerCase());
            if (!matchSearch) return false;
            if (statusFilter !== "all" && r.status !== statusFilter) return false;
            if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
            if (ownerFilter !== "all" && r.owner_id !== ownerFilter) return false;

            if (treatmentFilter === "unset" && r.treatment !== null) return false;
            if (treatmentFilter !== "all" && treatmentFilter !== "unset" && r.treatment !== treatmentFilter) return false;

            if (levelFilter !== "all") {
                const sev = severityFromScore(r.risk_score);
                if (sev.level !== levelFilter) return false;
            }

            if (frameworkFilter !== "all") {
                const mappings = readFrameworkMappings(r.framework_mappings);
                if (!mappings.some(m => m.framework === frameworkFilter)) return false;
            }

            if (dueFilter !== "all") {
                if (!r.due_date) return false;
                const due = new Date(r.due_date);
                if (dueFilter === "overdue" && !(due < now && !["mitigated", "accepted", "transferred", "closed"].includes(r.status))) return false;
                if (dueFilter === "this_week" && !(due >= startOfWeek && due <= endOfWeek)) return false;
                if (dueFilter === "this_month" && !(due >= now && due <= endOfMonth)) return false;
            }
            return true;
        });
    }, [risks, search, statusFilter, levelFilter, categoryFilter, frameworkFilter, ownerFilter, treatmentFilter, dueFilter]);

    const selectedRisk = selectedRiskId ? risks.find(r => r.id === selectedRiskId) ?? null : null;

    return (
        <div className="space-y-5">
            {/* Header actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-100">Risk Register</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {risks.length} risks tracked · {filtered.length} shown
                    </p>
                </div>
                <button
                    onClick={() => setOpenModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Manual Risk
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
                <div className="relative col-span-2 lg:col-span-2 xl:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search risks…"
                        className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                </div>
                <SmallSelect value={statusFilter} onChange={v => setStatusFilter(v as "all" | RiskStatus)}
                    options={[{ value: "all", label: "All statuses" }, ...STATUS_OPTIONS.map(s => ({ value: s, label: STATUS_LABELS[s] }))]} />
                <SmallSelect value={levelFilter} onChange={v => setLevelFilter(v as typeof levelFilter)}
                    options={[
                        { value: "all", label: "All levels" },
                        { value: "critical", label: "Critical" },
                        { value: "high", label: "High" },
                        { value: "medium", label: "Medium" },
                        { value: "low", label: "Low" },
                    ]} />
                <SmallSelect value={categoryFilter} onChange={setCategoryFilter}
                    options={[{ value: "all", label: "All categories" }, ...CATEGORIES.map(c => ({ value: c.name, label: c.name }))]} />
                <SmallSelect value={frameworkFilter} onChange={setFrameworkFilter}
                    options={[
                        { value: "all", label: "All frameworks" },
                        { value: "iso27001", label: "ISO 27001" },
                        { value: "soc2", label: "SOC 2" },
                        { value: "hipaa", label: "HIPAA" },
                        { value: "gdpr", label: "GDPR" },
                        { value: "dpdp", label: "DPDP" },
                    ]} />
                <SmallSelect value={treatmentFilter} onChange={v => setTreatmentFilter(v as typeof treatmentFilter)}
                    options={[
                        { value: "all", label: "All treatments" },
                        ...TREATMENT_OPTIONS.map(t => ({ value: t, label: TREATMENT_LABELS[t] })),
                        { value: "unset", label: "Not set" },
                    ]} />
                <SmallSelect value={ownerFilter} onChange={setOwnerFilter}
                    options={[{ value: "all", label: "All owners" }, ...owners.map(o => ({ value: o.id, label: o.name }))]} />
                <SmallSelect value={dueFilter} onChange={v => setDueFilter(v as DueFilter)}
                    options={[
                        { value: "all", label: "Any due" },
                        { value: "overdue", label: "Overdue" },
                        { value: "this_week", label: "Due this week" },
                        { value: "this_month", label: "Due this month" },
                    ]} />
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Shield className="w-12 h-12 text-slate-700 mb-4" />
                        <p className="text-slate-500 text-sm">
                            {risks.length === 0
                                ? "No risks in the register yet. Browse the Library or add a manual risk."
                                : "No risks match your filters."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-slate-500 font-mono uppercase bg-slate-900/50 border-b border-slate-800/60">
                                <tr>
                                    <th className="px-5 py-3 text-left">Risk</th>
                                    <th className="px-5 py-3 text-left">Category</th>
                                    <th className="px-5 py-3 text-center">Score</th>
                                    <th className="px-5 py-3 text-left">Treatment</th>
                                    <th className="px-5 py-3 text-left">Status</th>
                                    <th className="px-5 py-3 text-left">Owner</th>
                                    <th className="px-5 py-3 text-left">Due</th>
                                    <th className="px-5 py-3 text-left">Frameworks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {filtered.map(risk => {
                                    const sev = severityFromScore(risk.risk_score);
                                    const residualSev = risk.residual_score ? severityFromScore(risk.residual_score) : null;
                                    const mappings = readFrameworkMappings(risk.framework_mappings);
                                    const treatment = (risk.treatment as Treatment | null) ?? null;
                                    const status = (risk.status as RiskStatus) ?? "open";
                                    return (
                                        <tr
                                            key={risk.id}
                                            onClick={() => setSelectedRiskId(risk.id)}
                                            className="hover:bg-slate-800/20 transition-colors cursor-pointer"
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sev.dot}`} />
                                                    <span className="font-medium text-slate-200 truncate max-w-[260px]" title={risk.title}>
                                                        {risk.title}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-mono text-slate-600 mt-0.5 ml-4">
                                                    {risk.display_id ?? risk.id.slice(0, 8)}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-400 text-xs">{risk.category}</td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${sev.bg} ${sev.color} ${sev.border}`}>
                                                    {risk.risk_score} · {sev.label}
                                                </span>
                                                {residualSev && (
                                                    <p className={`text-[10px] mt-0.5 ${residualSev.color}`}>
                                                        residual {risk.residual_score}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {treatment ? (
                                                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${TREATMENT_STYLES[treatment]}`}>
                                                        {TREATMENT_LABELS[treatment]}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-600 italic">not set</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${STATUS_STYLES[status] ?? STATUS_STYLES.open}`}>
                                                    {STATUS_LABELS[status] ?? status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-slate-400 truncate max-w-[140px]">
                                                {risk.profiles?.full_name ?? "—"}
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-slate-400">
                                                {risk.due_date ? new Date(risk.due_date).toLocaleDateString() : "—"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex flex-wrap gap-1">
                                                    {mappings.slice(0, 3).map((m, i) => (
                                                        <span key={i} className={`px-1.5 py-0.5 text-[9px] uppercase font-bold rounded border ${FRAMEWORK_BADGE_COLORS[m.framework]}`}>
                                                            {FRAMEWORK_LABELS[m.framework]}
                                                        </span>
                                                    ))}
                                                    {mappings.length > 3 && (
                                                        <span className="text-[9px] text-slate-500">+{mappings.length - 3}</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="flex items-center justify-end gap-2 px-5 py-2 border-t border-slate-800/40 text-[11px] text-slate-500">
                    <Filter className="w-3 h-3" /> {filtered.length} of {risks.length}
                </div>
            </div>

            {/* Manual add modal */}
            {openModal && (
                <AddRiskModal
                    orgId={orgId}
                    owners={owners}
                    onClose={() => setOpenModal(false)}
                    onCreated={onRiskUpsert}
                />
            )}

            {/* Detail panel */}
            {selectedRisk && (
                <RegisterRiskDetailPanel
                    risk={selectedRisk}
                    history={history}
                    owners={owners}
                    onClose={() => setSelectedRiskId(null)}
                    onUpsert={onRiskUpsert}
                    onRemove={onRiskRemove}
                    onHistoryAppend={onHistoryAppend}
                />
            )}
        </div>
    );
}

function SmallSelect({
    value, onChange, options,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="px-2 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    );
}
