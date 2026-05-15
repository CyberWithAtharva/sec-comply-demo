"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { severityFromScore, STATUS_OPTIONS, STATUS_LABELS, type RiskStatus } from "@/lib/risk-styles";
import { CATEGORIES } from "@/lib/risk-library";
import type { OwnerOption, RiskRow } from "./types";

interface Props {
    orgId: string;
    owners: OwnerOption[];
    onClose: () => void;
    onCreated: (risk: RiskRow) => void;
}

export function AddRiskModal({ orgId, owners, onClose, onCreated }: Props) {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<string>(CATEGORIES[0].name);
    const [description, setDescription] = useState("");
    const [likelihood, setLikelihood] = useState(3);
    const [impact, setImpact] = useState(3);
    const [status, setStatus] = useState<RiskStatus>("open");
    const [ownerId, setOwnerId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [recommendation, setRecommendation] = useState("");
    const [saving, setSaving] = useState(false);

    const score = likelihood * impact;
    const sev = severityFromScore(score);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;
        setSaving(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from("risks")
            .insert({
                org_id: orgId,
                title: title.trim(),
                category,
                description: description || null,
                likelihood,
                impact,
                status,
                owner_id: ownerId || null,
                due_date: dueDate || null,
                recommendation: recommendation || null,
                source: "manual",
            })
            .select("*, profiles(id, full_name, avatar_url)")
            .single();

        setSaving(false);
        if (error || !data) {
            toast.error(error?.message ?? "Failed to add risk");
            return;
        }
        toast.success("Risk added to register");
        onCreated(data as RiskRow);
        onClose();
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-2xl bg-card border border-border/60 rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-blue-400" />
                            </div>
                            <h2 className="text-base font-bold text-foreground">Add Manual Risk</h2>
                        </div>
                        <Button variant="plain" size="icon-sm" onClick={onClose} className="text-muted-foreground">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk Title *</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    placeholder="Describe the risk concisely…"
                                    className="mt-1.5 w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="mt-1.5 w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                >
                                    {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value as RiskStatus)}
                                    className="mt-1.5 w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                >
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Likelihood: <span className="text-foreground">{likelihood}</span> / 5
                                </label>
                                <input type="range" min={1} max={5} step={1}
                                    value={likelihood}
                                    onChange={e => setLikelihood(Number(e.target.value))}
                                    className="mt-2 w-full accent-blue-500" />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Impact: <span className="text-foreground">{impact}</span> / 5
                                </label>
                                <input type="range" min={1} max={5} step={1}
                                    value={impact}
                                    onChange={e => setImpact(Number(e.target.value))}
                                    className="mt-2 w-full accent-blue-500" />
                            </div>
                        </div>

                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${sev.bg} ${sev.border}`}>
                            <AlertTriangle className={`w-4 h-4 ${sev.color}`} />
                            <span className={`text-sm font-bold ${sev.color}`}>Risk Score: {score} — {sev.label}</span>
                            <span className="text-xs text-muted-foreground ml-auto">({likelihood} × {impact})</span>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={2}
                                placeholder="What is the risk and its potential impact?"
                                className="mt-1.5 w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recommendation</label>
                            <textarea
                                value={recommendation}
                                onChange={e => setRecommendation(e.target.value)}
                                rows={2}
                                placeholder="How will this risk be mitigated or controlled?"
                                className="mt-1.5 w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Owner</label>
                                <select
                                    value={ownerId}
                                    onChange={e => setOwnerId(e.target.value)}
                                    className="mt-1.5 w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                >
                                    <option value="">Unassigned</option>
                                    {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    className="mt-1.5 w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={onClose}
                                className="flex-1 h-auto px-4 py-2.5 rounded-xl text-sm text-muted-foreground">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}
                                className="flex-1 h-auto gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm disabled:opacity-70">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Add to Register
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
