"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";

interface MatrixRisk {
    id: string;
    likelihood: number;     // 1..5
    impact: number;         // 1..5
    title?: string;
}

interface Props<T extends MatrixRisk> {
    risks: T[];
    /** Optional callback when a populated cell is clicked. */
    onCellClick?: (cell: { likelihood: number; impact: number; risks: T[] }) => void;
    /** Pixel height of the matrix canvas. Default: 300. */
    height?: number;
    /** When true, hide the corner zone labels (LOW RISK / CRITICAL). */
    hideCornerLabels?: boolean;
    /** When true, render bubbles at residual position too (small ring). */
    residualKey?: keyof T & ("residual_likelihood" | "residual_impact" | string);
}

/**
 * Reusable 5×5 risk matrix.
 *  - Y-axis = Likelihood (5 at top, 1 at bottom)
 *  - X-axis = Impact (1 left, 5 right)
 *  - Bubbles are sized by count of risks in the cell, coloured by score.
 *
 * Used in the Overview tab and (optionally) inside the Register tab detail panel.
 */
export function RiskMatrix<T extends MatrixRisk>({
    risks,
    onCellClick,
    height = 300,
    hideCornerLabels = false,
}: Props<T>) {
    const grid = useMemo(() => {
        const cells: { l: number; i: number; count: number; risks: T[]; score: number }[] = [];
        for (let l = 5; l >= 1; l--) {
            for (let i = 1; i <= 5; i++) {
                const cell = risks.filter(r => r.likelihood === l && r.impact === i);
                cells.push({ l, i, count: cell.length, risks: cell, score: l * i });
            }
        }
        return cells;
    }, [risks]);

    const isEmpty = risks.length === 0;

    return (
        <div className="flex gap-3 items-start">
            {/* Y-axis ticks */}
            <div className="flex flex-col items-center gap-0 pt-1 pb-7 self-stretch justify-between">
                <div
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                    className="text-[9px] text-muted-foreground/70 uppercase tracking-widest select-none mb-2"
                >
                    Likelihood
                </div>
                {[5, 4, 3, 2, 1].map(n => (
                    <span key={n} className="text-[11px] font-mono text-muted-foreground">{n}</span>
                ))}
            </div>

            <div className="flex-1 flex flex-col gap-2">
                {/* Matrix canvas */}
                <div
                    className="relative rounded-2xl overflow-hidden border border-border/30"
                    style={{ height }}
                >
                    {/* Diagonal gradient */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(135deg," +
                                " rgba(16,185,129,0.06) 0%," +
                                " rgba(16,185,129,0.10) 18%," +
                                " rgba(245,158,11,0.10) 38%," +
                                " rgba(249,115,22,0.13) 62%," +
                                " rgba(239,68,68,0.18) 100%)",
                        }}
                    />

                    {/* Grid lines */}
                    <div className="absolute inset-0 grid grid-cols-5 grid-rows-5">
                        {Array.from({ length: 25 }).map((_, idx) => (
                            <div key={idx} className="border border-border/15" />
                        ))}
                    </div>

                    {/* Corner labels */}
                    {!hideCornerLabels && (
                        <>
                            <div className="absolute bottom-2 left-3 text-[9px] font-mono uppercase tracking-widest text-emerald-600/30 select-none">
                                LOW RISK
                            </div>
                            <div className="absolute top-2 right-3 text-[9px] font-mono uppercase tracking-widest text-red-500/30 select-none">
                                CRITICAL
                            </div>
                        </>
                    )}

                    {/* Bubbles */}
                    {grid
                        .filter(c => c.count > 0)
                        .map(({ l, i, count, score, risks: cellRisks }) => {
                            const CELL = 100 / 5;
                            const cx = (i - 0.5) * CELL;
                            const cy = (5 - l + 0.5) * CELL;
                            const size = Math.max(36, Math.min(60, 30 + count * 5));
                            const [fill, glow] =
                                score >= 20 ? ["#ef4444", "rgba(239,68,68,0.5)"] :
                                score >= 13 ? ["#f97316", "rgba(249,115,22,0.4)"] :
                                score >= 6  ? ["#f59e0b", "rgba(245,158,11,0.35)"] :
                                              ["#22c55e", "rgba(34,197,94,0.3)"];

                            const clickable = !!onCellClick;
                            return (
                                <Button variant="plain"
                                    type="button"
                                    key={`${l}-${i}`}
                                    onClick={
                                        clickable
                                            ? () => onCellClick!({ likelihood: l, impact: i, risks: cellRisks })
                                            : undefined
                                    }
                                    disabled={!clickable}
                                    className={
                                        "absolute flex items-center justify-center rounded-full font-black text-white select-none transition-transform " +
                                        (clickable ? "cursor-pointer hover:scale-110" : "cursor-default")
                                    }
                                    style={{
                                        left: `${cx}%`,
                                        top: `${cy}%`,
                                        width: size,
                                        height: size,
                                        transform: "translate(-50%, -50%)",
                                        background: fill,
                                        boxShadow: `0 0 ${size * 0.6}px ${glow}, 0 0 ${size * 1.2}px ${glow}50`,
                                        fontSize: count > 9 ? 13 : 15,
                                        zIndex: 10,
                                    }}
                                    title={`${count} risk${count > 1 ? "s" : ""} — Likelihood ${l} × Impact ${i} = Score ${score}`}
                                >
                                    {count}
                                </Button>
                            );
                        })}

                    {/* Empty state */}
                    {isEmpty && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-muted-foreground/50 text-sm">No active risks</span>
                        </div>
                    )}
                </div>

                {/* X-axis ticks */}
                <div className="grid grid-cols-5 px-0">
                    {[1, 2, 3, 4, 5].map(n => (
                        <div key={n} className="text-center text-[11px] font-mono text-muted-foreground">{n}</div>
                    ))}
                </div>
                <p className="text-center text-[9px] text-muted-foreground/70 uppercase tracking-widest -mt-1 select-none">
                    Impact →
                </p>
            </div>
        </div>
    );
}
