"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/components/ui/Card";

export interface MonitoringEntry {
  id: string;
  process_id: string;
  payload: Record<string, unknown> | null;
  result: string | null;
  occurred_at: string;
  qms_processes?: { key: string; name: string; clause: string | null } | null;
}

interface MonitoringDashboardProps {
  entries: MonitoringEntry[];
  serverNowMs: number;
}

type Tone = "green" | "amber" | "red";

interface Kpi {
  key: string;
  label: string;
  clause: string;
  display: string;
  target: string;
  rows: MonitoringEntry[];
  tone: Tone;
  caption: string;
  points: string; // sparkline polyline
}

const TONE_HEX: Record<Tone, string> = {
  green: "#34d399",
  amber: "#fbbf24",
  red: "#f87171",
};
const TONE_PILL: Record<Tone, string> = {
  green: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
  amber: "bg-amber-500/10 border-amber-500/25 text-amber-400",
  red: "bg-red-500/10 border-red-500/25 text-red-400",
};
const TONE_LABEL: Record<Tone, string> = {
  green: "On Track",
  amber: "At Risk",
  red: "Action Req'd",
};

function pct(n: number, d: number): number {
  return d > 0 ? (n / d) * 100 : 0;
}
function toneForPercent(value: number, target: number, higherIsBetter: boolean): Tone {
  if (higherIsBetter) {
    if (value >= target) return "green";
    if (value >= target - 10) return "amber";
    return "red";
  }
  if (value <= target) return "green";
  if (value <= target + 5) return "amber";
  return "red";
}

/**
 * Build an 8-week sparkline. `items` carry a timestamp and the numerator/
 * denominator contribution; the series is the cumulative metric per week so the
 * line shows the trend the dashboard is "watching".
 */
function trendPoints(
  items: { t: number; num: number; den: number }[],
  nowMs: number,
  opts: { count?: boolean } = {},
): string {
  const weeks = 8;
  const wk = 7 * 24 * 3600 * 1000;
  const start = nowMs - weeks * wk;
  const vals: number[] = [];
  for (let i = 1; i <= weeks; i++) {
    const cutoff = start + i * wk;
    let n = 0;
    let d = 0;
    for (const it of items) {
      if (it.t <= cutoff) {
        n += it.num;
        d += it.den;
      }
    }
    vals.push(opts.count ? n : pct(n, d));
  }
  const max = opts.count ? Math.max(1, ...vals) : 100;
  return vals
    .map((v, i) => {
      const x = (i / (weeks - 1)) * 200;
      const y = 44 - (Math.min(v, max) / max) * 40;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function MonitoringDashboard({ entries, serverNowMs }: MonitoringDashboardProps) {
  const [activeKpi, setActiveKpi] = useState<Kpi | null>(null);

  const kpis = useMemo<Kpi[]>(() => {
    const byKey = (k: string) => entries.filter((e) => e.qms_processes?.key === k);
    const t = (e: MonitoringEntry) => new Date(e.occurred_at).getTime();

    const inspections = byKey("incoming_inspection");
    const calibrations = byKey("calibration");
    const ncrs = byKey("ncr_capa");
    const dispatches = byKey("dispatch");
    const complaints = byKey("customer_complaints");

    const list: Kpi[] = [];

    // Reject rate — lower is better, target ≤ 3%.
    {
      const rejects = inspections.filter((e) => e.result === "reject");
      const value = pct(rejects.length, inspections.length);
      const tone = inspections.length ? toneForPercent(value, 3, false) : "amber";
      list.push({
        key: "reject_rate",
        label: "Reject Rate",
        clause: "8.4 / 8.6",
        display: inspections.length ? `${value.toFixed(1)}%` : "—",
        target: "Target ≤ 3%",
        rows: rejects,
        tone,
        caption: `${rejects.length} rejects ÷ ${inspections.length} inspections`,
        points: trendPoints(
          inspections.map((e) => ({ t: t(e), num: e.result === "reject" ? 1 : 0, den: 1 })),
          serverNowMs,
        ),
      });
    }

    // First-pass yield — higher is better, target ≥ 95%.
    {
      const firstPass = inspections.filter(
        (e) => e.result === "pass" && !truthy(e.payload?.rework),
      );
      const value = pct(firstPass.length, inspections.length);
      const tone = inspections.length ? toneForPercent(value, 95, true) : "amber";
      list.push({
        key: "first_pass_yield",
        label: "First-Pass Yield",
        clause: "8.5.1",
        display: inspections.length ? `${value.toFixed(1)}%` : "—",
        target: "Target ≥ 95%",
        rows: firstPass,
        tone,
        caption: `${firstPass.length} first-pass ÷ ${inspections.length} inspections`,
        points: trendPoints(
          inspections.map((e) => ({
            t: t(e),
            num: e.result === "pass" && !truthy(e.payload?.rework) ? 1 : 0,
            den: 1,
          })),
          serverNowMs,
        ),
      });
    }

    // On-time delivery — higher is better, target ≥ 95%.
    {
      const onTime = dispatches.filter((e) =>
        dateLte(e.payload?.actual_date, e.payload?.promised_date),
      );
      const value = pct(onTime.length, dispatches.length);
      const tone = dispatches.length ? toneForPercent(value, 95, true) : "amber";
      list.push({
        key: "on_time_delivery",
        label: "On-Time Delivery",
        clause: "8.5.4",
        display: dispatches.length ? `${value.toFixed(1)}%` : "—",
        target: "Target ≥ 95%",
        rows: onTime,
        tone,
        caption: dispatches.length
          ? `${onTime.length} on-time ÷ ${dispatches.length} dispatches`
          : "no dispatch logs yet",
        points: trendPoints(
          dispatches.map((e) => ({
            t: t(e),
            num: dateLte(e.payload?.actual_date, e.payload?.promised_date) ? 1 : 0,
            den: 1,
          })),
          serverNowMs,
        ),
      });
    }

    // Calibration compliance — higher is better, target ≥ 95%.
    {
      const onTime = calibrations.filter((e) =>
        dateLte(e.payload?.calibrated_date, e.payload?.due_date),
      );
      const value = pct(onTime.length, calibrations.length);
      const tone = calibrations.length ? toneForPercent(value, 95, true) : "amber";
      list.push({
        key: "calibration_compliance",
        label: "Calibration Compliance",
        clause: "7.1.5",
        display: calibrations.length ? `${value.toFixed(1)}%` : "—",
        target: "Target ≥ 95%",
        rows: onTime,
        tone,
        caption: `${onTime.length} on-time ÷ ${calibrations.length} instruments`,
        points: trendPoints(
          calibrations.map((e) => ({
            t: t(e),
            num: dateLte(e.payload?.calibrated_date, e.payload?.due_date) ? 1 : 0,
            den: 1,
          })),
          serverNowMs,
        ),
      });
    }

    // Open NCRs — count, lower is better; overdue flips it red.
    {
      const open = ncrs.filter((e) => (e.result ?? e.payload?.status) === "open");
      const overdue = open.filter((e) => dateLt(e.payload?.target_close_date, serverNowMs));
      list.push({
        key: "open_ncrs",
        label: "Open NCRs",
        clause: "8.7 / 10.2",
        display: String(open.length),
        target: "Target 0 overdue",
        rows: open,
        tone: open.length === 0 ? "green" : overdue.length > 0 ? "red" : "amber",
        caption: overdue.length ? `${overdue.length} overdue` : `${open.length} open · none overdue`,
        points: trendPoints(
          ncrs.map((e) => ({
            t: t(e),
            num: (e.result ?? e.payload?.status) === "open" ? 1 : 0,
            den: 0,
          })),
          serverNowMs,
          { count: true },
        ),
      });
    }

    // Customer complaints — count of open complaints, lower is better.
    {
      const open = complaints.filter((e) => (e.result ?? e.payload?.status) === "open");
      list.push({
        key: "customer_complaints",
        label: "Customer Complaints",
        clause: "9.1.2",
        display: complaints.length ? String(open.length) : "—",
        target: "Target 0 open",
        rows: open,
        tone: complaints.length === 0 ? "amber" : open.length === 0 ? "green" : open.length > 2 ? "red" : "amber",
        caption: complaints.length
          ? `${open.length} open ÷ ${complaints.length} logged`
          : "no complaint logs yet",
        points: trendPoints(
          complaints.map((e) => ({
            t: t(e),
            num: (e.result ?? e.payload?.status) === "open" ? 1 : 0,
            den: 0,
          })),
          serverNowMs,
          { count: true },
        ),
      });
    }

    return list;
  }, [entries, serverNowMs]);

  const rejectKpi = kpis.find((k) => k.key === "reject_rate");
  const calKpi = kpis.find((k) => k.key === "calibration_compliance");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[28px] font-bold tracking-tight text-foreground leading-none">
              Monitoring
            </h1>
            <span className="text-[10px] font-semibold tracking-wider px-2 py-1 rounded-full bg-primary/15 text-orange-300">
              NEW MODULE
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5">
            Clause 9.1 · KPIs derived from Workflow logs — events are stored,
            percentages are computed on demand.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
          Updating live
        </div>
      </div>

      {entries.length === 0 && (
        <div className="glass-panel rounded-xl px-5 py-4 text-sm text-amber-300">
          No workflow records yet — KPIs populate as process owners log entries.
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <button
            key={k.key}
            type="button"
            onClick={() => k.rows.length && setActiveKpi(k)}
            className={cn(
              "text-left glass-panel rounded-2xl p-[18px] transition-colors",
              k.rows.length ? "hover:border-primary/40 cursor-pointer" : "cursor-default",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {k.label}
              </div>
              <span
                className={cn(
                  "inline-flex items-center px-2 py-[3px] rounded-full text-[9px] font-semibold uppercase tracking-wide border",
                  TONE_PILL[k.tone],
                )}
              >
                {TONE_LABEL[k.tone]}
              </span>
            </div>
            <div className="flex items-baseline gap-2.5 mt-3">
              <div className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
                {k.display}
              </div>
              <div className="text-xs font-mono text-muted-foreground">{k.target}</div>
            </div>
            <svg
              width="100%"
              height="46"
              viewBox="0 0 200 46"
              preserveAspectRatio="none"
              className="mt-3 block"
            >
              <polyline
                points={k.points}
                fill="none"
                stroke={TONE_HEX[k.tone]}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-2.5 pt-2.5 border-t border-border text-[11px] font-mono text-muted-foreground">
              = {k.caption}
            </div>
          </button>
        ))}
      </div>

      {/* Lower split: explainer + objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.25fr] gap-4">
        {/* drills-to-rows explainer */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
          <div className="text-base font-semibold text-foreground">
            Every KPI drills to its log rows
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            You never store the percentage. Each event is one log row; the KPI is
            recomputed by filtering one field — which is what makes it defensible
            at audit.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <ExplainerRow
              value={rejectKpi?.display ?? "—"}
              color="#34d399"
              text={`reject rate = `}
              mono={rejectKpi?.caption ?? ""}
            />
            <ExplainerRow
              value={calKpi?.display ?? "—"}
              color="#fbbf24"
              text={`calibration = `}
              mono={calKpi?.caption ?? ""}
            />
            <ExplainerRow
              value="drill"
              color="#60a5fa"
              text="click any KPI → the exact Workflow rows behind it"
              mono=""
            />
          </div>
        </div>

        {/* objectives 6.2 (derived from the KPIs) */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="px-5 pt-[18px] pb-3">
            <div className="text-base font-semibold text-foreground">Quality objectives</div>
            <div className="text-xs text-muted-foreground mt-1">
              Clause 6.2 · targets feed Management Review
            </div>
          </div>
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-5 py-2.5 border-b border-border">
                  Objective
                </th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-2.5 border-b border-border">
                  Target
                </th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-2.5 border-b border-border">
                  Current
                </th>
                <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-5 py-2.5 border-b border-border">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {kpis.map((k) => (
                <tr key={k.key}>
                  <td className="px-5 py-3 border-b border-border text-[13px] text-foreground">
                    {k.label}
                  </td>
                  <td className="px-3 py-3 border-b border-border text-xs font-mono text-muted-foreground">
                    {k.target.replace(/^Target\s*/i, "")}
                  </td>
                  <td className="px-3 py-3 border-b border-border text-[13px] font-mono font-semibold text-foreground">
                    {k.display}
                  </td>
                  <td className="px-5 py-3 border-b border-border text-right">
                    <span
                      className={cn(
                        "inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border",
                        TONE_PILL[k.tone],
                      )}
                    >
                      {TONE_LABEL[k.tone]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <KpiDrilldown kpi={activeKpi} onClose={() => setActiveKpi(null)} />
    </div>
  );
}

function ExplainerRow({
  value,
  color,
  text,
  mono,
}: {
  value: string;
  color: string;
  text: string;
  mono: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] bg-card/70 border border-border">
      <div className="font-mono font-bold text-lg w-[54px] flex-none" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-foreground/80">
        {text}
        {mono && <span className="font-mono text-muted-foreground">{mono}</span>}
      </div>
    </div>
  );
}

function KpiDrilldown({ kpi, onClose }: { kpi: Kpi | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {kpi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#020617]/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
          >
            <div className="px-6 pt-6 pb-4 border-b border-border flex items-start justify-between gap-4 sticky top-0 bg-card">
              <div>
                <h2 className="text-lg font-bold text-foreground">{kpi.label}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.caption} · {kpi.rows.length} contributing records
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground border border-border hover:bg-secondary/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-border">
              {kpi.rows.map((r) => (
                <div key={r.id} className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">
                      {r.qms_processes?.name ?? "Record"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(r.occurred_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 break-words">
                    {summarize(r.payload)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ----- helpers -----
function truthy(v: unknown): boolean {
  return v === true || v === "true" || v === 1 || v === "1";
}
function toMs(v: unknown): number | null {
  if (typeof v !== "string" || !v) return null;
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : t;
}
function dateLte(a: unknown, b: unknown): boolean {
  const am = toMs(a);
  const bm = toMs(b);
  return am !== null && bm !== null && am <= bm;
}
function dateLt(a: unknown, nowMs: number): boolean {
  const am = toMs(a);
  return am !== null && am < nowMs;
}
function summarize(payload: Record<string, unknown> | null): string {
  if (!payload) return "—";
  return (
    Object.entries(payload)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
      .join(" · ") || "—"
  );
}
