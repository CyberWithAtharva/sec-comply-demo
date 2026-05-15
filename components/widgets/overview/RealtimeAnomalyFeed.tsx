"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldX, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";

const initialAnomalies = [
    { id: 1, type: "auth", msg: "Multiple failed logins detected from 192.168.1.45", time: "Just now", severity: "high" },
    { id: 2, type: "config", msg: "S3 Bucket 'prod-assets' ACL modified publicly", time: "2m ago", severity: "critical" },
    { id: 3, type: "network", msg: "Unusual outbound traffic spike on Node 14", time: "15m ago", severity: "medium" },
];

export function RealtimeAnomalyFeed() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                <div className="flex items-center space-x-2">
                    <div className="relative flex h-3 w-3 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Active Anomalies</h3>
                </div>
                <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">3 Live</span>
            </div>

            <div className="flex flex-col space-y-3 flex-1 overflow-y-auto no-scrollbar relative min-h-[200px]">
                <AnimatePresence>
                    {initialAnomalies.map((anomaly, idx) => (
                        <motion.div
                            key={anomaly.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.15 }}
                            className="p-3 rounded-lg bg-card/40 border border-border/50 hover:bg-secondary/40 transition-colors flex items-start space-x-3 cursor-crosshair group"
                        >
                            {anomaly.severity === "critical" ? (
                                <ServerCrash className="w-4 h-4 text-red-400 mt-0.5" />
                            ) : anomaly.severity === "high" ? (
                                <ShieldX className="w-4 h-4 text-amber-500 mt-0.5" />
                            ) : (
                                <AlertTriangle className="w-4 h-4 text-emerald-500 mt-0.5" />
                            )}
                            <div className="flex flex-col flex-1">
                                <span className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                                    {anomaly.msg}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono mt-1">{anomaly.time}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <Button variant="secondary" className="w-full mt-4">
                View All Events
            </Button>
        </div>
    );
}
