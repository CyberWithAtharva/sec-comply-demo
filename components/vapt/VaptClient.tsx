"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    ShieldAlert, Upload, Plus, Search, Filter, FileText,
    AlertCircle, ChevronDown, X, CheckCircle2, Clock,
    Trash2, Edit2, ExternalLink, Download, AlertTriangle,
    BarChart3, TrendingUp, RotateCcw
} from "lucide-react";
import { cn } from "@/components/ui/Card";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
    PieChart, Pie, Legend
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VaptReport {
    id: string;
    org_id: string;
    title: string;
    conducted_by: string | null;
    report_date: string | null;
    scope: string | null;
    file_url: string | null;
    finding_count: number;
    status: string;
    created_at: string;
}

export interface VaptFinding {
    id: string;
    org_id: string;
    vapt_report_id: string | null;
    title: string;
    severity: string;
    status: string;
    source: string;
    description: string | null;
    remediation: string | null;
    due_date: string | null;
    created_at: string;
    assignee: { id: string; full_name: string | null } | null;
}

interface Owner { id: string; name: string }

interface VaptClientProps {
    initialReports: VaptReport[];
    initialFindings: VaptFinding[];
    orgId: string;
    owners: Owner[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; chart: string }> = {
    critical:      { label: "Critical",      color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30",     chart: "#ef4444" },
    high:          { label: "High",          color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/30",  chart: "#f97316" },
    medium:        { label: "Medium",        color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   chart: "#f59e0b" },
    low:           { label: "Low",           color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", chart: "#10b981" },
    informational: { label: "Info",          color: "text-slate-400",   bg: "bg-slate-500/10",   border: "border-slate-500/30",   chart: "#64748b" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; next: string | null }> = {
    open:        { label: "Open",          color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30",     next: "in_progress" },
    in_progress: { label: "In Progress",   color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   next: "resolved" },
    resolved:    { label: "Resolved",      color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", next: null },
    accepted:    { label: "Accepted Risk", color: "text-slate-400",   bg: "bg-slate-500/10",   border: "border-slate-500/30",   next: null },
};

function SeverityBadge({ severity }: { severity: string }) {
    const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.informational;
    return (
        <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", cfg.color, cfg.bg, cfg.border)}>
            {cfg.label}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
    return (
        <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", cfg.color, cfg.bg, cfg.border)}>
            {cfg.label}
        </span>
    );
}

// ─── Upload Report Modal ──────────────────────────────────────────────────────

interface UploadReportModalProps {
    orgId: string;
    onClose: () => void;
    onCreated: (report: VaptReport) => void;
}

function UploadReportModal({ orgId, onClose, onCreated }: UploadReportModalProps) {
    const supabase = createClient();
    const [form, setForm] = useState({ title: "", conducted_by: "", report_date: "", scope: "" });
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { setError("Title is required."); return; }
        setUploading(true);
        setError(null);

        let file_url: string | null = null;

        // Upload PDF if provided
        if (file) {
            const ext = file.name.split(".").pop();
            const path = `${orgId}/${Date.now()}.${ext}`;
            const { error: uploadErr } = await supabase.storage
                .from("vapt-reports")
                .upload(path, file, { contentType: file.type });
            if (uploadErr) {
                setError(`File upload failed: ${uploadErr.message}`);
                setUploading(false);
                return;
            }
            const { data: urlData } = supabase.storage.from("vapt-reports").getPublicUrl(path);
            file_url = urlData.publicUrl;
        }

        const { data, error: insertErr } = await supabase
            .from("vapt_reports")
            .insert({
                org_id: orgId,
                title: form.title.trim(),
                conducted_by: form.conducted_by.trim() || null,
                report_date: form.report_date || null,
                scope: form.scope.trim() || null,
                file_url,
            })
            .select()
            .single();

        if (insertErr || !data) {
            setError(insertErr?.message ?? "Failed to create report.");
            setUploading(false);
            return;
        }

        onCreated(data as VaptReport);
        onClose();
    };

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
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <Upload className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-100">Upload VAPT Report</h2>
                            <p className="text-xs text-slate-500">Add a new penetration test report</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Report Title *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="Q1 2025 External Pentest"
                            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Conducted By</label>
                            <input
                                type="text"
                                value={form.conducted_by}
                                onChange={e => setForm(f => ({ ...f, conducted_by: e.target.value }))}
                                placeholder="Security firm name"
                                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Report Date</label>
                            <input
                                type="date"
                                value={form.report_date}
                                onChange={e => setForm(f => ({ ...f, report_date: e.target.value }))}
                                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Scope</label>
                        <textarea
                            rows={2}
                            value={form.scope}
                            onChange={e => setForm(f => ({ ...f, scope: e.target.value }))}
                            placeholder="e.g. External web apps, VPN endpoint, AWS environment"
                            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Report PDF (optional)</label>
                        <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-slate-700/50 rounded-xl cursor-pointer hover:border-slate-600/50 transition-colors bg-slate-800/30">
                            <div className="flex flex-col items-center space-y-1">
                                <Upload className="w-5 h-5 text-slate-500" />
                                <span className="text-xs text-slate-500">
                                    {file ? file.name : "Click to upload PDF"}
                                </span>
                            </div>
                            <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={e => setFile(e.target.files?.[0] ?? null)}
                            />
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors flex items-center space-x-2"
                        >
                            {uploading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            <span>{uploading ? "Creating…" : "Create Report"}</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ─── Add/Edit Finding Modal ───────────────────────────────────────────────────

interface FindingModalProps {
    orgId: string;
    reports: VaptReport[];
    owners: Owner[];
    editing: VaptFinding | null;
    defaultReportId: string | null;
    onClose: () => void;
    onSaved: (finding: VaptFinding) => void;
}

const EMPTY_FORM = {
    title: "",
    severity: "medium",
    status: "open",
    vapt_report_id: "",
    description: "",
    remediation: "",
    due_date: "",
    assignee_id: "",
};

function FindingModal({ orgId, reports, owners, editing, defaultReportId, onClose, onSaved }: FindingModalProps) {
    const supabase = createClient();
    const [form, setForm] = useState({
        title: editing?.title ?? "",
        severity: editing?.severity ?? "medium",
        status: editing?.status ?? "open",
        vapt_report_id: editing?.vapt_report_id ?? defaultReportId ?? "",
        description: editing?.description ?? "",
        remediation: editing?.remediation ?? "",
        due_date: editing?.due_date ?? "",
        assignee_id: editing?.assignee?.id ?? "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { setError("Title is required."); return; }
        setSaving(true);
        setError(null);

        const payload = {
            title: form.title.trim(),
            severity: form.severity,
            status: form.status,
            vapt_report_id: form.vapt_report_id || null,
            description: form.description.trim() || null,
            remediation: form.remediation.trim() || null,
            due_date: form.due_date || null,
            assignee_id: form.assignee_id || null,
            source: "vapt" as const,
        };

        let data: VaptFinding | null = null;
        let err: { message: string } | null = null;

        if (editing) {
            const res = await supabase
                .from("vulnerabilities")
                .update(payload)
                .eq("id", editing.id)
                .select("*, profiles(id, full_name)")
                .single();
            data = res.data ? { ...(res.data as unknown as VaptFinding), assignee: (res.data.profiles as { id: string; full_name: string | null } | null) } : null;
            err = res.error;
        } else {
            const res = await supabase
                .from("vulnerabilities")
                .insert({ ...payload, org_id: orgId })
                .select("*, profiles(id, full_name)")
                .single();
            data = res.data ? { ...(res.data as unknown as VaptFinding), assignee: (res.data.profiles as { id: string; full_name: string | null } | null) } : null;
            err = res.error;
        }

        if (err || !data) { setError(err?.message ?? "Save failed."); setSaving(false); return; }
        onSaved(data);
        onClose();
    };

    const field = (label: string, node: React.ReactNode) => (
        <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
            {node}
        </div>
    );

    const inputCls = "w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors";
    const selectCls = inputCls;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-800/50 shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-100">{editing ? "Edit Finding" : "Log Finding"}</h2>
                            <p className="text-xs text-slate-500">{editing ? "Update vulnerability details" : "Add a new vulnerability finding"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {field("Title *",
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="SQL injection in login endpoint"
                            className={inputCls}
                        />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {field("Severity",
                            <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className={selectCls}>
                                {Object.entries(SEVERITY_CONFIG).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        )}
                        {field("Status",
                            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={selectCls}>
                                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {field("VAPT Report",
                        <select value={form.vapt_report_id} onChange={e => setForm(f => ({ ...f, vapt_report_id: e.target.value }))} className={selectCls}>
                            <option value="">— No report linked —</option>
                            {reports.map(r => (
                                <option key={r.id} value={r.id}>{r.title}</option>
                            ))}
                        </select>
                    )}

                    {field("Description",
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Describe the vulnerability and impact…"
                            className={cn(inputCls, "resize-none")}
                        />
                    )}

                    {field("Remediation Steps",
                        <textarea
                            rows={3}
                            value={form.remediation}
                            onChange={e => setForm(f => ({ ...f, remediation: e.target.value }))}
                            placeholder="Steps to fix the vulnerability…"
                            className={cn(inputCls, "resize-none")}
                        />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {field("Due Date",
                            <input
                                type="date"
                                value={form.due_date}
                                onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                                className={inputCls}
                            />
                        )}
                        {field("Assignee",
                            <select value={form.assignee_id} onChange={e => setForm(f => ({ ...f, assignee_id: e.target.value }))} className={selectCls}>
                                <option value="">Unassigned</option>
                                {owners.map(o => (
                                    <option key={o.id} value={o.id}>{o.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </form>

                <div className="flex justify-end space-x-3 p-6 border-t border-slate-800/50 shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
                    <button
                        onClick={handleSubmit as unknown as React.MouseEventHandler}
                        disabled={saving}
                        className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors flex items-center space-x-2"
                    >
                        {saving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        <span>{saving ? "Saving…" : editing ? "Save Changes" : "Log Finding"}</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function VaptClient({ initialReports, initialFindings, orgId, owners }: VaptClientProps) {
    const supabase = createClient();

    const [reports, setReports] = useState<VaptReport[]>(initialReports);
    const [findings, setFindings] = useState<VaptFinding[]>(initialFindings);

    const [showUpload, setShowUpload] = useState(false);
    const [showFinding, setShowFinding] = useState(false);
    const [editingFinding, setEditingFinding] = useState<VaptFinding | null>(null);

    const [filterReport, setFilterReport] = useState<string>("all");
    const [filterSeverity, setFilterSeverity] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [search, setSearch] = useState("");

    // ── Computed stats ──
    const stats = useMemo(() => {
        const critical = findings.filter(f => f.severity === "critical").length;
        const high = findings.filter(f => f.severity === "high").length;
        const medium = findings.filter(f => f.severity === "medium").length;
        const low = findings.filter(f => f.severity === "low").length;
        const resolved = findings.filter(f => f.status === "resolved" || f.status === "accepted").length;
        const resolvedPct = findings.length > 0 ? Math.round((resolved / findings.length) * 100) : 0;
        return { total: findings.length, critical, high, medium, low, resolved, resolvedPct };
    }, [findings]);

    // ── Filtered findings ──
    const filtered = useMemo(() => {
        return findings.filter(f => {
            if (filterReport !== "all" && f.vapt_report_id !== filterReport) return false;
            if (filterSeverity !== "all" && f.severity !== filterSeverity) return false;
            if (filterStatus !== "all" && f.status !== filterStatus) return false;
            if (search && !f.title.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [findings, filterReport, filterSeverity, filterStatus, search]);

    // ── Chart data ──
    const barData = useMemo(() => (
        Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => ({
            name: cfg.label,
            count: findings.filter(f => f.severity === key).length,
            fill: cfg.chart,
        }))
    ), [findings]);

    const pieData = useMemo(() => {
        const open = findings.filter(f => f.status === "open" || f.status === "in_progress").length;
        const closed = findings.filter(f => f.status === "resolved" || f.status === "accepted").length;
        return [
            { name: "Open / In Progress", value: open, fill: "#ef4444" },
            { name: "Resolved / Accepted", value: closed, fill: "#10b981" },
        ];
    }, [findings]);

    // ── Handlers ──
    const handleReportCreated = useCallback((r: VaptReport) => {
        setReports(prev => [r, ...prev]);
    }, []);

    const handleFindingSaved = useCallback((f: VaptFinding) => {
        setFindings(prev => {
            const idx = prev.findIndex(x => x.id === f.id);
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = f;
                return next;
            }
            return [f, ...prev];
        });
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        await supabase.from("vulnerabilities").delete().eq("id", id);
        setFindings(prev => prev.filter(f => f.id !== id));
    }, [supabase]);

    const handleAdvanceStatus = useCallback(async (finding: VaptFinding) => {
        const cfg = STATUS_CONFIG[finding.status];
        if (!cfg?.next) return;
        await supabase.from("vulnerabilities").update({ status: cfg.next }).eq("id", finding.id);
        setFindings(prev => prev.map(f => f.id === finding.id ? { ...f, status: cfg.next! } : f));
    }, [supabase]);

    const isOverdue = (f: VaptFinding) =>
        f.due_date && new Date(f.due_date) < new Date() && f.status !== "resolved" && f.status !== "accepted";

    const openFinding = (f: VaptFinding | null) => {
        setEditingFinding(f);
        setShowFinding(true);
    };

    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <ShieldAlert className="w-8 h-8 mr-3 text-red-500" />
                        VAPT Tracker
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Manage penetration test reports and track finding remediation.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => openFinding(null)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2 border border-slate-700/50"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Log Finding</span>
                    </button>
                    <button
                        onClick={() => setShowUpload(true)}
                        className="bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                        <Upload className="w-4 h-4" />
                        <span>Upload Report</span>
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: "Total", count: stats.total, color: "text-slate-100" },
                    { label: "Critical", count: stats.critical, color: "text-red-400" },
                    { label: "High", count: stats.high, color: "text-orange-400" },
                    { label: "Medium", count: stats.medium, color: "text-amber-400" },
                    { label: "Low", count: stats.low, color: "text-emerald-400" },
                    { label: "Resolved", count: `${stats.resolvedPct}%`, color: "text-blue-400" },
                ].map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="glass-panel rounded-2xl p-4 border border-slate-800/50 flex flex-col"
                    >
                        <span className="text-xs text-slate-500 mb-1">{s.label}</span>
                        <span className={cn("text-2xl font-bold tracking-tight", s.color)}>{s.count}</span>
                    </motion.div>
                ))}
            </div>

            {/* Reports + Charts row */}
            {reports.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* VAPT Reports list */}
                    <div className="glass-panel rounded-2xl border border-slate-800/50 p-5 flex flex-col">
                        <div className="flex items-center space-x-2 mb-4">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <h3 className="text-sm font-semibold text-slate-100">VAPT Reports</h3>
                            <span className="ml-auto text-[10px] text-slate-500">{reports.length} report{reports.length !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex flex-col space-y-2 overflow-y-auto max-h-48">
                            {reports.map(r => (
                                <div
                                    key={r.id}
                                    onClick={() => setFilterReport(filterReport === r.id ? "all" : r.id)}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors",
                                        filterReport === r.id
                                            ? "bg-blue-500/10 border-blue-500/30"
                                            : "bg-slate-900/40 border-slate-800/50 hover:bg-slate-800/40"
                                    )}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-200 truncate">{r.title}</p>
                                        <p className="text-[10px] text-slate-500">
                                            {r.conducted_by ?? "Unknown"} · {r.report_date ? new Date(r.report_date).toLocaleDateString() : "No date"}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-2 shrink-0">
                                        {r.file_url && (
                                            <a
                                                href={r.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={e => e.stopPropagation()}
                                                className="text-slate-500 hover:text-blue-400 transition-colors"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                        <span className="text-[10px] text-slate-500">{r.finding_count} findings</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Severity bar chart */}
                    <div className="glass-panel rounded-2xl border border-slate-800/50 p-5 flex flex-col">
                        <div className="flex items-center space-x-2 mb-4">
                            <BarChart3 className="w-4 h-4 text-orange-400" />
                            <h3 className="text-sm font-semibold text-slate-100">Findings by Severity</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={barData} barSize={28}>
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 11 }}
                                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {barData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Open vs Resolved donut */}
                    <div className="glass-panel rounded-2xl border border-slate-800/50 p-5 flex flex-col">
                        <div className="flex items-center space-x-2 mb-4">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-sm font-semibold text-slate-100">Open vs Resolved</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={150}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} fillOpacity={0.8} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 11 }}
                                />
                                <Legend iconSize={8} wrapperStyle={{ fontSize: 10, color: "#64748b" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Findings Table */}
            <div className="glass-panel rounded-2xl border border-slate-800/50 flex flex-col">
                {/* Table header / filters */}
                <div className="flex flex-wrap items-center gap-3 p-5 border-b border-slate-800/50">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search findings…"
                            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>

                    <select
                        value={filterReport}
                        onChange={e => setFilterReport(e.target.value)}
                        className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                    >
                        <option value="all">All Reports</option>
                        {reports.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                    </select>

                    <select
                        value={filterSeverity}
                        onChange={e => setFilterSeverity(e.target.value)}
                        className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                    >
                        <option value="all">All Severities</option>
                        {Object.entries(SEVERITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                    >
                        <option value="all">All Statuses</option>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>

                    <span className="text-xs text-slate-500 ml-auto">{filtered.length} finding{filtered.length !== 1 ? "s" : ""}</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <ShieldAlert className="w-12 h-12 text-slate-700 mb-3" />
                        <p className="text-sm font-medium text-slate-400">No findings found</p>
                        <p className="text-xs text-slate-600 mt-1">Upload a VAPT report and log your first finding</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900/40">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Finding</th>
                                    <th className="px-4 py-3 font-medium">Severity</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Assignee</th>
                                    <th className="px-4 py-3 font-medium">Due Date</th>
                                    <th className="px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                <AnimatePresence initial={false}>
                                    {filtered.map(f => {
                                        const overdue = isOverdue(f);
                                        const statusCfg = STATUS_CONFIG[f.status];
                                        return (
                                            <motion.tr
                                                key={f.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-slate-800/20 transition-colors group"
                                            >
                                                <td className="px-5 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-slate-200 font-medium group-hover:text-white transition-colors">{f.title}</span>
                                                        {f.description && (
                                                            <span className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{f.description}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3"><SeverityBadge severity={f.severity} /></td>
                                                <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-slate-400">
                                                        {f.assignee?.full_name ?? "Unassigned"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {f.due_date ? (
                                                        <span className={cn("text-xs", overdue ? "text-red-400 font-medium" : "text-slate-400")}>
                                                            {overdue && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                                                            {new Date(f.due_date).toLocaleDateString()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-600">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {statusCfg?.next && (
                                                            <button
                                                                onClick={() => handleAdvanceStatus(f)}
                                                                title={`Advance to ${STATUS_CONFIG[statusCfg.next!]?.label}`}
                                                                className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => openFinding(f)}
                                                            className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(f.id)}
                                                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showUpload && (
                    <UploadReportModal
                        orgId={orgId}
                        onClose={() => setShowUpload(false)}
                        onCreated={handleReportCreated}
                    />
                )}
                {showFinding && (
                    <FindingModal
                        orgId={orgId}
                        reports={reports}
                        owners={owners}
                        editing={editingFinding}
                        defaultReportId={filterReport !== "all" ? filterReport : null}
                        onClose={() => { setShowFinding(false); setEditingFinding(null); }}
                        onSaved={handleFindingSaved}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
