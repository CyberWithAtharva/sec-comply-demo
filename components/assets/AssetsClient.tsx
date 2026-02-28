"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    ServerCrash, Plus, Search, X, AlertCircle, Cloud,
    Server, Database, Laptop, Globe, Edit2, Trash2,
    RotateCcw, AlertTriangle, CheckCircle2, Monitor
} from "lucide-react";
import { cn } from "@/components/ui/Card";

export interface Asset {
    id: string;
    org_id: string;
    name: string;
    type: string;
    provider: string;
    external_id: string | null;
    region: string | null;
    ip_address: string | null;
    tags: Record<string, unknown> | null;
    metadata: Record<string, unknown> | null;
    criticality: string;
    last_seen: string | null;
    created_at: string;
}

interface AssetsClientProps {
    initialAssets: Asset[];
    orgId: string;
}

const CRITICALITY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
    critical: { color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30" },
    high:     { color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/30" },
    medium:   { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
    low:      { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
};

const PROVIDER_ICONS: Record<string, React.ElementType> = {
    aws: Cloud,
    github: Globe,
    manual: Server,
};

function TypeIcon({ type }: { type: string }) {
    const lower = type.toLowerCase();
    if (lower.includes("ec2") || lower.includes("server") || lower.includes("vm")) return <Server className="w-4 h-4 text-blue-400" />;
    if (lower.includes("rds") || lower.includes("database") || lower.includes("db")) return <Database className="w-4 h-4 text-amber-400" />;
    if (lower.includes("laptop") || lower.includes("endpoint")) return <Laptop className="w-4 h-4 text-slate-400" />;
    if (lower.includes("s3") || lower.includes("storage") || lower.includes("cloud")) return <Cloud className="w-4 h-4 text-emerald-400" />;
    return <Monitor className="w-4 h-4 text-slate-500" />;
}

// ─── Add Asset Modal ──────────────────────────────────────────────────────────

interface AssetModalProps {
    orgId: string;
    editing: Asset | null;
    onClose: () => void;
    onSaved: (asset: Asset) => void;
}

function AssetModal({ orgId, editing, onClose, onSaved }: AssetModalProps) {
    const supabase = createClient();
    const [form, setForm] = useState({
        name: editing?.name ?? "",
        type: editing?.type ?? "server",
        provider: editing?.provider ?? "manual",
        external_id: editing?.external_id ?? "",
        region: editing?.region ?? "",
        ip_address: editing?.ip_address ?? "",
        criticality: editing?.criticality ?? "medium",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError("Name is required."); return; }
        setSaving(true); setError(null);

        const payload = {
            name: form.name.trim(),
            type: form.type,
            provider: form.provider,
            external_id: form.external_id.trim() || null,
            region: form.region.trim() || null,
            ip_address: form.ip_address.trim() || null,
            criticality: form.criticality,
        };

        let data, err;
        if (editing) {
            const res = await supabase.from("assets").update(payload).eq("id", editing.id).select().single();
            data = res.data; err = res.error;
        } else {
            const res = await supabase.from("assets").insert({ ...payload, org_id: orgId }).select().single();
            data = res.data; err = res.error;
        }

        if (err || !data) { setError(err?.message ?? "Save failed."); setSaving(false); return; }
        onSaved(data as Asset);
        onClose();
    };

    const inputCls = "w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors";

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
                            <Server className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-100">{editing ? "Edit Asset" : "Add Asset"}</h2>
                            <p className="text-xs text-slate-500">Manually register an asset in the inventory</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center space-x-2"><AlertCircle className="w-4 h-4" /><span>{error}</span></div>}

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Name *</label>
                        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="prod-api-server-01" className={inputCls} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
                            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inputCls}>
                                {["server", "ec2", "rds", "s3", "lambda", "database", "laptop", "endpoint", "network", "other"].map(t => (
                                    <option key={t} value={t}>{t.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Provider</label>
                            <select value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} className={inputCls}>
                                {["manual", "aws", "github"].map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Criticality</label>
                            <select value={form.criticality} onChange={e => setForm(f => ({ ...f, criticality: e.target.value }))} className={inputCls}>
                                {["critical", "high", "medium", "low"].map(c => (
                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">IP Address</label>
                            <input type="text" value={form.ip_address} onChange={e => setForm(f => ({ ...f, ip_address: e.target.value }))}
                                placeholder="10.0.1.5" className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Region</label>
                            <input type="text" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                                placeholder="us-east-1" className={inputCls} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">External ID</label>
                        <input type="text" value={form.external_id} onChange={e => setForm(f => ({ ...f, external_id: e.target.value }))}
                            placeholder="i-0a1b2c3d4e5f (AWS resource ID)" className={inputCls} />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
                        <button type="submit" disabled={saving}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl flex items-center space-x-2 transition-colors">
                            {saving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            <span>{saving ? "Saving…" : editing ? "Save" : "Add Asset"}</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AssetsClient({ initialAssets, orgId }: AssetsClientProps) {
    const supabase = createClient();
    const [assets, setAssets] = useState<Asset[]>(initialAssets);
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<Asset | null>(null);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterProvider, setFilterProvider] = useState("all");
    const [filterCriticality, setFilterCriticality] = useState("all");

    const stats = useMemo(() => ({
        total: assets.length,
        cloud: assets.filter(a => a.provider === "aws").length,
        critical: assets.filter(a => a.criticality === "critical" || a.criticality === "high").length,
        manual: assets.filter(a => a.provider === "manual").length,
    }), [assets]);

    const providers = useMemo(() => [...new Set(assets.map(a => a.provider))], [assets]);
    const types = useMemo(() => [...new Set(assets.map(a => a.type))], [assets]);

    const filtered = useMemo(() => assets.filter(a => {
        if (filterType !== "all" && a.type !== filterType) return false;
        if (filterProvider !== "all" && a.provider !== filterProvider) return false;
        if (filterCriticality !== "all" && a.criticality !== filterCriticality) return false;
        if (search && !a.name.toLowerCase().includes(search.toLowerCase()) &&
            !(a.external_id?.toLowerCase().includes(search.toLowerCase()))) return false;
        return true;
    }), [assets, filterType, filterProvider, filterCriticality, search]);

    const handleSaved = useCallback((a: Asset) => {
        setAssets(prev => {
            const idx = prev.findIndex(x => x.id === a.id);
            if (idx >= 0) { const next = [...prev]; next[idx] = a; return next; }
            return [a, ...prev];
        });
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        await supabase.from("assets").delete().eq("id", id);
        setAssets(prev => prev.filter(a => a.id !== id));
    }, [supabase]);

    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <ServerCrash className="w-8 h-8 mr-3 text-blue-500" />
                        Asset Inventory
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Track all cloud, network, and endpoint assets across your environment.</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setShowCreate(true); }}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Asset</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total Assets",    count: stats.total,    color: "text-slate-100" },
                    { label: "Cloud (AWS)",     count: stats.cloud,    color: "text-emerald-400" },
                    { label: "Critical / High", count: stats.critical, color: stats.critical > 0 ? "text-orange-400" : "text-slate-400" },
                    { label: "Manual",          count: stats.manual,   color: "text-blue-400" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="glass-panel rounded-2xl p-4 border border-slate-800/50 flex flex-col">
                        <span className="text-[10px] text-slate-500 mb-1">{s.label}</span>
                        <span className={cn("text-2xl font-bold tracking-tight", s.color)}>{s.count}</span>
                    </motion.div>
                ))}
            </div>

            {/* Table */}
            <div className="glass-panel rounded-2xl border border-slate-800/50 flex flex-col">
                <div className="flex flex-wrap items-center gap-3 p-5 border-b border-slate-800/50">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets…"
                            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none" />
                    </div>
                    <select value={filterProvider} onChange={e => setFilterProvider(e.target.value)}
                        className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
                        <option value="all">All Providers</option>
                        {providers.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                    </select>
                    <select value={filterCriticality} onChange={e => setFilterCriticality(e.target.value)}
                        className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
                        <option value="all">All Criticalities</option>
                        {["critical", "high", "medium", "low"].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                    <span className="text-xs text-slate-500 ml-auto">{filtered.length} asset{filtered.length !== 1 ? "s" : ""}</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <ServerCrash className="w-12 h-12 text-slate-700 mb-3" />
                        <p className="text-sm font-medium text-slate-400">No assets found</p>
                        <p className="text-xs text-slate-600 mt-1">Connect your AWS account or add assets manually</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900/40">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Asset</th>
                                    <th className="px-4 py-3 font-medium">Type</th>
                                    <th className="px-4 py-3 font-medium">Provider</th>
                                    <th className="px-4 py-3 font-medium">Region</th>
                                    <th className="px-4 py-3 font-medium">IP</th>
                                    <th className="px-4 py-3 font-medium">Criticality</th>
                                    <th className="px-4 py-3 font-medium">Last Seen</th>
                                    <th className="px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                <AnimatePresence initial={false}>
                                    {filtered.map(a => {
                                        const critCfg = CRITICALITY_CONFIG[a.criticality] ?? CRITICALITY_CONFIG.medium;
                                        const ProvIcon = PROVIDER_ICONS[a.provider] ?? Server;
                                        return (
                                            <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                className="hover:bg-slate-800/20 transition-colors group">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center space-x-2">
                                                        <TypeIcon type={a.type} />
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-200">{a.name}</p>
                                                            {a.external_id && <p className="text-[11px] text-slate-500 font-mono">{a.external_id}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3"><span className="text-xs text-slate-300 font-mono uppercase">{a.type}</span></td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-1.5">
                                                        <ProvIcon className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-xs text-slate-300 uppercase">{a.provider}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3"><span className="text-xs text-slate-400">{a.region ?? "—"}</span></td>
                                                <td className="px-4 py-3"><span className="text-xs text-slate-400 font-mono">{a.ip_address ?? "—"}</span></td>
                                                <td className="px-4 py-3">
                                                    <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", critCfg.color, critCfg.bg, critCfg.border)}>
                                                        {a.criticality}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-slate-400">
                                                        {a.last_seen ? new Date(a.last_seen).toLocaleDateString() : "—"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditing(a); setShowCreate(true); }}
                                                            className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
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

            <AnimatePresence>
                {showCreate && (
                    <AssetModal orgId={orgId} editing={editing}
                        onClose={() => { setShowCreate(false); setEditing(null); }}
                        onSaved={handleSaved} />
                )}
            </AnimatePresence>
        </div>
    );
}
