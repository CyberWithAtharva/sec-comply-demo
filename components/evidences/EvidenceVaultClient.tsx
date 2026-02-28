"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    FolderGit2, CloudUpload, Search, X, AlertCircle, CheckCircle2,
    FileText, FileImage, FileCode, File, Trash2, ExternalLink,
    RotateCcw, Plus, AlertTriangle, Clock, Download
} from "lucide-react";
import { cn } from "@/components/ui/Card";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EvidenceArtifact {
    id: string;
    org_id: string;
    control_id: string | null;
    name: string;
    description: string | null;
    file_url: string | null;
    file_type: string | null;
    file_size: number | null;
    uploaded_by: string | null;
    status: string;
    expires_at: string | null;
    created_at: string;
    uploader: { id: string; full_name: string | null } | null;
}

export interface Control {
    id: string;
    control_id: string;
    title: string;
    domain: string | null;
    framework_id: string;
}

interface EvidenceVaultClientProps {
    initialArtifacts: EvidenceArtifact[];
    controls: Control[];
    orgId: string;
    currentUserId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STALE_DAYS = 90;

function isStale(artifact: EvidenceArtifact): boolean {
    const created = new Date(artifact.created_at);
    const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > STALE_DAYS;
}

function isExpiringSoon(artifact: EvidenceArtifact): boolean {
    if (!artifact.expires_at) return false;
    const exp = new Date(artifact.expires_at);
    const diffDays = (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 14;
}

function isExpired(artifact: EvidenceArtifact): boolean {
    if (!artifact.expires_at) return false;
    return new Date(artifact.expires_at) < new Date();
}

function formatBytes(bytes: number | null): string {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ type }: { type: string | null }) {
    if (!type) return <File className="w-5 h-5 text-slate-500" />;
    if (type.includes("pdf")) return <FileText className="w-5 h-5 text-red-400" />;
    if (type.includes("image")) return <FileImage className="w-5 h-5 text-blue-400" />;
    if (type.includes("json") || type.includes("yaml") || type.includes("text")) return <FileCode className="w-5 h-5 text-green-400" />;
    return <File className="w-5 h-5 text-slate-400" />;
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────

interface UploadModalProps {
    orgId: string;
    currentUserId: string;
    controls: Control[];
    onClose: () => void;
    onUploaded: (artifact: EvidenceArtifact) => void;
}

function UploadModal({ orgId, currentUserId, controls, onClose, onUploaded }: UploadModalProps) {
    const supabase = createClient();
    const [form, setForm] = useState({ name: "", description: "", control_id: "", expires_at: "" });
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError("Name is required."); return; }
        setUploading(true); setError(null);

        let file_url: string | null = null;
        let file_type: string | null = null;
        let file_size: number | null = null;

        if (file) {
            const ext = file.name.split(".").pop();
            const path = `${orgId}/${Date.now()}.${ext}`;
            const { error: uploadErr } = await supabase.storage
                .from("evidence-artifacts")
                .upload(path, file, { contentType: file.type });
            if (uploadErr) {
                setError(`Upload failed: ${uploadErr.message}`);
                setUploading(false);
                return;
            }
            const { data: urlData } = supabase.storage.from("evidence-artifacts").getPublicUrl(path);
            file_url = urlData.publicUrl;
            file_type = file.type;
            file_size = file.size;
        }

        // Insert via API route which also bumps control_status evidence_count
        const res = await fetch("/api/evidence", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                org_id: orgId,
                name: form.name.trim(),
                description: form.description.trim() || null,
                control_id: form.control_id || null,
                expires_at: form.expires_at || null,
                file_url,
                file_type,
                file_size,
            }),
        });
        const json = await res.json();

        if (!res.ok || !json.artifact) { setError(json.error ?? "Save failed."); setUploading(false); return; }
        const data = json.artifact;
        onUploaded({
            ...(data as unknown as EvidenceArtifact),
            uploader: data.profiles as unknown as { id: string; full_name: string | null } | null,
        });
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
                            <CloudUpload className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-100">Upload Evidence</h2>
                            <p className="text-xs text-slate-500">Add a compliance artifact to the vault</p>
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
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Evidence Name *</label>
                        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. SOC 2 Audit Report 2025" className={inputCls} />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                        <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Brief description of what this evidence covers…"
                            className={cn(inputCls, "resize-none")} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Link to Control</label>
                            <select value={form.control_id} onChange={e => setForm(f => ({ ...f, control_id: e.target.value }))} className={inputCls}>
                                <option value="">No control linked</option>
                                {controls.map(c => (
                                    <option key={c.id} value={c.id}>{c.control_id} — {c.title.slice(0, 30)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Expiry Date</label>
                            <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className={inputCls} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">File (optional)</label>
                        <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-slate-700/50 rounded-xl cursor-pointer hover:border-slate-600/50 transition-colors bg-slate-800/30">
                            <div className="flex flex-col items-center space-y-1">
                                <CloudUpload className="w-5 h-5 text-slate-500" />
                                <span className="text-xs text-slate-500">{file ? file.name : "Click to upload a file"}</span>
                            </div>
                            <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
                        <button type="submit" disabled={uploading}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl flex items-center space-x-2 transition-colors">
                            {uploading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            <span>{uploading ? "Uploading…" : "Upload"}</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EvidenceVaultClient({ initialArtifacts, controls, orgId, currentUserId }: EvidenceVaultClientProps) {
    const supabase = createClient();

    const [artifacts, setArtifacts] = useState<EvidenceArtifact[]>(initialArtifacts);
    const [showUpload, setShowUpload] = useState(false);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterControl, setFilterControl] = useState("all");

    // Build a map from control_id to control for quick lookup
    const controlMap = useMemo(() => new Map(controls.map(c => [c.id, c])), [controls]);

    // ── Stats ──
    const stats = useMemo(() => {
        const stale = artifacts.filter(isStale).length;
        const expiringSoon = artifacts.filter(isExpiringSoon).length;
        const expired = artifacts.filter(isExpired).length;
        const linked = artifacts.filter(a => a.control_id).length;
        return { total: artifacts.length, stale, expiringSoon, expired, linked };
    }, [artifacts]);

    // ── Filtered ──
    const filtered = useMemo(() => artifacts.filter(a => {
        if (filterStatus === "stale" && !isStale(a)) return false;
        if (filterStatus === "expiring" && !isExpiringSoon(a)) return false;
        if (filterStatus === "expired" && !isExpired(a)) return false;
        if (filterControl !== "all" && a.control_id !== filterControl) return false;
        if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [artifacts, filterStatus, filterControl, search]);

    // ── Handlers ──
    const handleUploaded = useCallback((a: EvidenceArtifact) => {
        setArtifacts(prev => [a, ...prev]);
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        await fetch("/api/evidence", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setArtifacts(prev => prev.filter(a => a.id !== id));
    }, []);

    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <FolderGit2 className="w-8 h-8 mr-3 text-indigo-500" />
                        Evidence Vault
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Centralized compliance artifacts with control linkage and freshness tracking.</p>
                </div>
                <button
                    onClick={() => setShowUpload(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-colors flex items-center space-x-2"
                >
                    <CloudUpload className="w-4 h-4" />
                    <span>Upload Artifact</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    { label: "Total Artifacts",  count: stats.total,         color: "text-slate-100" },
                    { label: "Linked to Controls", count: stats.linked,       color: "text-indigo-400" },
                    { label: "Stale (>90 days)",  count: stats.stale,         color: stats.stale > 0 ? "text-amber-400" : "text-slate-400" },
                    { label: "Expiring Soon",     count: stats.expiringSoon,  color: stats.expiringSoon > 0 ? "text-orange-400" : "text-slate-400" },
                    { label: "Expired",           count: stats.expired,       color: stats.expired > 0 ? "text-red-400" : "text-slate-400" },
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

            {/* Artifacts */}
            <div className="glass-panel rounded-2xl border border-slate-800/50 flex flex-col">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 p-5 border-b border-slate-800/50">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search evidence…"
                            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
                        <option value="all">All Evidence</option>
                        <option value="stale">Stale (&gt;90 days)</option>
                        <option value="expiring">Expiring Soon</option>
                        <option value="expired">Expired</option>
                    </select>
                    <select value={filterControl} onChange={e => setFilterControl(e.target.value)}
                        className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
                        <option value="all">All Controls</option>
                        {controls.map(c => (
                            <option key={c.id} value={c.id}>{c.control_id}</option>
                        ))}
                    </select>
                    <span className="text-xs text-slate-500 ml-auto">{filtered.length} artifact{filtered.length !== 1 ? "s" : ""}</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <FolderGit2 className="w-12 h-12 text-slate-700 mb-3" />
                        <p className="text-sm font-medium text-slate-400">No evidence found</p>
                        <p className="text-xs text-slate-600 mt-1">Upload your first compliance artifact</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900/40">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Evidence</th>
                                    <th className="px-4 py-3 font-medium">Control</th>
                                    <th className="px-4 py-3 font-medium">Uploaded By</th>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium">Expiry</th>
                                    <th className="px-4 py-3 font-medium">Size</th>
                                    <th className="px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                <AnimatePresence initial={false}>
                                    {filtered.map(a => {
                                        const stale = isStale(a);
                                        const expiring = isExpiringSoon(a);
                                        const expired = isExpired(a);
                                        const ctrl = a.control_id ? controlMap.get(a.control_id) : null;

                                        return (
                                            <motion.tr
                                                key={a.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-slate-800/20 transition-colors group"
                                            >
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center space-x-3">
                                                        <FileIcon type={a.file_type} />
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-sm font-medium text-slate-200 truncate max-w-[200px]">{a.name}</span>
                                                            {a.description && (
                                                                <span className="text-[11px] text-slate-500 truncate max-w-[200px]">{a.description}</span>
                                                            )}
                                                            {stale && !expired && (
                                                                <span className="text-[10px] text-amber-400 flex items-center space-x-1 mt-0.5">
                                                                    <Clock className="w-3 h-3" /><span>Stale</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {ctrl ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-mono text-indigo-400">{ctrl.control_id}</span>
                                                            <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{ctrl.title}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-600">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-slate-400">{a.uploader?.full_name ?? "Unknown"}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {a.expires_at ? (
                                                        <span className={cn("text-xs", expired ? "text-red-400 font-medium" : expiring ? "text-orange-400 font-medium" : "text-slate-400")}>
                                                            {expired && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                                                            {expiring && !expired && <Clock className="w-3 h-3 inline mr-1" />}
                                                            {new Date(a.expires_at).toLocaleDateString()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-600">No expiry</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-slate-500 font-mono">{formatBytes(a.file_size)}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {a.file_url && (
                                                            <a href={a.file_url} target="_blank" rel="noopener noreferrer"
                                                                className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                                                                <Download className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        <button onClick={() => handleDelete(a.id)}
                                                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
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

            {/* Upload Modal */}
            <AnimatePresence>
                {showUpload && (
                    <UploadModal
                        orgId={orgId}
                        currentUserId={currentUserId}
                        controls={controls}
                        onClose={() => setShowUpload(false)}
                        onUploaded={handleUploaded}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
