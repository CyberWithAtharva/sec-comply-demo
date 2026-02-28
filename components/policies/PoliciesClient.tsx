"use client";

import React, { useState, useMemo, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    FileText, Plus, Search, X, AlertCircle, CheckCircle2,
    Clock, Upload, BookOpen, Edit2, Trash2, Users,
    RotateCcw, Shield, AlertTriangle, Eye,
    Sparkles, RefreshCw, Save
} from "lucide-react";
import { cn } from "@/components/ui/Card";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PolicyData {
    id: string;
    org_id: string;
    title: string;
    version: string;
    status: 'draft' | 'under_review' | 'approved' | 'archived';
    content: string | null;
    file_url: string | null;
    owner_id: string | null;
    next_review: string | null;
    created_at: string;
    updated_at: string;
    is_generated?: boolean;
    owner: { id: string; full_name: string | null } | null;
    ackCount: number;
    totalMembers: number;
}

export interface PolicyException {
    id: string;
    policy_id: string;
    org_id: string;
    description: string;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    approved_by: string | null;
    expires_at: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    created_at: string;
}

interface Owner { id: string; name: string }

interface PoliciesClientProps {
    initialPolicies: PolicyData[];
    initialExceptions: PolicyException[];
    orgId: string;
    currentUserId: string;
    owners: Owner[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    draft:        { label: "Draft",        color: "text-slate-400",   bg: "bg-slate-500/10",   border: "border-slate-500/30" },
    under_review: { label: "Under Review", color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
    approved:     { label: "Approved",     color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    archived:     { label: "Archived",     color: "text-slate-500",   bg: "bg-slate-800/30",   border: "border-slate-700/30" },
};

const EXCEPTION_RISK = {
    low:      { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    medium:   { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
    high:     { color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/30" },
    critical: { color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30" },
};

function StatusBadge({ status }: { status: PolicyData["status"] }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
    return (
        <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", cfg.color, cfg.bg, cfg.border)}>
            {cfg.label}
        </span>
    );
}

// ─── Policy Modal (Create / Edit) ─────────────────────────────────────────────

interface PolicyModalProps {
    orgId: string;
    owners: Owner[];
    editing: PolicyData | null;
    onClose: () => void;
    onSaved: (policy: PolicyData) => void;
}

function PolicyModal({ orgId, owners, editing, onClose, onSaved }: PolicyModalProps) {
    const supabase = createClient();
    const [form, setForm] = useState({
        title: editing?.title ?? "",
        version: editing?.version ?? "1.0",
        status: editing?.status ?? "draft",
        content: editing?.content ?? "",
        owner_id: editing?.owner_id ?? "",
        next_review: editing?.next_review ?? "",
    });
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { setError("Title is required."); return; }
        setSaving(true);
        setError(null);

        let file_url: string | null = editing?.file_url ?? null;

        if (file) {
            const ext = file.name.split(".").pop();
            const path = `${orgId}/${Date.now()}.${ext}`;
            const { error: uploadErr } = await supabase.storage
                .from("policy-documents")
                .upload(path, file, { contentType: file.type });
            if (uploadErr) {
                setError(`Upload failed: ${uploadErr.message}`);
                setSaving(false);
                return;
            }
            const { data: urlData } = supabase.storage.from("policy-documents").getPublicUrl(path);
            file_url = urlData.publicUrl;
        }

        const payload = {
            title: form.title.trim(),
            version: form.version.trim() || "1.0",
            status: form.status as PolicyData["status"],
            content: form.content.trim() || null,
            owner_id: form.owner_id || null,
            next_review: form.next_review || null,
            file_url,
        };

        if (editing) {
            // Use API route so status→approved triggers control_status hook
            const res = await fetch(`/api/policies/${editing.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) { setError(json.error ?? "Save failed."); setSaving(false); return; }
            onSaved({
                ...editing,
                ...json.policy,
                owner: editing.owner,
                ackCount: editing.ackCount,
                totalMembers: editing.totalMembers,
            });
        } else {
            // Create: direct Supabase (file upload already done above)
            const { data, error: err } = await supabase
                .from("policies")
                .insert({ ...payload, org_id: orgId })
                .select("*, profiles(id, full_name)")
                .single();
            if (err || !data) { setError(err?.message ?? "Save failed."); setSaving(false); return; }
            onSaved({
                ...(data as unknown as PolicyData),
                owner: (data.profiles as unknown as { id: string; full_name: string | null } | null),
                ackCount: 0,
                totalMembers: 0,
            });
        }
        onClose();
    };

    const inputCls = "w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors";

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
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-100">{editing ? "Edit Policy" : "Create Policy"}</h2>
                            <p className="text-xs text-slate-500">{editing ? "Update policy details" : "Add a new governance policy"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Title *</label>
                        <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="Information Security Policy" className={inputCls} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Version</label>
                            <input type="text" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                                placeholder="1.0" className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PolicyData["status"] }))} className={inputCls}>
                                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Owner</label>
                            <select value={form.owner_id} onChange={e => setForm(f => ({ ...f, owner_id: e.target.value }))} className={inputCls}>
                                <option value="">Unassigned</option>
                                {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Next Review</label>
                            <input type="date" value={form.next_review} onChange={e => setForm(f => ({ ...f, next_review: e.target.value }))} className={inputCls} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Content / Summary</label>
                        <textarea rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                            placeholder="Policy objective, scope, and key requirements…"
                            className={cn(inputCls, "resize-none")} />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Policy Document (PDF)</label>
                        <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-slate-700/50 rounded-xl cursor-pointer hover:border-slate-600/50 transition-colors bg-slate-800/30">
                            <div className="flex items-center space-x-2">
                                <Upload className="w-4 h-4 text-slate-500" />
                                <span className="text-xs text-slate-500">{file ? file.name : editing?.file_url ? "Replace existing PDF" : "Upload PDF"}</span>
                            </div>
                            <input type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                        </label>
                    </div>
                </form>

                <div className="flex justify-end space-x-3 p-6 border-t border-slate-800/50 shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
                    <button onClick={handleSubmit as unknown as React.MouseEventHandler} disabled={saving}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors flex items-center space-x-2">
                        {saving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        <span>{saving ? "Saving…" : editing ? "Save Changes" : "Create Policy"}</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Policy Detail Drawer ──────────────────────────────────────────────────────

interface PolicyDetailProps {
    policy: PolicyData;
    currentUserId: string;
    onClose: () => void;
    onAcknowledge: (policyId: string) => void;
    onUpdated: (policy: PolicyData) => void;
}

function PolicyDetailDrawer({ policy, currentUserId, onClose, onAcknowledge, onUpdated }: PolicyDetailProps) {
    const [acking, setAcking] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(policy.content ?? "");
    const [editStatus, setEditStatus] = useState(policy.status);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const supabase = createClient();

    const handleAcknowledge = async () => {
        setAcking(true);
        await supabase.from("policy_acknowledgements").insert({
            policy_id: policy.id,
            user_id: currentUserId,
        });
        onAcknowledge(policy.id);
        setAcking(false);
    };

    const handleSaveEdits = async () => {
        setSaving(true);
        setSaveError(null);
        const res = await fetch(`/api/policies/${policy.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: editContent, status: editStatus }),
        });
        const json = await res.json();
        if (!res.ok) { setSaveError(json.error ?? "Save failed."); setSaving(false); return; }
        onUpdated({ ...policy, ...json.policy, owner: policy.owner, ackCount: policy.ackCount, totalMembers: policy.totalMembers });
        setIsEditing(false);
        setSaving(false);
    };

    const ackPct = policy.totalMembers > 0
        ? Math.round((policy.ackCount / policy.totalMembers) * 100)
        : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-slate-900 border-l border-slate-700/50 w-full max-w-md h-full overflow-y-auto flex flex-col shadow-2xl"
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-800/50 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
                    <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-sm font-semibold text-slate-100 truncate max-w-[180px]">{policy.title}</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => { setIsEditing(!isEditing); setSaveError(null); }}
                            className={cn(
                                "p-1.5 rounded-lg transition-colors text-xs font-medium flex items-center gap-1",
                                isEditing ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-500 hover:text-blue-400 hover:bg-blue-500/10"
                            )}
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                            {isEditing ? "Editing" : "Edit"}
                        </button>
                        <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="p-6 space-y-6 flex-1">
                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Version</p>
                            <p className="text-sm text-slate-200 font-mono">v{policy.version}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Status</p>
                            <StatusBadge status={policy.status} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Owner</p>
                            <p className="text-sm text-slate-300">{policy.owner?.full_name ?? "Unassigned"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Next Review</p>
                            <p className={cn("text-sm", policy.next_review && new Date(policy.next_review) < new Date() ? "text-red-400" : "text-slate-300")}>
                                {policy.next_review ? new Date(policy.next_review).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Not set"}
                            </p>
                        </div>
                    </div>

                    {/* Acknowledgement progress */}
                    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-indigo-400" />
                                <span className="text-sm font-medium text-slate-200">Acknowledgements</span>
                            </div>
                            <span className="text-sm font-bold text-indigo-400">{policy.ackCount} / {policy.totalMembers}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${ackPct}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">{ackPct}% of team members have acknowledged</p>
                    </div>

                    {/* Inline edit mode */}
                    {isEditing && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                                <select
                                    value={editStatus}
                                    onChange={e => setEditStatus(e.target.value as PolicyData["status"])}
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500/50"
                                >
                                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Content / Summary</label>
                                <textarea
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    rows={8}
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none"
                                    placeholder="Policy summary or content…"
                                />
                            </div>
                            {saveError && <p className="text-xs text-red-400">{saveError}</p>}
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                                >Cancel</button>
                                <button
                                    onClick={handleSaveEdits}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                                >
                                    {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                    {saving ? "Saving…" : "Save"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    {!isEditing && policy.content && (
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Content</p>
                            <div className="policy-markdown text-sm text-slate-300 leading-relaxed space-y-3">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h2: ({ children }) => <h2 className="text-base font-semibold text-slate-100 mt-4 mb-1 first:mt-0">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-200 mt-3 mb-1">{children}</h3>,
                                        p: ({ children }) => <p className="text-slate-300 leading-relaxed">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-2">{children}</ol>,
                                        li: ({ children }) => <li className="text-slate-400 text-sm">{children}</li>,
                                        strong: ({ children }) => <strong className="font-semibold text-slate-200">{children}</strong>,
                                        table: ({ children }) => (
                                            <div className="overflow-x-auto rounded-lg border border-slate-700/50 my-2">
                                                <table className="w-full text-xs">{children}</table>
                                            </div>
                                        ),
                                        thead: ({ children }) => <thead className="bg-slate-800/60">{children}</thead>,
                                        tbody: ({ children }) => <tbody className="divide-y divide-slate-700/30">{children}</tbody>,
                                        th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-slate-300 text-[10px] uppercase tracking-wider">{children}</th>,
                                        td: ({ children }) => <td className="px-3 py-2 text-slate-400">{children}</td>,
                                        tr: ({ children }) => <tr className="hover:bg-slate-800/30 transition-colors">{children}</tr>,
                                        hr: () => <hr className="border-slate-700/50 my-3" />,
                                        blockquote: ({ children }) => <blockquote className="border-l-2 border-blue-500/50 pl-3 italic text-slate-400">{children}</blockquote>,
                                        code: ({ children }) => <code className="bg-slate-800 text-blue-300 px-1.5 py-0.5 rounded text-[11px] font-mono">{children}</code>,
                                    }}
                                >
                                    {policy.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {/* PDF download */}
                    {policy.file_url && (
                        <a
                            href={policy.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:bg-slate-800/60 transition-colors group"
                        >
                            <FileText className="w-8 h-8 text-indigo-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-200 group-hover:text-white transition-colors">Policy Document</p>
                                <p className="text-xs text-slate-500">Click to open PDF</p>
                            </div>
                        </a>
                    )}

                    {/* Acknowledge CTA */}
                    {policy.status === "approved" && (
                        <button
                            onClick={handleAcknowledge}
                            disabled={acking}
                            className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-sm font-medium text-indigo-400 transition-colors disabled:opacity-50"
                        >
                            {acking ? <RotateCcw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            <span>{acking ? "Recording…" : "Acknowledge Policy"}</span>
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PoliciesClient({ initialPolicies, initialExceptions, orgId, currentUserId, owners }: PoliciesClientProps) {
    const router = useRouter();
    const [, startTransition] = useTransition();

    const [policies, setPolicies] = useState<PolicyData[]>(initialPolicies);
    const [exceptions] = useState<PolicyException[]>(initialExceptions);
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<PolicyData | null>(null);
    const [viewing, setViewing] = useState<PolicyData | null>(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [generating, setGenerating] = useState(false);
    const [genMessage, setGenMessage] = useState<string | null>(null);

    // ── Stats ──
    const stats = useMemo(() => ({
        total: policies.length,
        approved: policies.filter(p => p.status === "approved").length,
        draft: policies.filter(p => p.status === "draft" || p.status === "under_review").length,
        overdue: policies.filter(p => p.next_review && new Date(p.next_review) < new Date() && p.status !== "archived").length,
        pendingExceptions: exceptions.filter(e => e.status === "pending").length,
    }), [policies, exceptions]);

    // ── Filtered ──
    const filtered = useMemo(() => policies.filter(p => {
        if (filterStatus !== "all" && p.status !== filterStatus) return false;
        if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [policies, filterStatus, search]);

    // ── Handlers ──
    const handleSaved = useCallback((p: PolicyData) => {
        setPolicies(prev => {
            const idx = prev.findIndex(x => x.id === p.id);
            if (idx >= 0) { const next = [...prev]; next[idx] = p; return next; }
            return [p, ...prev];
        });
    }, []);

    const handleUpdated = useCallback((p: PolicyData) => {
        setPolicies(prev => prev.map(x => x.id === p.id ? p : x));
        setViewing(p);
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        const res = await fetch(`/api/policies/${id}`, { method: "DELETE" });
        if (res.ok) {
            setPolicies(prev => prev.filter(p => p.id !== id));
        }
    }, []);

    const handleGenerate = useCallback(async () => {
        setGenerating(true);
        setGenMessage(null);
        try {
            const res = await fetch("/api/policies/generate", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed");
            setGenMessage(`Generated ${data.generated} policies (${data.skipped} already existed).`);
            startTransition(() => router.refresh());
        } catch (e: unknown) {
            setGenMessage(e instanceof Error ? e.message : "Generation failed.");
        } finally {
            setGenerating(false);
        }
    }, [router, startTransition]);

    const handleAcknowledge = useCallback((policyId: string) => {
        setPolicies(prev => prev.map(p =>
            p.id === policyId ? { ...p, ackCount: p.ackCount + 1 } : p
        ));
    }, []);

    const isOverdueReview = (p: PolicyData) =>
        p.next_review && new Date(p.next_review) < new Date() && p.status !== "archived";

    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <FileText className="w-8 h-8 mr-3 text-indigo-500" />
                        Governance & Policies
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Manage policy lifecycle, acknowledgements, and exceptions.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="flex items-center space-x-2 border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        <span>{generating ? "Generating…" : "Generate Templates"}</span>
                    </button>
                    <button
                        onClick={() => { setEditing(null); setShowCreate(true); }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-colors flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Policy</span>
                    </button>
                </div>
            </div>

            {/* Generate result message */}
            {genMessage && (
                <div className="flex items-center space-x-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{genMessage}</span>
                    <button onClick={() => setGenMessage(null)} className="ml-auto text-emerald-600 hover:text-emerald-400">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Empty state CTA */}
            {policies.length === 0 && (
                <div className="glass-panel p-10 rounded-2xl border border-dashed border-blue-500/30 flex flex-col items-center text-center space-y-5">
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                        <Sparkles className="w-10 h-10 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-200 mb-2">No Policies Yet</h3>
                        <p className="text-sm text-slate-500 max-w-md">
                            Generate a full set of compliance-ready policy templates (Information Security, Access Control, Incident Response, and more) for your assigned frameworks in one click.
                        </p>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                    >
                        {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {generating ? "Generating…" : "Generate Policy Templates"}
                    </button>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    { label: "Total Policies",    count: stats.total,             color: "text-slate-100",   icon: <FileText className="w-4 h-4" /> },
                    { label: "Approved",           count: stats.approved,          color: "text-emerald-400", icon: <CheckCircle2 className="w-4 h-4" /> },
                    { label: "Draft / Review",     count: stats.draft,             color: "text-amber-400",   icon: <Clock className="w-4 h-4" /> },
                    { label: "Overdue Reviews",    count: stats.overdue,           color: stats.overdue > 0 ? "text-red-400" : "text-slate-400",  icon: <AlertTriangle className="w-4 h-4" /> },
                    { label: "Open Exceptions",    count: stats.pendingExceptions, color: stats.pendingExceptions > 0 ? "text-orange-400" : "text-slate-400", icon: <Shield className="w-4 h-4" /> },
                ].map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="glass-panel rounded-2xl p-4 border border-slate-800/50 flex flex-col"
                    >
                        <div className={cn("flex items-center space-x-1.5 mb-1", s.color)}>
                            {s.icon}
                            <span className="text-[10px] text-slate-500">{s.label}</span>
                        </div>
                        <span className={cn("text-2xl font-bold tracking-tight", s.color)}>{s.count}</span>
                    </motion.div>
                ))}
            </div>

            {/* Policies Table */}
            <div className="glass-panel rounded-2xl border border-slate-800/50 flex flex-col">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 p-5 border-b border-slate-800/50">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search policies…"
                            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none"
                    >
                        <option value="all">All Statuses</option>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                    <span className="text-xs text-slate-500 ml-auto">{filtered.length} polic{filtered.length !== 1 ? "ies" : "y"}</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <BookOpen className="w-12 h-12 text-slate-700 mb-3" />
                        <p className="text-sm font-medium text-slate-400">No policies found</p>
                        <p className="text-xs text-slate-600 mt-1">Create your first policy to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900/40">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Policy</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Owner</th>
                                    <th className="px-4 py-3 font-medium">Acknowledgements</th>
                                    <th className="px-4 py-3 font-medium">Next Review</th>
                                    <th className="px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                <AnimatePresence initial={false}>
                                    {filtered.map(p => {
                                        const overdue = isOverdueReview(p);
                                        const ackPct = p.totalMembers > 0 ? Math.round((p.ackCount / p.totalMembers) * 100) : 0;
                                        return (
                                            <motion.tr
                                                key={p.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-slate-800/20 transition-colors group"
                                            >
                                                <td className="px-5 py-3">
                                                    <div className="flex flex-col">
                                                        <button
                                                            onClick={() => setViewing(p)}
                                                            className="text-sm text-slate-200 font-medium hover:text-indigo-400 text-left transition-colors"
                                                        >
                                                            {p.title}
                                                        </button>
                                                        <span className="text-[11px] text-slate-500 font-mono mt-0.5">v{p.version}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-slate-400">{p.owner?.full_name ?? "Unassigned"}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-16 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${ackPct}%` }} />
                                                        </div>
                                                        <span className="text-[11px] text-slate-500">{p.ackCount}/{p.totalMembers}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {p.next_review ? (
                                                        <span className={cn("text-xs", overdue ? "text-red-400 font-medium" : "text-slate-400")}>
                                                            {overdue && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                                                            {new Date(p.next_review).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                                        </span>
                                                    ) : <span className="text-xs text-slate-600">—</span>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setViewing(p)}
                                                            className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setEditing(p); setShowCreate(true); }}
                                                            className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(p.id)}
                                                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                            title="Delete"
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

            {/* Exceptions section (if any) */}
            {exceptions.length > 0 && (
                <div className="glass-panel rounded-2xl border border-slate-800/50 p-6">
                    <div className="flex items-center space-x-2 mb-5">
                        <Shield className="w-5 h-5 text-orange-400" />
                        <h3 className="text-base font-semibold text-slate-100">Policy Exceptions</h3>
                        <span className="ml-auto text-xs text-slate-500">{exceptions.length} exception{exceptions.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex flex-col space-y-3">
                        {exceptions.slice(0, 5).map(ex => {
                            const riskCfg = EXCEPTION_RISK[ex.risk_level] ?? EXCEPTION_RISK.medium;
                            const statusColor = ex.status === "approved" ? "text-emerald-400" : ex.status === "pending" ? "text-amber-400" : "text-slate-500";
                            return (
                                <div key={ex.id} className="flex items-start justify-between p-4 bg-slate-900/40 rounded-xl border border-slate-800/50">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-200 truncate">{ex.description}</p>
                                        {ex.expires_at && (
                                            <p className="text-[11px] text-slate-500 mt-0.5">Expires {new Date(ex.expires_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-3 ml-4 shrink-0">
                                        <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", riskCfg.color, riskCfg.bg, riskCfg.border)}>
                                            {ex.risk_level}
                                        </span>
                                        <span className={cn("text-[10px] uppercase font-bold", statusColor)}>{ex.status}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {showCreate && (
                    <PolicyModal
                        orgId={orgId}
                        owners={owners}
                        editing={editing}
                        onClose={() => { setShowCreate(false); setEditing(null); }}
                        onSaved={handleSaved}
                    />
                )}
                {viewing && (
                    <PolicyDetailDrawer
                        policy={viewing}
                        currentUserId={currentUserId}
                        onClose={() => setViewing(null)}
                        onAcknowledge={handleAcknowledge}
                        onUpdated={handleUpdated}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
