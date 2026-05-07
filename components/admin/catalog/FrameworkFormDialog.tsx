"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export interface FrameworkRecord {
    id: string;
    slug: string;
    name: string;
    version: string | null;
    description: string | null;
    category: string | null;
    icon_name: string | null;
    color: string | null;
    status?: "active" | "archived";
}

interface Props {
    open: boolean;
    initial?: FrameworkRecord | null;
    onClose: () => void;
    onSaved: () => void;
}

const COLOR_PRESETS = [
    "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7",
    "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#64748b",
];

function toSlug(input: string): string {
    return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function expandHex(input: string): string {
    let v = input.trim().toLowerCase();
    if (!v) return v;
    if (!v.startsWith("#")) v = "#" + v;
    if (/^#[0-9a-f]{3}$/.test(v)) v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    return v;
}

export function FrameworkFormDialog({ open, initial, onClose, onSaved }: Props) {
    const editing = !!initial;
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        slug: "",
        name: "",
        version: "",
        description: "",
        category: "",
        icon_name: "",
        color: "",
    });

    useEffect(() => {
        if (!open) return;
        setForm({
            slug: initial?.slug ?? "",
            name: initial?.name ?? "",
            version: initial?.version ?? "",
            description: initial?.description ?? "",
            category: initial?.category ?? "",
            icon_name: initial?.icon_name ?? "",
            color: initial?.color ?? "",
        });
    }, [open, initial]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (submitting) return;

        if (!form.name.trim()) {
            toast.error("Name is required");
            return;
        }
        if (!editing && !form.slug.trim()) {
            toast.error("Slug is required");
            return;
        }

        setSubmitting(true);
        try {
            const payload: Record<string, string | null> = {
                name: form.name.trim(),
            };
            if (!editing) payload.slug = form.slug.trim();
            if (form.version.trim()) payload.version = form.version.trim();
            if (form.description.trim()) payload.description = form.description.trim();
            if (form.category.trim()) payload.category = form.category.trim();
            if (form.icon_name.trim()) payload.icon_name = form.icon_name.trim();
            if (form.color.trim()) payload.color = form.color.trim();

            const url = editing
                ? `/api/admin/catalog/frameworks/${initial!.id}`
                : "/api/admin/catalog/frameworks";
            const res = await fetch(url, {
                method: editing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "Request failed" }));
                throw new Error(err.error ?? "Request failed");
            }
            toast.success(editing ? "Framework updated" : "Framework created");
            onSaved();
            onClose();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => !submitting && onClose()}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-100">
                                {editing ? "Edit Framework" : "New Framework"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => !submitting && onClose()}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Slug {editing && <span className="text-slate-600 normal-case">(immutable)</span>}
                                </label>
                                <input
                                    value={form.slug}
                                    onChange={e => setForm(f => ({ ...f, slug: toSlug(e.target.value) }))}
                                    disabled={editing}
                                    required={!editing}
                                    placeholder="iso-27001-2022"
                                    className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Name</label>
                                    <input
                                        value={form.name}
                                        onChange={e => setForm(f => ({
                                            ...f,
                                            name: e.target.value,
                                            slug: !editing && (!f.slug || f.slug === toSlug(f.name)) ? toSlug(e.target.value) : f.slug,
                                        }))}
                                        required
                                        placeholder="ISO 27001:2022"
                                        className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Version</label>
                                    <input
                                        value={form.version}
                                        onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                                        placeholder="2022"
                                        className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    placeholder="Optional summary of the framework's scope."
                                    className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Category</label>
                                    <input
                                        value={form.category}
                                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                        placeholder="information_security"
                                        className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Icon</label>
                                    <input
                                        value={form.icon_name}
                                        onChange={e => setForm(f => ({ ...f, icon_name: e.target.value }))}
                                        placeholder="ShieldCheck"
                                        className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Color</label>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={/^#[0-9a-fA-F]{6}$/.test(form.color) ? form.color : "#64748b"}
                                        onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                                        className="h-10 w-12 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer"
                                    />
                                    <input
                                        value={form.color}
                                        onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                                        onBlur={e => {
                                            const next = expandHex(e.target.value);
                                            if (next !== e.target.value) setForm(f => ({ ...f, color: next }));
                                        }}
                                        placeholder="#10b981"
                                        className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                    />
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {COLOR_PRESETS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, color: c }))}
                                            className="w-6 h-6 rounded-md border border-slate-700 hover:scale-110 transition-transform"
                                            style={{ backgroundColor: c }}
                                            aria-label={`Use ${c}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => !submitting && onClose()}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-sm text-slate-400 hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors disabled:opacity-70"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editing ? "Save changes" : "Create framework"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
