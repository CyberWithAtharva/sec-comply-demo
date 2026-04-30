"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { severityFromScore } from "@/lib/risk-styles";
import type { LibraryRisk } from "@/lib/risk-library";
import type { Json } from "@/types/database";
import type { RiskRow, StatusHistoryRow } from "./types";

interface Props {
    libraryRisk: LibraryRisk;
    orgId: string;
    onClose: () => void;
    onAdded: (risk: RiskRow, history?: StatusHistoryRow) => void;
}

export function AddToRegisterModal({ libraryRisk, orgId, onClose, onAdded }: Props) {
    const [likelihood, setLikelihood] = useState<number>(libraryRisk.defaultLikelihood);
    const [impact, setImpact] = useState<number>(libraryRisk.defaultImpact);
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);

    const score = likelihood * impact;
    const sev = severityFromScore(score);
    const adjusted = likelihood !== libraryRisk.defaultLikelihood || impact !== libraryRisk.defaultImpact;

    async function handleConfirm() {
        setSaving(true);
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from("risks")
            .insert({
                org_id: orgId,
                title: libraryRisk.title,
                category: libraryRisk.category,
                description: libraryRisk.description,
                likelihood,
                impact,
                status: "open",
                source: "manual",
                display_id: libraryRisk.id,
                library_risk_id: libraryRisk.id,
                framework_mappings: libraryRisk.frameworkMappings as unknown as Json,
                recommendation: libraryRisk.recommendation,
                notes: note || null,
            })
            .select("*, profiles(id, full_name, avatar_url)")
            .single();

        if (error || !data) {
            toast.error(error?.message ?? "Failed to add risk");
            setSaving(false);
            return;
        }

        // Initial history row — "added to register"
        let historyRow: StatusHistoryRow | undefined;
        const { data: histData } = await supabase
            .from("risk_status_history")
            .insert({
                risk_id: data.id,
                field: "status",
                from_value: null,
                to_value: "open",
                changed_by: user?.id ?? null,
                note: adjusted
                    ? `Added from library (${libraryRisk.id}). Scores adjusted from default ${libraryRisk.defaultLikelihood}×${libraryRisk.defaultImpact} to ${likelihood}×${impact}.${note ? " — " + note : ""}`
                    : `Added from library (${libraryRisk.id}).${note ? " — " + note : ""}`,
            })
            .select("*, profiles:changed_by(id, full_name)")
            .single();
        if (histData) historyRow = histData as StatusHistoryRow;

        toast.success("Risk added to register");
        onAdded(data as RiskRow, historyRow);
        onClose();
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-6 z-10"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                <Plus className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-100">Add to Register</h2>
                                <p className="text-[11px] font-mono text-slate-500">{libraryRisk.id}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <p className="text-sm font-medium text-slate-200 mb-1">{libraryRisk.title}</p>
                    <p className="text-xs text-slate-500 mb-5">{libraryRisk.category}</p>

                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 mb-4">
                        <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">
                            Adjust scores for your context
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] text-slate-400">
                                    Likelihood: <span className="text-slate-200">{likelihood}</span> / 5
                                </label>
                                <input type="range" min={1} max={5} step={1}
                                    value={likelihood}
                                    onChange={e => setLikelihood(Number(e.target.value))}
                                    className="mt-1.5 w-full accent-blue-500" />
                                <p className="text-[10px] text-slate-600 mt-0.5">default {libraryRisk.defaultLikelihood}</p>
                            </div>
                            <div>
                                <label className="text-[11px] text-slate-400">
                                    Impact: <span className="text-slate-200">{impact}</span> / 5
                                </label>
                                <input type="range" min={1} max={5} step={1}
                                    value={impact}
                                    onChange={e => setImpact(Number(e.target.value))}
                                    className="mt-1.5 w-full accent-blue-500" />
                                <p className="text-[10px] text-slate-600 mt-0.5">default {libraryRisk.defaultImpact}</p>
                            </div>
                        </div>

                        <div className={`mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl border ${sev.bg} ${sev.border}`}>
                            <AlertTriangle className={`w-4 h-4 ${sev.color}`} />
                            <span className={`text-sm font-bold ${sev.color}`}>
                                Risk Score: {score} — {sev.label}
                            </span>
                            {adjusted && (
                                <span className="ml-auto text-[10px] text-amber-400 uppercase tracking-wider">adjusted</span>
                            )}
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="text-[11px] text-slate-400 uppercase tracking-wider">Note (optional)</label>
                        <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            rows={2}
                            placeholder="Reason for the score adjustment, or context for your team."
                            className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-sm text-slate-400 hover:bg-slate-800 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleConfirm} disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-70">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Confirm &amp; Add
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
