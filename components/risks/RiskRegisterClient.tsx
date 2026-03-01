"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2, Shield, AlertTriangle, ChevronRight, Filter, Search, Trash2, Edit2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

type Risk = Database["public"]["Tables"]["risks"]["Row"] & {
    profiles: { id: string; full_name: string | null; avatar_url: string | null } | null;
};

type RiskStatus = 'identified' | 'assessed' | 'mitigated' | 'accepted' | 'closed';

const RISK_CATEGORIES = ["Operational", "Financial", "Compliance", "Technology", "Reputational", "Strategic", "Legal", "Security"];
const STATUS_OPTIONS: RiskStatus[] = ["identified", "assessed", "mitigated", "accepted", "closed"];

const SEVERITY_FROM_SCORE = (score: number) => {
    if (score >= 20) return { label: "Critical", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", dot: "bg-red-500" };
    if (score >= 12) return { label: "High", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", dot: "bg-orange-500" };
    if (score >= 6) return { label: "Medium", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-500" };
    return { label: "Low", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-500" };
};

const STATUS_STYLES: Record<string, string> = {
    identified: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    assessed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    mitigated: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    accepted: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    closed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};


interface RiskFormData {
    title: string;
    category: string;
    description: string;
    likelihood: number;
    impact: number;
    status: RiskStatus;
    owner_id: string;
    mitigation: string;
    due_date: string;
}

const DEFAULT_FORM: RiskFormData = {
    title: "", category: "Security", description: "", likelihood: 3, impact: 3,
    status: "identified", owner_id: "", mitigation: "", due_date: "",
};

interface Props {
    initialRisks: Risk[];
    orgId: string;
    owners: { id: string; name: string }[];
}

export function RiskRegisterClient({ initialRisks, orgId, owners }: Props) {
    const supabase = createClient();
    const [risks, setRisks] = useState<Risk[]>(initialRisks);
    const [showModal, setShowModal] = useState(false);
    const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [form, setForm] = useState<RiskFormData>(DEFAULT_FORM);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");

    function openCreate() {
        setEditingRisk(null);
        setForm(DEFAULT_FORM);
        setShowModal(true);
    }

    function openEdit(risk: Risk) {
        setEditingRisk(risk);
        setForm({
            title: risk.title,
            category: risk.category,
            description: risk.description ?? "",
            likelihood: risk.likelihood,
            impact: risk.impact,
            status: risk.status as RiskStatus,
            owner_id: risk.owner_id ?? "",
            mitigation: risk.mitigation ?? "",
            due_date: risk.due_date ?? "",
        });
        setShowModal(true);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!form.title.trim()) return;
        setSaving(true);

        const payload = {
            org_id: orgId,
            title: form.title.trim(),
            category: form.category,
            description: form.description || null,
            likelihood: form.likelihood,
            impact: form.impact,
            status: form.status,
            owner_id: form.owner_id || null,
            mitigation: form.mitigation || null,
            due_date: form.due_date || null,
            source: "manual",
        };

        if (editingRisk) {
            const { data, error } = await supabase
                .from("risks")
                .update(payload)
                .eq("id", editingRisk.id)
                .select("*, profiles(id, full_name, avatar_url)")
                .single();

            if (error) { toast.error(error.message); }
            else {
                toast.success("Risk updated");
                setRisks(prev => prev.map(r => r.id === editingRisk.id ? (data as Risk) : r));
                setShowModal(false);
            }
        } else {
            const { data, error } = await supabase
                .from("risks")
                .insert(payload)
                .select("*, profiles(id, full_name, avatar_url)")
                .single();

            if (error) { toast.error(error.message); }
            else {
                toast.success("Risk added to register");
                setRisks(prev => [data as Risk, ...prev]);
                setShowModal(false);
            }
        }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        setDeleting(id);
        const { error } = await supabase.from("risks").delete().eq("id", id);
        if (error) { toast.error(error.message); }
        else {
            toast.success("Risk removed");
            setRisks(prev => prev.filter(r => r.id !== id));
        }
        setDeleting(null);
    }

    // Stats
    const stats = useMemo(() => {
        const critical = risks.filter(r => r.risk_score >= 20).length;
        const high = risks.filter(r => r.risk_score >= 12 && r.risk_score < 20).length;
        const open = risks.filter(r => !["closed", "accepted"].includes(r.status)).length;
        const total = risks.length;
        return { critical, high, open, total };
    }, [risks]);

    // 5×5 heatmap grid — count of non-closed risks per (likelihood, impact) cell
    const heatmapGrid = useMemo(() => {
        const grid: { l: number; i: number; count: number; risks: Risk[]; score: number }[] = [];
        for (let l = 5; l >= 1; l--) {
            for (let i = 1; i <= 5; i++) {
                const cell = risks.filter(r => r.likelihood === l && r.impact === i && r.status !== "closed");
                grid.push({ l, i, count: cell.length, risks: cell, score: l * i });
            }
        }
        return grid;
    }, [risks]);

    // Data-driven category breakdown
    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const r of risks) {
            const cat = r.category
                ? r.category.charAt(0).toUpperCase() + r.category.slice(1).toLowerCase()
                : "Other";
            counts[cat] = (counts[cat] || 0) + 1;
        }
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    }, [risks]);

    const maxCatCount = Math.max(...categoryData.map(([, c]) => c), 1);

    // Filtered risks
    const filtered = useMemo(() => {
        return risks.filter(r => {
            const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
                r.category.toLowerCase().includes(search.toLowerCase());
            const matchStatus = filterStatus === "all" || r.status === filterStatus;
            const matchCat = filterCategory === "all" || r.category === filterCategory;
            return matchSearch && matchStatus && matchCat;
        });
    }, [risks, search, filterStatus, filterCategory]);

    return (
        <div className="w-full flex flex-col space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center text-sm font-mono text-slate-400 tracking-wide">
                    <span className="text-slate-500">Home</span>
                    <ChevronRight className="w-4 h-4 mx-2 opacity-50" />
                    <span className="text-slate-100">Risk Register</span>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Risk
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Risks", value: stats.total, color: "text-slate-200" },
                    { label: "Critical", value: stats.critical, color: "text-red-400" },
                    { label: "High", value: stats.high, color: "text-orange-400" },
                    { label: "Open / Active", value: stats.open, color: "text-amber-400" },
                ].map(s => (
                    <div key={s.label} className="glass-panel p-5 rounded-2xl">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{s.label}</p>
                        <p className={`text-3xl font-bold tracking-tight ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Heat Map + Category Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Matrix — gradient background + floating bubbles */}
                <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Risk Matrix</h3>
                        <div className="flex gap-4">
                            {[
                                { label: "Critical", color: "#ef4444" },
                                { label: "High", color: "#f97316" },
                                { label: "Medium", color: "#f59e0b" },
                                { label: "Low", color: "#22c55e" },
                            ].map(({ label, color }) => (
                                <div key={label} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                                    <span className="text-[10px] text-slate-500">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 items-start">
                        {/* Y-axis label + ticks */}
                        <div className="flex flex-col items-center gap-0 pt-1 pb-7 self-stretch justify-between">
                            <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                                className="text-[9px] text-slate-600 uppercase tracking-widest select-none mb-2">
                                Likelihood
                            </div>
                            {[5, 4, 3, 2, 1].map(n => (
                                <span key={n} className="text-[11px] font-mono text-slate-500">{n}</span>
                            ))}
                        </div>

                        {/* Matrix canvas */}
                        <div className="flex-1 flex flex-col gap-2">
                            <div
                                className="relative rounded-2xl overflow-hidden border border-slate-700/30"
                                style={{ height: 300 }}
                            >
                                {/* Zone background — diagonal gradient green → amber → red */}
                                <div className="absolute inset-0" style={{
                                    background: `linear-gradient(135deg,
                                        rgba(16,185,129,0.06) 0%,
                                        rgba(16,185,129,0.10) 18%,
                                        rgba(245,158,11,0.10) 38%,
                                        rgba(249,115,22,0.13) 62%,
                                        rgba(239,68,68,0.18) 100%)`
                                }} />

                                {/* Subtle grid lines */}
                                <div className="absolute inset-0 grid grid-cols-5 grid-rows-5">
                                    {Array.from({ length: 25 }).map((_, idx) => (
                                        <div key={idx} className="border border-slate-700/15" />
                                    ))}
                                </div>

                                {/* Corner zone labels */}
                                <div className="absolute bottom-2 left-3 text-[9px] font-mono uppercase tracking-widest text-emerald-600/30 select-none">LOW RISK</div>
                                <div className="absolute top-2 right-3 text-[9px] font-mono uppercase tracking-widest text-red-500/30 select-none">CRITICAL</div>

                                {/* Floating risk bubbles */}
                                {heatmapGrid.filter(c => c.count > 0).map(({ l, i, count, score }) => {
                                    const CELL = 100 / 5;
                                    const cx = (i - 0.5) * CELL;
                                    const cy = (5 - l + 0.5) * CELL;
                                    const size = Math.max(36, Math.min(60, 30 + count * 5));
                                    const [fill, glow] =
                                        score >= 20 ? ["#ef4444", "rgba(239,68,68,0.5)"] :
                                        score >= 12 ? ["#f97316", "rgba(249,115,22,0.4)"] :
                                        score >= 6  ? ["#f59e0b", "rgba(245,158,11,0.35)"] :
                                                      ["#22c55e", "rgba(34,197,94,0.3)"];
                                    return (
                                        <div
                                            key={`${l}-${i}`}
                                            className="absolute flex items-center justify-center rounded-full font-black text-white cursor-default transition-transform hover:scale-110 select-none"
                                            style={{
                                                left: `${cx}%`,
                                                top: `${cy}%`,
                                                width: size,
                                                height: size,
                                                transform: "translate(-50%, -50%)",
                                                background: fill,
                                                boxShadow: `0 0 ${size * 0.6}px ${glow}, 0 0 ${size * 1.2}px ${glow}50`,
                                                fontSize: count > 9 ? 13 : 15,
                                                zIndex: 10,
                                            }}
                                            title={`${count} risk${count > 1 ? "s" : ""} — Likelihood ${l} × Impact ${i} = Score ${score}`}
                                        >
                                            {count}
                                        </div>
                                    );
                                })}

                                {/* Empty state */}
                                {heatmapGrid.every(c => c.count === 0) && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-slate-700 text-sm">No active risks</span>
                                    </div>
                                )}
                            </div>

                            {/* X-axis ticks + label */}
                            <div className="grid grid-cols-5 px-0">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <div key={n} className="text-center text-[11px] font-mono text-slate-500">{n}</div>
                                ))}
                            </div>
                            <p className="text-center text-[9px] text-slate-600 uppercase tracking-widest -mt-1 select-none">Impact →</p>
                        </div>
                    </div>
                </div>

                {/* Right column: Category bars + Severity breakdown */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
                    {/* By Category */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">By Category</h3>
                        {categoryData.length === 0 ? (
                            <p className="text-slate-600 text-sm text-center py-4">No risks yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {categoryData.map(([cat, count]) => {
                                    const pct = Math.round((count / maxCatCount) * 100);
                                    const barColor = pct > 66 ? "bg-red-500" : pct > 33 ? "bg-orange-500" : "bg-blue-500";
                                    return (
                                        <div key={cat} className="group flex items-center gap-3">
                                            <span className="text-xs text-slate-400 w-24 truncate capitalize">{cat}</span>
                                            <div className="flex-1 h-2 bg-slate-800/60 rounded-full overflow-hidden">
                                                <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-xs font-mono text-slate-400 w-5 text-right font-semibold">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* By Severity */}
                    {risks.length > 0 && (
                        <div className="pt-5 border-t border-slate-800/40">
                            <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4">By Severity</h3>
                            <div className="space-y-3">
                                {[
                                    { label: "Critical", min: 20, max: 26, fill: "#ef4444", text: "text-red-400" },
                                    { label: "High",     min: 12, max: 20, fill: "#f97316", text: "text-orange-400" },
                                    { label: "Medium",   min: 6,  max: 12, fill: "#f59e0b", text: "text-amber-400" },
                                    { label: "Low",      min: 0,  max: 6,  fill: "#22c55e", text: "text-emerald-400" },
                                ].map(({ label, min, max, fill, text }) => {
                                    const count = risks.filter(r => r.risk_score >= min && r.risk_score < max).length;
                                    const pct = risks.length > 0 ? Math.round((count / risks.length) * 100) : 0;
                                    return (
                                        <div key={label} className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: fill }} />
                                            <span className={`text-xs w-12 ${text}`}>{label}</span>
                                            <div className="flex-1 h-2 bg-slate-800/60 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: fill }} />
                                            </div>
                                            <span className="text-xs font-mono text-slate-500 w-5 text-right">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Mini donut-like stat */}
                            <div className="mt-5 pt-4 border-t border-slate-800/40 flex items-center justify-between">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-red-400">{stats.critical}</p>
                                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">Critical</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-orange-400">{stats.high}</p>
                                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">High</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-amber-400">
                                        {risks.filter(r => r.risk_score >= 6 && r.risk_score < 12).length}
                                    </p>
                                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">Medium</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-emerald-400">
                                        {risks.filter(r => r.risk_score < 6).length}
                                    </p>
                                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">Low</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search risks…"
                        className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none"
                >
                    <option value="all">All Statuses</option>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none"
                >
                    <option value="all">All Categories</option>
                    {RISK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Filter className="w-3.5 h-3.5" />
                    <span>{filtered.length} of {risks.length} risks</span>
                </div>
            </div>

            {/* Risk Table */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Shield className="w-12 h-12 text-slate-700 mb-4" />
                        <p className="text-slate-500 text-sm">
                            {risks.length === 0 ? "No risks in the register yet. Add your first risk." : "No risks match your filters."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-slate-500 font-mono uppercase bg-slate-900/50 border-b border-slate-800/60">
                                <tr>
                                    <th className="px-5 py-3 text-left">Risk</th>
                                    <th className="px-5 py-3 text-left">Category</th>
                                    <th className="px-5 py-3 text-center">L × I</th>
                                    <th className="px-5 py-3 text-center">Score</th>
                                    <th className="px-5 py-3 text-left">Status</th>
                                    <th className="px-5 py-3 text-left">Owner</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {filtered.map(risk => {
                                    const sev = SEVERITY_FROM_SCORE(risk.risk_score);
                                    return (
                                        <tr key={risk.id} className="hover:bg-slate-800/20 transition-colors group">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sev.dot}`} />
                                                    <span className="font-medium text-slate-200 truncate max-w-[240px]" title={risk.title}>{risk.title}</span>
                                                </div>
                                                {risk.description && (
                                                    <p className="text-xs text-slate-500 mt-0.5 ml-4 truncate max-w-[240px]">{risk.description}</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-400 text-xs">{risk.category}</td>
                                            <td className="px-5 py-3.5 text-center font-mono text-slate-400 text-xs">{risk.likelihood} × {risk.impact}</td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded border ${sev.bg} ${sev.color} ${sev.border}`}>
                                                    {risk.risk_score} · {sev.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded border ${STATUS_STYLES[risk.status] ?? STATUS_STYLES.identified}`}>
                                                    {risk.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-slate-400">
                                                {(risk.profiles as { full_name: string | null } | null)?.full_name ?? "—"}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEdit(risk)}
                                                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-slate-200 transition-colors"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(risk.id)}
                                                        disabled={deleting === risk.id}
                                                        className="p-1.5 rounded-lg hover:bg-red-950/30 text-slate-500 hover:text-red-400 transition-colors"
                                                    >
                                                        {deleting === risk.id
                                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            : <Trash2 className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">

                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                        <AlertTriangle className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <h2 className="text-base font-bold text-slate-100">
                                        {editingRisk ? "Edit Risk" : "Add Risk"}
                                    </h2>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Risk Title *</label>
                                        <input
                                            value={form.title}
                                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                            required
                                            placeholder="Describe the risk concisely…"
                                            className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Category</label>
                                        <select
                                            value={form.category}
                                            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                            className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                        >
                                            {RISK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status</label>
                                        <select
                                            value={form.status}
                                            onChange={e => setForm(f => ({ ...f, status: e.target.value as RiskStatus }))}
                                            className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                        >
                                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                        </select>
                                    </div>

                                    {/* Likelihood × Impact Matrix */}
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Likelihood: <span className="text-slate-200">{form.likelihood}</span> / 5
                                        </label>
                                        <input
                                            type="range" min={1} max={5} step={1}
                                            value={form.likelihood}
                                            onChange={e => setForm(f => ({ ...f, likelihood: Number(e.target.value) }))}
                                            className="mt-2 w-full accent-blue-500"
                                        />
                                        <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                                            <span>Very Low</span><span>Low</span><span>Moderate</span><span>High</span><span>Very High</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Impact: <span className="text-slate-200">{form.impact}</span> / 5
                                        </label>
                                        <input
                                            type="range" min={1} max={5} step={1}
                                            value={form.impact}
                                            onChange={e => setForm(f => ({ ...f, impact: Number(e.target.value) }))}
                                            className="mt-2 w-full accent-blue-500"
                                        />
                                        <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                                            <span>Negligible</span><span>Minor</span><span>Moderate</span><span>Major</span><span>Severe</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Live score preview */}
                                {(() => {
                                    const s = form.likelihood * form.impact;
                                    const sev = SEVERITY_FROM_SCORE(s);
                                    return (
                                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${sev.bg} ${sev.border}`}>
                                            <AlertTriangle className={`w-4 h-4 ${sev.color}`} />
                                            <span className={`text-sm font-bold ${sev.color}`}>Risk Score: {s} — {sev.label}</span>
                                            <span className="text-xs text-slate-500 ml-auto">({form.likelihood} × {form.impact})</span>
                                        </div>
                                    );
                                })()}

                                <div>
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        rows={2}
                                        placeholder="What is the risk and its potential impact?"
                                        className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mitigation Plan</label>
                                    <textarea
                                        value={form.mitigation}
                                        onChange={e => setForm(f => ({ ...f, mitigation: e.target.value }))}
                                        rows={2}
                                        placeholder="How will this risk be mitigated or controlled?"
                                        className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {owners.length > 0 && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Owner</label>
                                            <select
                                                value={form.owner_id}
                                                onChange={e => setForm(f => ({ ...f, owner_id: e.target.value }))}
                                                className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                            >
                                                <option value="">Unassigned</option>
                                                {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Due Date</label>
                                        <input
                                            type="date"
                                            value={form.due_date}
                                            onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                                            className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-sm text-slate-400 hover:bg-slate-800 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-70">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        {editingRisk ? "Update Risk" : "Add to Register"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
