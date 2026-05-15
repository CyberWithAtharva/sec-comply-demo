"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  AlertTriangle,
  History as HistoryIcon,
  Tag,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  severityFromScore,
  STATUS_LABELS,
  STATUS_OPTIONS,
  STATUS_STYLES,
  TREATMENT_OPTIONS,
  TREATMENT_LABELS,
  TREATMENT_DESCRIPTIONS,
  type RiskStatus,
  type Treatment,
} from "@/lib/risk-styles";
import { FRAMEWORK_LABELS, FRAMEWORK_BADGE_COLORS } from "@/lib/risk-library";
import { readFrameworkMappings } from "./types";
import type { OwnerOption, RiskRow, StatusHistoryRow } from "./types";

interface Props {
  risk: RiskRow;
  history: StatusHistoryRow[];
  owners: OwnerOption[];
  onClose: () => void;
  onUpsert: (risk: RiskRow) => void;
  onRemove: (id: string) => void;
  onHistoryAppend: (rows: StatusHistoryRow[]) => void;
}

interface DraftState {
  likelihood: number;
  impact: number;
  residual_likelihood: number | null;
  residual_impact: number | null;
  status: RiskStatus;
  treatment: Treatment | null;
  owner_id: string | null;
  due_date: string | null;
  notes: string;
  recommendation: string;
}

function fromRisk(r: RiskRow): DraftState {
  return {
    likelihood: r.likelihood,
    impact: r.impact,
    residual_likelihood: r.residual_likelihood ?? null,
    residual_impact: r.residual_impact ?? null,
    status: (r.status as RiskStatus) ?? "open",
    treatment: (r.treatment as Treatment | null) ?? null,
    owner_id: r.owner_id ?? null,
    due_date: r.due_date ?? null,
    notes: r.notes ?? "",
    recommendation: r.recommendation ?? r.mitigation ?? "",
  };
}

export function RegisterRiskDetailPanel({
  risk,
  history,
  owners,
  onClose,
  onUpsert,
  onRemove,
  onHistoryAppend,
}: Props) {
  const [draft, setDraft] = useState<DraftState>(() => fromRisk(risk));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset when the active risk changes.
  useEffect(() => {
    setDraft(fromRisk(risk));
  }, [risk.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const score = draft.likelihood * draft.impact;
  const sev = severityFromScore(score);
  const residualScore =
    draft.residual_likelihood && draft.residual_impact
      ? draft.residual_likelihood * draft.residual_impact
      : null;
  const residualSev = residualScore ? severityFromScore(residualScore) : null;

  const frameworkMappings = useMemo(
    () => readFrameworkMappings(risk.framework_mappings),
    [risk.framework_mappings],
  );
  const riskHistory = useMemo(
    () => history.filter((h) => h.risk_id === risk.id).slice(0, 30),
    [history, risk.id],
  );

  const dirty: { field: string; from_value: unknown; to_value: unknown }[] = [];
  if (draft.likelihood !== risk.likelihood)
    dirty.push({
      field: "likelihood",
      from_value: risk.likelihood,
      to_value: draft.likelihood,
    });
  if (draft.impact !== risk.impact)
    dirty.push({
      field: "impact",
      from_value: risk.impact,
      to_value: draft.impact,
    });
  if (draft.residual_likelihood !== (risk.residual_likelihood ?? null))
    dirty.push({
      field: "residual_likelihood",
      from_value: risk.residual_likelihood,
      to_value: draft.residual_likelihood,
    });
  if (draft.residual_impact !== (risk.residual_impact ?? null))
    dirty.push({
      field: "residual_impact",
      from_value: risk.residual_impact,
      to_value: draft.residual_impact,
    });
  if (draft.status !== risk.status)
    dirty.push({
      field: "status",
      from_value: risk.status,
      to_value: draft.status,
    });
  if (draft.treatment !== ((risk.treatment as Treatment | null) ?? null))
    dirty.push({
      field: "treatment",
      from_value: risk.treatment,
      to_value: draft.treatment,
    });
  if (draft.owner_id !== (risk.owner_id ?? null))
    dirty.push({
      field: "owner_id",
      from_value: risk.owner_id,
      to_value: draft.owner_id,
    });
  if (draft.due_date !== (risk.due_date ?? null))
    dirty.push({
      field: "due_date",
      from_value: risk.due_date,
      to_value: draft.due_date,
    });
  if ((draft.notes || null) !== (risk.notes ?? null))
    dirty.push({
      field: "notes",
      from_value: risk.notes,
      to_value: draft.notes,
    });
  if ((draft.recommendation || null) !== (risk.recommendation ?? null))
    dirty.push({
      field: "recommendation",
      from_value: risk.recommendation,
      to_value: draft.recommendation,
    });

  async function handleSave() {
    if (dirty.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/risks/${risk.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changes: dirty,
          note: draft.notes || null,
          patch: {
            likelihood: draft.likelihood,
            impact: draft.impact,
            residual_likelihood: draft.residual_likelihood,
            residual_impact: draft.residual_impact,
            status: draft.status,
            treatment: draft.treatment,
            owner_id: draft.owner_id,
            due_date: draft.due_date,
            notes: draft.notes || null,
            recommendation: draft.recommendation || null,
          },
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error ?? "Failed to save");
        return;
      }
      const json = (await res.json()) as {
        risk: RiskRow;
        history: StatusHistoryRow[];
      };
      onUpsert(json.risk);
      onHistoryAppend(json.history);
      toast.success("Risk updated");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this risk from the register? This cannot be undone."))
      return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("risks").delete().eq("id", risk.id);
    if (error) {
      toast.error(error.message);
      setDeleting(false);
      return;
    }
    toast.success("Risk removed");
    onRemove(risk.id);
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.25 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[640px] bg-background border-l border-border overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sev.dot}`} />
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {risk.display_id ?? risk.id.slice(0, 8)} · {risk.category}
              </p>
              <h2 className="text-base font-semibold text-foreground truncate">
                {risk.title}
              </h2>
            </div>
          </div>
          <Button
            variant="plain"
            size="icon-sm"
            onClick={onClose}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          {risk.description && (
            <section>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Description
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {risk.description}
              </p>
            </section>
          )}

          {/* Recommendation */}
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Recommendation
            </h3>
            <textarea
              value={draft.recommendation}
              onChange={(e) =>
                setDraft((d) => ({ ...d, recommendation: e.target.value }))
              }
              rows={6}
              placeholder="Specific, actionable mitigation steps for this risk."
              className="w-full bg-card/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
            />
          </section>

          {/* Risk scoring */}
          <section className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
              Risk Scoring
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <ScoreSlider
                label="Likelihood"
                value={draft.likelihood}
                onChange={(v) => setDraft((d) => ({ ...d, likelihood: v }))}
              />
              <ScoreSlider
                label="Impact"
                value={draft.impact}
                onChange={(v) => setDraft((d) => ({ ...d, impact: v }))}
              />
            </div>
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${sev.bg} ${sev.border}`}
            >
              <AlertTriangle className={`w-4 h-4 ${sev.color}`} />
              <span className={`text-sm font-bold ${sev.color}`}>
                Inherent Score: {score} — {sev.label}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                ({draft.likelihood} × {draft.impact})
              </span>
            </div>

            {/* Residual scoring — shown when treatment is mitigate or status is past Open */}
            {(draft.treatment === "mitigate" ||
              draft.status === "mitigated") && (
              <>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-2">
                  Residual scoring (post-treatment)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <ScoreSlider
                    label="Residual Likelihood"
                    value={draft.residual_likelihood ?? draft.likelihood}
                    nullable
                    active={draft.residual_likelihood !== null}
                    onChange={(v) =>
                      setDraft((d) => ({ ...d, residual_likelihood: v }))
                    }
                    onClear={() =>
                      setDraft((d) => ({ ...d, residual_likelihood: null }))
                    }
                  />
                  <ScoreSlider
                    label="Residual Impact"
                    value={draft.residual_impact ?? draft.impact}
                    nullable
                    active={draft.residual_impact !== null}
                    onChange={(v) =>
                      setDraft((d) => ({ ...d, residual_impact: v }))
                    }
                    onClear={() =>
                      setDraft((d) => ({ ...d, residual_impact: null }))
                    }
                  />
                </div>
                {residualSev && (
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${residualSev.bg} ${residualSev.border}`}
                  >
                    <AlertTriangle className={`w-4 h-4 ${residualSev.color}`} />
                    <span className={`text-sm font-bold ${residualSev.color}`}>
                      Residual Score: {residualScore} — {residualSev.label}
                    </span>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Treatment & Status */}
          <section className="grid grid-cols-2 gap-4">
            <Field label="Treatment">
              <select
                value={draft.treatment ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    treatment: e.target.value
                      ? (e.target.value as Treatment)
                      : null,
                  }))
                }
                className="w-full bg-card/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="">— Not set —</option>
                {TREATMENT_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {TREATMENT_LABELS[t]}
                  </option>
                ))}
              </select>
              {draft.treatment && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  {TREATMENT_DESCRIPTIONS[draft.treatment]}
                </p>
              )}
            </Field>

            <Field label="Status">
              <select
                value={draft.status}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    status: e.target.value as RiskStatus,
                  }))
                }
                className="w-full bg-card/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <span
                className={`mt-1.5 inline-flex px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${STATUS_STYLES[draft.status]}`}
              >
                {STATUS_LABELS[draft.status]}
              </span>
            </Field>

            <Field label="Risk Owner">
              <select
                value={draft.owner_id ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, owner_id: e.target.value || null }))
                }
                className="w-full bg-card/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="">Unassigned</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Due Date">
              <input
                type="date"
                value={draft.due_date ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, due_date: e.target.value || null }))
                }
                className="w-full bg-card/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </Field>
          </section>

          {/* Notes */}
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Notes / Justification
            </h3>
            <textarea
              value={draft.notes}
              onChange={(e) =>
                setDraft((d) => ({ ...d, notes: e.target.value }))
              }
              rows={3}
              placeholder="Treatment justification, acceptance rationale, or closing context."
              className="w-full bg-card/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
            />
          </section>

          {/* Framework mappings */}
          {frameworkMappings.length > 0 && (
            <section>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <Tag className="w-3 h-3" /> Framework Controls
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {frameworkMappings.map((m, idx) => (
                  <div
                    key={`${m.framework}-${m.clause}-${idx}`}
                    className={`px-3 py-2 rounded-lg border text-xs ${FRAMEWORK_BADGE_COLORS[m.framework]}`}
                  >
                    <p className="font-mono font-bold">
                      {FRAMEWORK_LABELS[m.framework]} · {m.clause}
                    </p>
                    <p className="text-muted-foreground mt-0.5">{m.name}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Status history */}
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <HistoryIcon className="w-3 h-3" /> Status History
            </h3>
            {riskHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground/70">No changes recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {riskHistory.map((h) => (
                  <li
                    key={h.id}
                    className="text-xs border-l-2 border-border pl-3 py-1"
                  >
                    <span className="font-mono text-muted-foreground">{h.field}</span>
                    <span className="text-muted-foreground/70 mx-1">·</span>
                    <span className="text-muted-foreground">
                      {h.from_value ?? "—"}
                    </span>
                    <span className="text-muted-foreground/70 mx-1">→</span>
                    <span className="text-foreground">{h.to_value ?? "—"}</span>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                      {h.profiles?.full_name ?? "System"} ·{" "}
                      {new Date(h.changed_at).toLocaleString()}
                      {h.note ? ` · ${h.note}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="plain"
              onClick={handleDelete}
              disabled={deleting}
              className="h-auto gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Delete
            </Button>
            <div className="flex items-center gap-3">
              {dirty.length > 0 && (
                <span className="text-[11px] text-amber-400">
                  {dirty.length} unsaved change{dirty.length === 1 ? "" : "s"}
                </span>
              )}
              <Button
                onClick={handleSave}
                disabled={dirty.length === 0 || saving}
                className="h-auto gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-secondary disabled:text-muted-foreground/70 text-white text-sm font-semibold rounded-xl"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function ScoreSlider({
  label,
  value,
  onChange,
  nullable,
  active = true,
  onClear,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  nullable?: boolean;
  active?: boolean;
  onClear?: () => void;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
        <span>
          {label}:{" "}
          <span className="text-foreground">{active ? value : "—"}</span> / 5
        </span>
        {nullable && active && onClear && (
          <Button
            variant="link"
            onClick={onClear}
            className="h-auto p-0 text-[10px] text-muted-foreground hover:text-muted-foreground underline"
          >
            clear
          </Button>
        )}
        {nullable && !active && (
          <Button
            variant="link"
            onClick={() => onChange(value)}
            className="h-auto p-0 text-[10px] text-blue-400 hover:text-blue-300 underline"
          >
            set
          </Button>
        )}
      </label>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        disabled={!active}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-blue-500 disabled:opacity-40"
      />
    </div>
  );
}
