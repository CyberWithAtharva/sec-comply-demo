"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Zap, GitBranch, Plus, X } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

// ----- Types mirroring the qms_processes.schema jsonb shape -----
interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "boolean" | "textarea";
  options?: string[];
  required?: boolean;
}
interface ProcessSchema {
  fields?: FieldDef[];
  resultField?: string;
  resultOptions?: string[];
}
export interface ProcessRow {
  id: string;
  key: string;
  name: string;
  description: string | null;
  owner_role: string | null;
  clause: string | null;
  control_id: string | null;
  schema: ProcessSchema | null;
  sort_order: number;
}
export interface LogEntry {
  id: string;
  org_id: string;
  process_id: string;
  payload: Record<string, unknown> | null;
  result: string | null;
  occurred_at: string;
  qms_processes?: { id: string; key: string; name: string; clause: string | null } | null;
  profiles?: { id: string; full_name: string | null; avatar_url: string | null } | null;
}

interface WorkflowClientProps {
  orgId: string;
  processes: ProcessRow[];
  initialEntries: LogEntry[];
  totalEntries: number;
  autoPct: number;
}

// Highest-evidence-yield processes get a "hot" dot in the register.
const HOT_PROCESSES = new Set(["incoming_inspection", "ncr_capa"]);

function resultDot(result: string | null): string {
  switch (result) {
    case "pass":
    case "closed":
      return "#34d399";
    case "reject":
    case "fail":
    case "open":
      return "#f87171";
    default:
      return "#64748b";
  }
}

function relativeShort(iso: string | null): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / 86400000);
  if (d <= 0) return "today";
  if (d === 1) return "1d";
  if (d < 30) return `${d}d`;
  return `${Math.floor(d / 30)}mo`;
}

export function WorkflowClient({
  processes,
  initialEntries,
  totalEntries,
  autoPct,
}: WorkflowClientProps) {
  const [entries, setEntries] = useState<LogEntry[]>(initialEntries);
  const [selectedId, setSelectedId] = useState<string>(processes[0]?.id ?? "");
  const [logOpen, setLogOpen] = useState(false);

  const entriesByProcess = useMemo(() => {
    const m = new Map<string, LogEntry[]>();
    for (const e of entries) {
      const arr = m.get(e.process_id) ?? [];
      arr.push(e);
      m.set(e.process_id, arr);
    }
    return m;
  }, [entries]);

  const selected = processes.find((p) => p.id === selectedId) ?? processes[0] ?? null;
  const selectedEntries = selected ? entriesByProcess.get(selected.id) ?? [] : [];
  const fields = selected?.schema?.fields ?? [];
  // Columns for the recent-entries table: first up-to-4 non-textarea fields.
  const tableFields = fields.filter((f) => f.type !== "textarea").slice(0, 4);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[28px] font-bold tracking-tight text-foreground leading-none">
              Workflow
            </h1>
            <span className="text-[10px] font-semibold tracking-wider px-2 py-1 rounded-full bg-primary/15 text-orange-300">
              NEW MODULE
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5">
            Process owners log structured records — and each entry auto-writes
            evidence against its mapped requirement.
          </p>
        </div>
        <Button
          type="button"
          disabled={!selected}
          onClick={() => setLogOpen(true)}
          className="h-auto gap-2 px-3.5 py-2 text-xs font-semibold shadow-[0_0_20px_rgba(249,115,22,0.25)]"
        >
          <Plus className="w-[15px] h-[15px]" />
          New log entry
        </Button>
      </div>

      {/* Info banners */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-none">
            <Zap className="w-[18px] h-[18px] text-emerald-400" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-foreground">
              Logging is auto-collection
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              More Workflow use → more evidence flips Manual → Auto. Currently{" "}
              {autoPct}% auto.
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-3 rounded-xl glass-panel px-4 py-3.5">
          <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center flex-none">
            <GitBranch className="w-[18px] h-[18px] text-blue-400" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-foreground">
              {processes.length} processes ·{" "}
              {totalEntries.toLocaleString()} entries
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              The missing process layer (Clause 4.4) + evidence engine in one.
            </div>
          </div>
        </div>
      </div>

      {processes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl">
          <GitBranch className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground font-medium">No processes defined</p>
          <p className="text-muted-foreground text-sm mt-1">
            Ask your admin to seed the QMS process register.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1.35fr] gap-4 items-stretch">
          {/* Left column — process register + legend filler */}
          <div className="flex flex-col gap-4">
          {/* Process register */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-[18px] pt-4 pb-1.5 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
              Process register
            </div>
            <div className="grid grid-cols-[1.6fr_0.9fr_1.1fr_0.7fr_0.8fr] gap-2.5 px-[18px] pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div>Process</div>
              <div>Clause</div>
              <div>Owner</div>
              <div className="text-right">Logs</div>
              <div className="text-right">Last</div>
            </div>
            {processes.map((p) => {
              const list = entriesByProcess.get(p.id) ?? [];
              const active = p.id === selected?.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={cn(
                    "w-full grid grid-cols-[1.6fr_0.9fr_1.1fr_0.7fr_0.8fr] gap-2.5 px-[18px] py-3 items-center text-left border-l-2 transition-colors",
                    active
                      ? "bg-primary/10 border-l-primary"
                      : "border-l-transparent hover:bg-secondary/30",
                  )}
                >
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                    {HOT_PROCESSES.has(p.key) && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-primary flex-none"
                        title="High evidence yield"
                      />
                    )}
                    <span className="truncate">{p.name}</span>
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {p.clause ?? "—"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {p.owner_role ?? "—"}
                  </div>
                  <div className="text-right font-mono text-xs text-foreground">
                    {list.length}
                  </div>
                  <div className="text-right font-mono text-[11px] text-muted-foreground">
                    {relativeShort(list[0]?.occurred_at ?? null)}
                  </div>
                </button>
              );
            })}
          </div>

            {/* Legend / product note — fills the column to match the detail pane */}
            <div className="glass-panel rounded-2xl p-5 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                How it works
              </div>
              <ul className="space-y-3 text-[13px] text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-none" />
                  <span>
                    <span className="text-foreground font-medium">High-yield processes</span>{" "}
                    (marked with the dot) generate the most audit evidence per entry.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-none" />
                  <span>
                    Every entry auto-writes an evidence record against its mapped clause
                    and advances Compliance Readiness.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <GitBranch className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-none" />
                  <span>
                    <span className="text-foreground font-medium">{autoPct}%</span> of your
                    evidence is now auto-collected through logging.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Process detail */}
          {selected && (
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold text-foreground">{selected.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {selected.clause ? `Clause ${selected.clause}` : "—"} · owned by{" "}
                    {selected.owner_role ?? "—"}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 whitespace-nowrap">
                  <Zap className="w-[11px] h-[11px]" />
                  WRITES EVIDENCE
                </span>
              </div>

              {/* Structured schema */}
              <div className="mt-4 rounded-xl border border-dashed border-border bg-card/60 p-3.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                  Structured log entry — not free text
                </div>
                <div className="flex flex-wrap gap-2">
                  {fields.map((f) => (
                    <div
                      key={f.key}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/70 border border-border text-xs text-muted-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-[2px] bg-primary" />
                      {f.label}
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[11px] text-muted-foreground">
                  Maps to{" "}
                  <span className="font-mono text-foreground/80">
                    Clause {selected.clause}
                  </span>
                </div>
              </div>

              {/* Recent entries */}
              <div className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Recent entries
              </div>
              {selectedEntries.length === 0 ? (
                <div className="text-sm text-muted-foreground py-6 text-center">
                  No records yet — use “New log entry”.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-0">
                    <thead>
                      <tr>
                        {tableFields.map((c) => (
                          <th
                            key={c.key}
                            className="text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-2 py-2 border-b border-border"
                          >
                            {c.label}
                          </th>
                        ))}
                        <th className="text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-2 py-2 border-b border-border">
                          When
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEntries.slice(0, 8).map((r) => (
                        <tr key={r.id}>
                          {tableFields.map((c) => (
                            <td
                              key={c.key}
                              className="px-2 py-2.5 border-b border-border text-xs text-foreground"
                            >
                              {formatCell(r.payload?.[c.key])}
                            </td>
                          ))}
                          <td className="px-2 py-2.5 border-b border-border text-right font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                            <span
                              className="inline-block w-[7px] h-[7px] rounded-full mr-1.5 align-middle"
                              style={{ background: resultDot(r.result) }}
                            />
                            {relativeShort(r.occurred_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selected && (
        <LogEntryDialog
          open={logOpen}
          process={selected}
          onClose={() => setLogOpen(false)}
          onLogged={(entry) => setEntries((prev) => [entry, ...prev])}
        />
      )}
    </div>
  );
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "yes" : "no";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

interface LogEntryDialogProps {
  open: boolean;
  process: ProcessRow;
  onClose: () => void;
  onLogged: (entry: LogEntry) => void;
}

function LogEntryDialog({ open, process, onClose, onLogged }: LogEntryDialogProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const fields = process.schema?.fields ?? [];
  const resultField = process.schema?.resultField;

  React.useEffect(() => {
    if (open) setValues({});
  }, [open, process.id]);

  function setField(key: string, value: unknown) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && (values[f.key] === undefined || values[f.key] === "")) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    setSubmitting(true);
    try {
      const result = resultField ? ((values[resultField] as string) ?? null) : null;
      const res = await fetch("/api/workflow/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ process_id: process.id, payload: values, result }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to log");
      onLogged({
        ...data.entry,
        qms_processes: {
          id: process.id,
          key: process.key,
          name: process.name,
          clause: process.clause,
        },
      });
      toast.success("Record logged — evidence generated");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#020617]/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="relative w-[min(620px,94vw)] max-h-[88vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl z-10"
          >
            {/* header */}
            <div className="flex items-start justify-between gap-3 px-[22px] pt-5 pb-3.5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[11px] bg-primary/15 flex items-center justify-center flex-none">
                  <Plus className="w-[19px] h-[19px] text-orange-300" />
                </div>
                <div>
                  <div className="text-[17px] font-bold text-foreground">New log entry</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {process.name} · writes evidence on save
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground border border-border hover:bg-secondary/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-[22px] py-[18px] grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {fields.map((f) => (
                  <FieldInput
                    key={f.key}
                    field={f}
                    value={values[f.key]}
                    onChange={(v) => setField(f.key, v)}
                  />
                ))}
              </div>
              {/* footer */}
              <div className="flex items-center justify-between gap-3 px-[22px] pt-3.5 pb-5 border-t border-border">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Zap className="w-[13px] h-[13px] text-emerald-400" />
                  Saved entries appear instantly &amp; generate evidence
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="h-auto px-4 py-2 text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-auto px-4 py-2 text-sm"
                  >
                    {submitting ? "Logging…" : "Log & generate evidence"}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const baseCls =
    "w-full bg-background/60 border border-border rounded-lg px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
  const label = (
    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {field.label}
      {field.required && <span className="text-red-400"> *</span>}
    </label>
  );

  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-2 cursor-pointer self-end pb-2.5">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-border bg-background/60 accent-orange-500"
        />
        <span className="text-[13px] text-foreground">{field.label}</span>
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseCls}
        >
          <option value="">Select…</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        {label}
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className={baseCls}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label}
      <input
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        placeholder={field.label}
        value={(value as string) ?? ""}
        onChange={(e) =>
          onChange(field.type === "number" ? e.target.valueAsNumber : e.target.value)
        }
        className={baseCls}
      />
    </div>
  );
}
