"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Siren, Upload, Plus, AlertOctagon, Clock, Zap, CheckCircle2, BarChart2, List, FileBarChart2 } from "lucide-react";
import { cn } from "@/components/ui/Card";

const TABS = ["Overview", "Incidents", "Reports"] as const;

interface IncidentManagementClientProps {
    orgId: string;
}

export function IncidentManagementClient({ orgId: _ }: IncidentManagementClientProps) {
    const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Overview");

    const stats = [
        { label: "Open Incidents", value: 0, icon: AlertOctagon, color: "text-red-400", sub: "" },
        { label: "MTTR", value: "—", icon: Clock, color: "text-muted-foreground", sub: "" },
        { label: "P1 Active", value: 0, icon: Zap, color: "text-orange-400", sub: "" },
        { label: "Resolved This Month", value: 0, icon: CheckCircle2, color: "text-emerald-400", sub: "" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <Siren className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Incident Response</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Security incident lifecycle — log, track, investigate, and resolve incidents</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="plain" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors h-auto">
                        <Upload className="w-4 h-4" />
                        Import CSV
                    </Button>
                    <Button variant="plain" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium transition-colors h-auto">
                        <Plus className="w-4 h-4" />
                        Log Incident
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-border">
                {TABS.map(tab => (
                    <Button variant="plain"
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn("h-auto", 
                            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                            activeTab === tab
                                ? "border-orange-500 text-orange-400"
                                : "border-transparent text-muted-foreground hover:text-muted-foreground"
                        )}
                    >
                        {tab === "Overview" && <BarChart2 className="w-3.5 h-3.5" />}
                        {tab === "Incidents" && <List className="w-3.5 h-3.5" />}
                        {tab === "Reports" && <FileBarChart2 className="w-3.5 h-3.5" />}
                        {tab}
                    </Button>
                ))}
            </div>

            {activeTab === "Overview" && (
                <div className="space-y-5">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map(stat => (
                            <div key={stat.label} className="bg-card/60 border border-border rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                                </div>
                                <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Severity Breakdown */}
                        <div className="bg-card/60 border border-border rounded-xl p-5">
                            <p className="text-sm font-semibold text-foreground mb-4">Severity Breakdown</p>
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <AlertOctagon className="w-10 h-10 text-muted-foreground/50 mb-3" />
                                <p className="text-muted-foreground text-sm">No incidents recorded yet.</p>
                            </div>
                        </div>

                        {/* Status Overview */}
                        <div className="bg-card/60 border border-border rounded-xl p-5">
                            <p className="text-sm font-semibold text-foreground mb-4">Status Overview</p>
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <AlertOctagon className="w-10 h-10 text-muted-foreground/50 mb-3" />
                                <p className="text-muted-foreground text-sm">No incidents recorded yet.</p>
                            </div>
                        </div>
                    </div>

                    {/* Active P1 Incidents */}
                    <div className="bg-card/60 border border-border rounded-xl p-5">
                        <p className="text-sm font-semibold text-foreground mb-4">Active P1 Incidents</p>
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-700 mb-3" />
                            <p className="text-muted-foreground text-sm">No active P1 incidents — all clear.</p>
                        </div>
                    </div>

                    {/* Recent Incidents */}
                    <div className="bg-card/60 border border-border rounded-xl p-5">
                        <p className="text-sm font-semibold text-foreground mb-4">Recent Incidents</p>
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Siren className="w-10 h-10 text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground text-sm">No incidents logged yet.</p>
                            <p className="text-muted-foreground/70 text-xs mt-1">Use &quot;Log Incident&quot; to record your first security incident.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Incidents" && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Siren className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground font-medium">No incidents found</p>
                    <p className="text-muted-foreground text-sm mt-1">Log your first incident using the button above.</p>
                </div>
            )}

            {activeTab === "Reports" && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <FileBarChart2 className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground font-medium">No reports generated</p>
                    <p className="text-muted-foreground text-sm mt-1">Reports will appear here once incidents are resolved.</p>
                </div>
            )}
        </div>
    );
}

