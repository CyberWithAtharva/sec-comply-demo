"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export interface ControlRecord {
    id: string;
    framework_id: string;
    code: string;
    name: string;
    description: string | null;
    domain: string | null;
    sort_order: number;
}

interface Props {
    open: boolean;
    frameworkId: string;
    initial?: ControlRecord | null;
    onClose: () => void;
    onSaved: () => void;
}

export function ControlFormDialog({ open, frameworkId, initial, onClose, onSaved }: Props) {
    const editing = !!initial;
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        code: "",
        name: "",
        description: "",
        domain: "",
        sort_order: "0",
    });

    useEffect(() => {
        if (!open) return;
        setForm({
            code: initial?.code ?? "",
            name: initial?.name ?? "",
            description: initial?.description ?? "",
            domain: initial?.domain ?? "",
            sort_order: String(initial?.sort_order ?? 0),
        });
    }, [open, initial]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (submitting) return;
        if (!form.code.trim()) { toast.error("Code is required"); return; }
        if (!form.name.trim()) { toast.error("Name is required"); return; }

        const sortOrderNum = Number(form.sort_order);
        if (!Number.isFinite(sortOrderNum)) { toast.error("Sort order must be a number"); return; }

        setSubmitting(true);
        try {
            const payload: Record<string, unknown> = {
                code: form.code.trim(),
                name: form.name.trim(),
                sort_order: Math.trunc(sortOrderNum),
            };
            if (form.description.trim()) payload.description = form.description.trim();
            if (form.domain.trim()) payload.domain = form.domain.trim();

            const url = editing
                ? `/api/admin/catalog/frameworks/${frameworkId}/controls/${initial!.id}`
                : `/api/admin/catalog/frameworks/${frameworkId}/controls`;
            const res = await fetch(url, {
                method: editing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "Request failed" }));
                throw new Error(err.error ?? "Request failed");
            }
            toast.success(editing ? "Control updated" : "Control added");
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
                                {editing ? "Edit Control" : "New Control"}
                            </h2>
                            <button onClick={() => !submitting && onClose()} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Code</label>
                                    <input
                                        value={form.code}
                                        onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                                        required
                                        placeholder="A.5.1"
                                        className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sort Order</label>
                                    <input
                                        type="number"
                                        value={form.sort_order}
                                        onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
                                        className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Name</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    required
                                    placeholder="Policies for information security"
                                    className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Domain</label>
                                <input
                                    value={form.domain}
                                    onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
                                    placeholder="Organizational"
                                    className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={4}
                                    placeholder="Optional control requirement text."
                                    className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                                />
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
                                    {editing ? "Save changes" : "Add control"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
