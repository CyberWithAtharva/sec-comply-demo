"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Building2, Plus, Search, X, AlertCircle, CheckCircle2,
    Clock, Edit2, Trash2, RotateCcw, AlertTriangle,
    Shield, Calendar, ExternalLink, ChevronDown, MoreVertical,
    Star, ClipboardList, ScanSearch, ShieldCheck, ShieldX,
} from "lucide-react";
import { cn } from "@/components/ui/Card";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SecurityFinding {
    label: string;
    passed: boolean;
    description: string;
    points: number;
}

export interface Vendor {
    id: string;
    org_id: string;
    name: string;
    tier: number;
    risk_level: string;
    contact_name: string | null;
    contact_email: string | null;
    website: string | null;
    status: string;
    last_assessment: string | null;
    security_score: number | null;
    security_findings: SecurityFinding[] | null;
    security_checked_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface VendorAssessment {
    id: string;
    vendor_id: string;
    type: string;
    status: string;
    due_date: string | null;
    completed_date: string | null;
    score: number | null;
    assessor_id: string | null;
    notes: string | null;
    created_at: string;
}

interface Owner { id: string; name: string }

interface VendorsClientProps {
    initialVendors: Vendor[];
    initialAssessments: VendorAssessment[];
    orgId: string;
    owners: Owner[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const RISK_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
    critical: { color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30" },
    high:     { color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/30" },
    medium:   { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
    low:      { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
    active:     { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    inactive:   { color: "text-slate-400",   bg: "bg-slate-500/10",   border: "border-slate-500/30" },
    onboarding: { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
    offboarding:{ color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/30" },
};

function scoreGrade(score: number): { grade: string; color: string; bg: string; border: string } {
    if (score >= 85) return { grade: "A", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };
    if (score >= 70) return { grade: "B", color: "text-green-400",   bg: "bg-green-500/10",   border: "border-green-500/30" };
    if (score >= 50) return { grade: "C", color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30" };
    if (score >= 30) return { grade: "D", color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/30" };
    return              { grade: "F", color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30" };
}

function RiskBadge({ risk }: { risk: string }) {
    const cfg = RISK_CONFIG[risk] ?? RISK_CONFIG.medium;
    return (
        <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", cfg.color, cfg.bg, cfg.border)}>
            {risk}
        </span>
    );
}

function TierBadge({ tier }: { tier: number }) {
    const colors = ["", "text-red-400", "text-orange-400", "text-amber-400", "text-slate-400"];
    return (
        <div className="flex items-center space-x-0.5">
            {[1, 2, 3, 4].map(i => (
                <Star key={i} className={cn("w-3 h-3", i <= tier ? (colors[tier] ?? "text-slate-400") : "text-slate-700")}
                    fill={i <= tier ? "currentColor" : "none"} />
            ))}
        </div>
    );
}

// ─── Vendor Modal ─────────────────────────────────────────────────────────────

interface VendorModalProps {
    orgId: string;
    editing: Vendor | null;
    onClose: () => void;
    onSaved: (vendor: Vendor, isNew: boolean) => void;
}

function VendorModal({ orgId, editing, onClose, onSaved }: VendorModalProps) {
    const supabase = createClient();
    const [form, setForm] = useState({
        name: editing?.name ?? "",
        tier: editing?.tier ?? 3,
        risk_level: editing?.risk_level ?? "medium",
        contact_name: editing?.contact_name ?? "",
        contact_email: editing?.contact_email ?? "",
        website: editing?.website ?? "",
        status: editing?.status ?? "active",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError("Vendor name is required."); return; }
        setSaving(true); setError(null);

        const payload = {
            name: form.name.trim(),
            tier: form.tier,
            risk_level: form.risk_level,
            contact_name: form.contact_name.trim() || null,
            contact_email: form.contact_email.trim() || null,
            website: form.website.trim() || null,
            status: form.status,
        };

        let data, err;
        if (editing) {
            const res = await supabase.from("vendors").update(payload).eq("id", editing.id).select().single();
            data = res.data; err = res.error;
        } else {
            const res = await supabase.from("vendors").insert({ ...payload, org_id: orgId }).select().single();
            data = res.data; err = res.error;
        }

        if (err || !data) { setError(err?.message ?? "Save failed."); setSaving(false); return; }
        onSaved(data as Vendor, !editing);
        onClose();
    };

    const inputCls = "w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl"
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-100">{editing ? "Edit Vendor" : "Onboard Vendor"}</h2>
                            <p className="text-xs text-slate-500">{editing ? "Update vendor details" : "Add a new third-party vendor"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Vendor Name *</label>
                        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Acme Security Ltd." className={inputCls} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Tier (1=Critical)</label>
                            <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: Number(e.target.value) }))} className={inputCls}>
                                {[1, 2, 3, 4].map(t => <option key={t} value={t}>Tier {t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Risk Level</label>
                            <select value={form.risk_level} onChange={e => setForm(f => ({ ...f, risk_level: e.target.value }))} className={inputCls}>
                                {["critical", "high", "medium", "low"].map(r => (
                                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
                                {["active", "inactive", "onboarding", "offboarding"].map(s => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Contact Name</label>
                            <input type="text" value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                                placeholder="Jane Smith" className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Contact Email</label>
                            <input type="email" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                                placeholder="jane@vendor.com" className={inputCls} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Website</label>
                        <input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                            placeholder="https://vendor.com" className={inputCls} />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
                        <button type="submit" disabled={saving}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl flex items-center space-x-2 transition-colors">
                            {saving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            <span>{saving ? "Saving…" : editing ? "Save Changes" : "Add Vendor"}</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ─── Assessment Modal ─────────────────────────────────────────────────────────

interface AssessmentModalProps {
    vendorId: string;
    owners: Owner[];
    onClose: () => void;
    onSaved: (assessment: VendorAssessment) => void;
}

function AssessmentModal({ vendorId, owners, onClose, onSaved }: AssessmentModalProps) {
    const supabase = createClient();
    const [form, setForm] = useState({ type: "questionnaire", status: "scheduled", due_date: "", assessor_id: "", notes: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setError(null);
        const { data, error: err } = await supabase
            .from("vendor_assessments")
            .insert({
                vendor_id: vendorId,
                type: form.type,
                status: form.status,
                due_date: form.due_date || null,
                assessor_id: form.assessor_id || null,
                notes: form.notes.trim() || null,
            })
            .select()
            .single();
        if (err || !data) { setError(err?.message ?? "Save failed."); setSaving(false); return; }
        onSaved(data as VendorAssessment);
        onClose();
    };

    const inputCls = "w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md shadow-2xl"
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <ClipboardList className="w-4 h-4 text-blue-400" />
                        </div>
                        <h2 className="text-base font-semibold text-slate-100">Schedule Assessment</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
                            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inputCls}>
                                {["questionnaire", "on-site", "document-review", "automated"].map(t => (
                                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
                                {["scheduled", "in_progress", "completed", "overdue"].map(s => (
                                    <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Due Date</label>
                            <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Assessor</label>
                            <select value={form.assessor_id} onChange={e => setForm(f => ({ ...f, assessor_id: e.target.value }))} className={inputCls}>
                                <option value="">Unassigned</option>
                                {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes</label>
                        <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            placeholder="Scope, instructions, or context…"
                            className={cn(inputCls, "resize-none")} />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
                        <button type="submit" disabled={saving}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl flex items-center space-x-2">
                            {saving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            <span>{saving ? "Scheduling…" : "Schedule"}</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function VendorsClient({ initialVendors, initialAssessments, orgId, owners }: VendorsClientProps) {
    const supabase = createClient();

    const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
    const [assessments, setAssessments] = useState<VendorAssessment[]>(initialAssessments);

    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<Vendor | null>(null);
    const [assessingVendor, setAssessingVendor] = useState<string | null>(null);
    const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [filterRisk, setFilterRisk] = useState("all");
    const [filterTier, setFilterTier] = useState("all");
    const [assessingSecurityFor, setAssessingSecurityFor] = useState<Record<string, boolean>>({});

    // ── Stats ──
    const stats = useMemo(() => ({
        total: vendors.length,
        active: vendors.filter(v => v.status === "active").length,
        highRisk: vendors.filter(v => v.risk_level === "critical" || v.risk_level === "high").length,
        tier1: vendors.filter(v => v.tier === 1).length,
        pendingAssessments: assessments.filter(a => a.status === "scheduled" || a.status === "in_progress").length,
    }), [vendors, assessments]);

    // ── Filtered ──
    const filtered = useMemo(() => vendors.filter(v => {
        if (filterRisk !== "all" && v.risk_level !== filterRisk) return false;
        if (filterTier !== "all" && v.tier !== Number(filterTier)) return false;
        if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [vendors, filterRisk, filterTier, search]);

    const vendorAssessments = useCallback((vendorId: string) =>
        assessments.filter(a => a.vendor_id === vendorId),
    [assessments]);

    // ── Handlers ──
    const handleSecurityAssess = useCallback(async (vendorId: string, website: string) => {
        setAssessingSecurityFor(prev => ({ ...prev, [vendorId]: true }));
        try {
            const res = await fetch("/api/vendors/assess", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vendor_id: vendorId, domain: website }),
            });
            const json = await res.json();
            if (res.ok) {
                setVendors(prev => prev.map(v => v.id === vendorId
                    ? { ...v, security_score: json.score, security_findings: json.findings, security_checked_at: json.checked_at }
                    : v
                ));
            }
        } catch { /* silent — user can re-assess manually */ }
        finally {
            setAssessingSecurityFor(prev => { const n = { ...prev }; delete n[vendorId]; return n; });
        }
    }, []);

    const handleSaved = useCallback((v: Vendor, isNew: boolean) => {
        setVendors(prev => {
            const idx = prev.findIndex(x => x.id === v.id);
            if (idx >= 0) { const next = [...prev]; next[idx] = v; return next; }
            return [v, ...prev];
        });
        if (isNew && v.website) {
            handleSecurityAssess(v.id, v.website);
        }
    }, [handleSecurityAssess]);

    const handleDelete = useCallback(async (id: string) => {
        await supabase.from("vendors").delete().eq("id", id);
        setVendors(prev => prev.filter(v => v.id !== id));
    }, [supabase]);

    const handleAssessmentSaved = useCallback((a: VendorAssessment) => {
        setAssessments(prev => [a, ...prev]);
    }, []);

    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <Building2 className="w-8 h-8 mr-3 text-indigo-500" />
                        Vendor Risk Management
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Third-party security assessments, tiering, and continuous monitoring.</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setShowCreate(true); }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Onboard Vendor</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    { label: "Total Vendors",   count: stats.total,              color: "text-slate-100" },
                    { label: "Active",           count: stats.active,             color: "text-emerald-400" },
                    { label: "High / Critical",  count: stats.highRisk,           color: stats.highRisk > 0 ? "text-red-400" : "text-slate-400" },
                    { label: "Tier 1",           count: stats.tier1,              color: "text-orange-400" },
                    { label: "Open Assessments", count: stats.pendingAssessments, color: stats.pendingAssessments > 0 ? "text-amber-400" : "text-slate-400" },
                ].map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="glass-panel rounded-2xl p-4 border border-slate-800/50 flex flex-col"
                    >
                        <span className="text-[10px] text-slate-500 mb-1">{s.label}</span>
                        <span className={cn("text-2xl font-bold tracking-tight", s.color)}>{s.count}</span>
                    </motion.div>
                ))}
            </div>

            {/* Vendors Table */}
            <div className="glass-panel rounded-2xl border border-slate-800/50 flex flex-col">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 p-5 border-b border-slate-800/50">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search vendors…"
                            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
                    </div>
                    <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
                        className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
                        <option value="all">All Risk Levels</option>
                        {["critical", "high", "medium", "low"].map(r => (
                            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                    </select>
                    <select value={filterTier} onChange={e => setFilterTier(e.target.value)}
                        className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
                        <option value="all">All Tiers</option>
                        {[1, 2, 3, 4].map(t => <option key={t} value={t}>Tier {t}</option>)}
                    </select>
                    <span className="text-xs text-slate-500 ml-auto">{filtered.length} vendor{filtered.length !== 1 ? "s" : ""}</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Building2 className="w-12 h-12 text-slate-700 mb-3" />
                        <p className="text-sm font-medium text-slate-400">No vendors found</p>
                        <p className="text-xs text-slate-600 mt-1">Onboard your first vendor to get started</p>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-slate-800/50">
                        <AnimatePresence initial={false}>
                            {filtered.map(v => {
                                const vAssessments = vendorAssessments(v.id);
                                const isExpanded = expandedVendor === v.id;
                                return (
                                    <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        {/* Vendor row */}
                                        <div
                                            className="flex items-center px-5 py-4 hover:bg-slate-800/20 transition-colors group cursor-pointer"
                                            onClick={() => setExpandedVendor(isExpanded ? null : v.id)}
                                        >
                                            {/* Expand icon */}
                                            <ChevronDown className={cn("w-4 h-4 text-slate-600 mr-3 transition-transform shrink-0", isExpanded && "rotate-180")} />

                                            {/* Vendor info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-sm font-medium text-slate-200 group-hover:text-white truncate">{v.name}</span>
                                                    <RiskBadge risk={v.risk_level} />
                                                </div>
                                                <div className="flex items-center space-x-4 mt-0.5">
                                                    <TierBadge tier={v.tier} />
                                                    {v.contact_email && (
                                                        <span className="text-[11px] text-slate-500">{v.contact_email}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status + last assessment + security score */}
                                            <div className="hidden md:flex items-center space-x-6 mx-6">
                                                <div className="text-right">
                                                    <p className="text-[10px] text-slate-500">Status</p>
                                                    <span className={cn("text-[11px] font-semibold uppercase", STATUS_CONFIG[v.status]?.color ?? "text-slate-400")}>
                                                        {v.status}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-slate-500">Last Assessment</p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {v.last_assessment ? new Date(v.last_assessment).toLocaleDateString() : "None"}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-slate-500">Assessments</p>
                                                    <p className="text-[11px] text-slate-400">{vAssessments.length}</p>
                                                </div>
                                                {/* Security Score */}
                                                <div className="text-right min-w-[60px]">
                                                    <p className="text-[10px] text-slate-500 mb-0.5">Security</p>
                                                    {assessingSecurityFor[v.id] ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                                                            <RotateCcw className="w-3 h-3 animate-spin" /> Scanning…
                                                        </span>
                                                    ) : v.security_score !== null && v.security_score !== undefined ? (
                                                        (() => {
                                                            const g = scoreGrade(v.security_score);
                                                            return (
                                                                <span className={cn("inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border", g.color, g.bg, g.border)}>
                                                                    {v.security_score}/100 <span className="font-black">{g.grade}</span>
                                                                </span>
                                                            );
                                                        })()
                                                    ) : v.website ? (
                                                        <button
                                                            onClick={e => { e.stopPropagation(); handleSecurityAssess(v.id, v.website!); }}
                                                            className="text-[10px] text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                                                        >
                                                            Assess
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-600">No domain</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                {v.website && (
                                                    <button
                                                        onClick={() => handleSecurityAssess(v.id, v.website!)}
                                                        disabled={!!assessingSecurityFor[v.id]}
                                                        className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors disabled:opacity-40"
                                                        title="Re-assess security"
                                                    >
                                                        <ScanSearch className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => setAssessingVendor(v.id)}
                                                    className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Schedule assessment">
                                                    <ClipboardList className="w-4 h-4" />
                                                </button>
                                                {v.website && (
                                                    <a href={v.website} target="_blank" rel="noopener noreferrer"
                                                        className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                                <button onClick={() => { setEditing(v); setShowCreate(true); }}
                                                    className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(v.id)}
                                                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded assessments */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-12 pb-4 space-y-4">
                                                        {/* ── Scheduled assessments ── */}
                                                        {vAssessments.length === 0 ? (
                                                            <div className="text-xs text-slate-500 py-3 text-center">
                                                                No assessments yet.{" "}
                                                                <button onClick={() => setAssessingVendor(v.id)} className="text-blue-400 hover:text-blue-300">
                                                                    Schedule one
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col space-y-2">
                                                                {vAssessments.slice(0, 5).map(a => {
                                                                    const statusColor = a.status === "completed" ? "text-emerald-400" :
                                                                        a.status === "in_progress" ? "text-amber-400" :
                                                                            a.status === "overdue" ? "text-red-400" : "text-slate-400";
                                                                    return (
                                                                        <div key={a.id} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 text-xs">
                                                                            <div className="flex items-center space-x-3">
                                                                                <ClipboardList className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                                                <span className="text-slate-300 capitalize">{a.type.replace(/-/g, ' ')}</span>
                                                                            </div>
                                                                            <div className="flex items-center space-x-4">
                                                                                {a.score !== null && <span className="text-slate-400 font-mono">Score: {a.score}</span>}
                                                                                {a.due_date && <span className="text-slate-500">{new Date(a.due_date).toLocaleDateString()}</span>}
                                                                                <span className={cn("uppercase font-bold text-[10px]", statusColor)}>{a.status.replace(/_/g, ' ')}</span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        {/* ── Auto Security Scan Results ── */}
                                                        {assessingSecurityFor[v.id] && (
                                                            <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                                                                <RotateCcw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                                                Running automated security assessment…
                                                            </div>
                                                        )}
                                                        {v.security_findings && v.security_findings.length > 0 && !assessingSecurityFor[v.id] && (
                                                            <div>
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                                        <ScanSearch className="w-3 h-3" /> Auto Security Scan
                                                                    </p>
                                                                    <div className="flex items-center gap-2">
                                                                        {(() => {
                                                                            const g = scoreGrade(v.security_score!);
                                                                            return (
                                                                                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border", g.color, g.bg, g.border)}>
                                                                                    {v.security_score}/100 · Grade {g.grade}
                                                                                </span>
                                                                            );
                                                                        })()}
                                                                        {v.security_checked_at && (
                                                                            <span className="text-[9px] text-slate-600">
                                                                                {new Date(v.security_checked_at).toLocaleDateString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    {v.security_findings.map(f => (
                                                                        <div key={f.label} className={cn(
                                                                            "flex items-start gap-2.5 p-2.5 rounded-lg border text-[11px]",
                                                                            f.passed
                                                                                ? "bg-emerald-500/5 border-emerald-500/20"
                                                                                : "bg-red-500/5 border-red-500/20"
                                                                        )}>
                                                                            {f.passed
                                                                                ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                                                                : <ShieldX className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                                                                            }
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className={cn("font-medium", f.passed ? "text-emerald-300" : "text-red-300")}>{f.label}</p>
                                                                                <p className="text-slate-500 mt-0.5">{f.description}</p>
                                                                            </div>
                                                                            <span className={cn("text-[9px] font-bold shrink-0", f.passed ? "text-emerald-500" : "text-slate-600")}>
                                                                                {f.passed ? `+${f.points}` : `0/${f.points}`}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showCreate && (
                    <VendorModal
                        orgId={orgId}
                        editing={editing}
                        onClose={() => { setShowCreate(false); setEditing(null); }}
                        onSaved={handleSaved}
                    />
                )}
                {assessingVendor && (
                    <AssessmentModal
                        vendorId={assessingVendor}
                        owners={owners}
                        onClose={() => setAssessingVendor(null)}
                        onSaved={handleAssessmentSaved}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
