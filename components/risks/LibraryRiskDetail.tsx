"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Tag, CheckCircle2, AlertTriangle } from "lucide-react";
import { severityFromScore } from "@/lib/risk-styles";
import { FRAMEWORK_BADGE_COLORS, FRAMEWORK_LABELS, type LibraryRisk } from "@/lib/risk-library";

interface Props {
    libraryRisk: LibraryRisk;
    alreadyInRegister: boolean;
    onClose: () => void;
    onAddToRegister: () => void;
}

export function LibraryRiskDetail({ libraryRisk, alreadyInRegister, onClose, onAddToRegister }: Props) {
    const score = libraryRisk.defaultLikelihood * libraryRisk.defaultImpact;
    const sev = severityFromScore(score);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.aside
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[560px] bg-slate-950 border-l border-slate-800 overflow-y-auto"
            >
                <div className="sticky top-0 bg-slate-950/95 backdrop-blur z-10 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                    <div className="min-w-0">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                            {libraryRisk.id} · {libraryRisk.category}
                        </p>
                        <h2 className="text-base font-semibold text-slate-100 truncate">{libraryRisk.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Default scores */}
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${sev.bg} ${sev.border}`}>
                        <AlertTriangle className={`w-4 h-4 ${sev.color}`} />
                        <span className={`text-sm font-bold ${sev.color}`}>
                            Default Score: {score} — {sev.label}
                        </span>
                        <span className="text-xs text-slate-500 ml-auto">
                            L {libraryRisk.defaultLikelihood} × I {libraryRisk.defaultImpact}
                        </span>
                    </div>

                    {/* Description */}
                    <section>
                        <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Risk Description</h3>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{libraryRisk.description}</p>
                    </section>

                    {/* Recommendation */}
                    <section>
                        <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Recommendation</h3>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{libraryRisk.recommendation}</p>
                    </section>

                    {/* Framework mappings */}
                    <section>
                        <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                            <Tag className="w-3 h-3" /> Framework Mapping
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {libraryRisk.frameworkMappings.map((m, idx) => (
                                <div key={`${m.framework}-${m.clause}-${idx}`} className={`px-3 py-2 rounded-lg border text-xs ${FRAMEWORK_BADGE_COLORS[m.framework]}`}>
                                    <p className="font-mono font-bold">
                                        {FRAMEWORK_LABELS[m.framework]} · {m.clause}
                                    </p>
                                    <p className="text-slate-400 mt-0.5">{m.name}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Action */}
                    <div className="pt-3 border-t border-slate-800">
                        {alreadyInRegister ? (
                            <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold">
                                <CheckCircle2 className="w-4 h-4" />
                                Already in your register
                            </div>
                        ) : (
                            <button
                                onClick={onAddToRegister}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add to Register
                            </button>
                        )}
                    </div>
                </div>
            </motion.aside>
        </AnimatePresence>
    );
}
