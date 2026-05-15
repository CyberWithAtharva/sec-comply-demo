"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, LayoutDashboard, BookOpen, Shield } from "lucide-react";
import { OverviewTab } from "./tabs/OverviewTab";
import { LibraryTab } from "./tabs/LibraryTab";
import { RegisterTab } from "./tabs/RegisterTab";
import type { OwnerOption, RiskRow, StatusHistoryRow } from "./types";

interface Props {
    initialRisks: RiskRow[];
    initialHistory: StatusHistoryRow[];
    orgId: string;
    owners: OwnerOption[];
    serverNowMs: number;
}

type Tab = "overview" | "library" | "register";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
    { id: "overview", label: "Overview",      icon: LayoutDashboard, description: "Current risk posture at a glance" },
    { id: "register", label: "Risk Register", icon: Shield,          description: "Active risks tracked from identification to closure" },
    { id: "library",  label: "Risk Library",  icon: BookOpen,        description: "Browse pre-loaded risks and add to register" },
];

export function RiskManagementClient({ initialRisks, initialHistory, orgId, owners, serverNowMs }: Props) {
    const [tab, setTab] = useState<Tab>("overview");
    const [risks, setRisks] = useState<RiskRow[]>(initialRisks);
    const [history, setHistory] = useState<StatusHistoryRow[]>(initialHistory);

    // ─── Mutation callbacks shared across tabs ─────────────────────────────
    const upsertRisk = useCallback((next: RiskRow) => {
        setRisks(prev => {
            const idx = prev.findIndex(r => r.id === next.id);
            if (idx === -1) return [next, ...prev];
            const copy = prev.slice();
            copy[idx] = next;
            return copy;
        });
    }, []);

    const removeRisk = useCallback((id: string) => {
        setRisks(prev => prev.filter(r => r.id !== id));
    }, []);

    const appendHistory = useCallback((rows: StatusHistoryRow[]) => {
        if (rows.length === 0) return;
        setHistory(prev => [...rows, ...prev].slice(0, 200));
    }, []);

    return (
        <div className="w-full flex flex-col space-y-6 animate-in fade-in duration-700">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm font-mono text-muted-foreground tracking-wide">
                <span className="text-muted-foreground">Home</span>
                <ChevronRight className="w-4 h-4 mx-2 opacity-50" />
                <span className="text-foreground">Risk Management</span>
                <ChevronRight className="w-4 h-4 mx-2 opacity-50" />
                <span className="text-foreground">{TABS.find(t => t.id === tab)?.label}</span>
            </div>

            {/* Tab nav */}
            <div className="border-b border-border/60">
                <div className="flex gap-1">
                    {TABS.map(t => {
                        const active = tab === t.id;
                        const Icon = t.icon;
                        return (
                            <Button variant="plain"
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={
                                    "flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px " +
                                    (active
                                        ? "border-orange-500 text-foreground"
                                        : "border-transparent text-muted-foreground hover:text-muted-foreground")
                                }
                            >
                                <Icon className="w-4 h-4" />
                                {t.label}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Tab body */}
            {tab === "overview" && (
                <OverviewTab risks={risks} history={history} nowMs={serverNowMs} onJumpToTab={setTab} />
            )}
            {tab === "library" && (
                <LibraryTab
                    risks={risks}
                    orgId={orgId}
                    onRiskAdded={(risk, historyRow) => {
                        upsertRisk(risk);
                        if (historyRow) appendHistory([historyRow]);
                    }}
                />
            )}
            {tab === "register" && (
                <RegisterTab
                    risks={risks}
                    history={history}
                    orgId={orgId}
                    owners={owners}
                    onRiskUpsert={upsertRisk}
                    onRiskRemove={removeRisk}
                    onHistoryAppend={appendHistory}
                />
            )}
        </div>
    );
}
