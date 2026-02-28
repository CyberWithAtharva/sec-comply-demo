"use client";

import React from "react";
import { motion } from "framer-motion";
import { MetricsCardsWidget, type FrameworkStats } from "@/components/widgets/MetricsCardsWidget";
import { HeatmapWidget } from "@/components/widgets/HeatmapWidget";
import { TabularWidget, type ControlRow } from "@/components/widgets/TabularWidget";
import {
    RadarWidget,
    TimelineWidget,
    ScatterWidget,
    RadialWidget,
    GaugeWidget,
    BarWidget,
    TreemapWidget
} from "@/components/widgets/ChartsWidgets";

interface ControlsTabProps {
    frameworkId: string;
    frameworkStats?: FrameworkStats;
    controls?: ControlRow[];
}

export function ControlsTab({ frameworkId, frameworkStats, controls }: ControlsTabProps) {
    return (
        <motion.div
            key="controls"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, staggerChildren: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
            <MetricsCardsWidget frameworkId={frameworkId} stats={frameworkStats} />
            <HeatmapWidget frameworkId={frameworkId} />
            <GaugeWidget frameworkId={frameworkId} />

            <TimelineWidget frameworkId={frameworkId} />
            <BarWidget frameworkId={frameworkId} />
            <RadarWidget frameworkId={frameworkId} />

            <TabularWidget frameworkId={frameworkId} controls={controls} />
            <ScatterWidget frameworkId={frameworkId} />

            <RadialWidget frameworkId={frameworkId} />
            <TreemapWidget frameworkId={frameworkId} />
        </motion.div>
    );
}
