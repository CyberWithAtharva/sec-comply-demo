"use client";

import React from "react";
import { motion } from "framer-motion";
import { MetricsCardsWidget, type FrameworkStats } from "@/components/widgets/MetricsCardsWidget";
import { TabularWidget, type ControlRow } from "@/components/widgets/TabularWidget";
import { GaugeWidget, BarWidget, RadarWidget, TreemapWidget } from "@/components/widgets/ChartsWidgets";

interface ControlsTabProps {
    frameworkId: string;
    frameworkStats?: FrameworkStats;
    controls?: ControlRow[];
}

export function ControlsTab({ frameworkId, frameworkStats, controls }: ControlsTabProps) {
    // Derive real domain groupings from controls
    const domainGroups = React.useMemo(() => {
        if (!controls || controls.length === 0) return [];
        const map = new Map<string, { total: number; verified: number; inProgress: number }>();
        for (const c of controls) {
            const d = (c.domain || "Other").split(":")[0].trim();
            if (!map.has(d)) map.set(d, { total: 0, verified: 0, inProgress: 0 });
            const entry = map.get(d)!;
            entry.total++;
            if (c.status === "verified" || c.status === "not_applicable") entry.verified++;
            else if (c.status === "in_progress") entry.inProgress++;
        }
        return Array.from(map.entries())
            .map(([name, v]) => ({ name, ...v }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 8); // cap at 8 domains for readability
    }, [controls]);

    // Bar: control count per domain
    const barData = domainGroups.map(d => ({ name: d.name, val: d.total }));

    // Treemap: domain size distribution
    const treeData = domainGroups.map(d => ({ name: d.name, size: d.total }));

    // Radar: verified % per domain vs 100% target
    const radarData = domainGroups.map(d => ({
        subject: d.name,
        A: d.total > 0 ? Math.round((d.verified / d.total) * 100) : 0,
        B: 100,
        fullMark: 100,
    }));

    const hasRealData = domainGroups.length > 0;

    return (
        <motion.div
            key="controls"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, staggerChildren: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
            {/* Row 1: Metrics Cards — real data */}
            <MetricsCardsWidget frameworkId={frameworkId} stats={frameworkStats} />

            {/* Row 2: Gauge + Bar + Radar — real data */}
            <GaugeWidget
                frameworkId={frameworkId}
                value={frameworkStats?.percentage}
            />
            <BarWidget
                frameworkId={frameworkId}
                data={hasRealData ? barData : undefined}
                label="Controls by Domain"
            />
            <RadarWidget
                frameworkId={frameworkId}
                data={hasRealData ? radarData : undefined}
                label="Domain Completion %"
            />

            {/* Row 3: Controls Table + Treemap — real data */}
            <TabularWidget frameworkId={frameworkId} controls={controls} />
            <TreemapWidget
                frameworkId={frameworkId}
                data={hasRealData ? treeData : undefined}
                label="Domain Distribution"
            />
        </motion.div>
    );
}
