"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    ServerCrash, Laptop, Globe, Database, Search, Shield,
    Monitor, Smartphone, HardDrive, Cloud, Wifi, Package,
    AlertTriangle, CheckCircle2, Clock, TrendingUp, ArrowUpRight
} from "lucide-react";
import { cn } from "@/components/ui/Card";

const statCards = [
    { label: "Hardware Assets", count: "4,192", icon: Laptop, trend: "+34", color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Cloud Resources", count: "1,844", icon: Cloud, trend: "+128", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Data Stores", count: "128", icon: Database, trend: "+3", color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Unmanaged", count: "14", icon: AlertTriangle, trend: "-2", color: "text-red-400", bg: "bg-red-500/10" },
];

const osDistribution = [
    { name: "Ubuntu 22.04", count: 842, pct: 34, color: "bg-orange-500" },
    { name: "Windows Server 2022", count: 614, pct: 25, color: "bg-blue-500" },
    { name: "Amazon Linux 2023", count: 467, pct: 19, color: "bg-amber-500" },
    { name: "macOS Sonoma", count: 312, pct: 13, color: "bg-slate-400" },
    { name: "Other", count: 221, pct: 9, color: "bg-slate-600" },
];

const cloudResources = [
    { id: "i-0a1b2c3d4e", type: "EC2", region: "us-east-1", state: "Running", compliance: "Compliant", provider: "AWS" },
    { id: "vm-prod-api-01", type: "VM", region: "eastus2", state: "Running", compliance: "Non-Compliant", provider: "Azure" },
    { id: "gce-worker-node", type: "GCE", region: "us-central1", state: "Running", compliance: "Compliant", provider: "GCP" },
    { id: "rds-primary-db", type: "RDS", region: "us-west-2", state: "Available", compliance: "Compliant", provider: "AWS" },
    { id: "s3-audit-logs", type: "S3", region: "us-east-1", state: "Active", compliance: "Partial", provider: "AWS" },
    { id: "aks-cluster-prod", type: "AKS", region: "westeurope", state: "Running", compliance: "Compliant", provider: "Azure" },
];

const recentDiscoveries = [
    { name: "Unknown IoT Sensor", ip: "10.42.8.112", method: "Network Scan", time: "14 mins ago", risk: "high" },
    { name: "Dev MacBook (Contractor)", ip: "192.168.1.234", method: "MDM Sync", time: "2 hours ago", risk: "medium" },
    { name: "Shadow SaaS — Notion", ip: "External", method: "DNS Analysis", time: "5 hours ago", risk: "low" },
    { name: "Legacy NAS Server", ip: "10.0.5.18", method: "Port Scan", time: "1 day ago", risk: "critical" },
];

const complianceCoverage = [
    { category: "Encryption at Rest", covered: 94, total: 128 },
    { category: "Endpoint Protection", covered: 3891, total: 4192 },
    { category: "Patch Compliance (<30d)", covered: 1621, total: 1844 },
    { category: "MFA Enforced", covered: 112, total: 128 },
    { category: "Backup Verified", covered: 98, total: 128 },
];

export default function AssetsPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <ServerCrash className="w-8 h-8 mr-3 text-orange-500" />
                        Asset Inventory
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Comprehensive tracking of devices, infrastructure, and code repositories.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            className="bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 min-w-[220px] focus:outline-none focus:border-orange-500/50 transition-colors shadow-inner"
                        />
                    </div>
                    <button className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Import CMDB
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {statCards.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className="glass-panel p-5 rounded-2xl flex items-center justify-between border border-slate-800/50 group hover:border-slate-700 transition-all"
                    >
                        <div className="flex items-center space-x-4">
                            <div className={cn("p-3 rounded-xl", s.bg)}>
                                <s.icon className={cn("w-5 h-5", s.color)} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-slate-100 mb-0.5">{s.count}</span>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{s.label}</span>
                            </div>
                        </div>
                        <span className={cn("text-xs font-medium flex items-center", s.trend.startsWith("+") && !s.label.includes("Unmanaged") ? "text-emerald-400" : s.label.includes("Unmanaged") ? "text-emerald-400" : "text-emerald-400")}>
                            <TrendingUp className="w-3 h-3 mr-0.5" />{s.trend}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Row 2: OS Distribution + Cloud Resources Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* OS Distribution */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/50 flex flex-col">
                    <div className="flex items-center space-x-2 mb-5">
                        <Monitor className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-slate-100">OS Distribution</h3>
                    </div>
                    <div className="flex flex-col space-y-3 flex-1">
                        {osDistribution.map((os, i) => (
                            <div key={i} className="flex flex-col space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-300 font-medium">{os.name}</span>
                                    <span className="text-slate-500">{os.count} <span className="text-slate-600">({os.pct}%)</span></span>
                                </div>
                                <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${os.pct}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.1 }}
                                        className={cn("h-full rounded-full", os.color)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cloud Resources Table */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800/50 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-2">
                            <Cloud className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-lg font-semibold text-slate-100">Cloud Resources</h3>
                        </div>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-lg">1,844 total</span>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900/40">
                                <tr>
                                    <th className="px-4 py-3 font-medium rounded-tl-lg">Resource ID</th>
                                    <th className="px-4 py-3 font-medium">Type</th>
                                    <th className="px-4 py-3 font-medium">Provider</th>
                                    <th className="px-4 py-3 font-medium">Region</th>
                                    <th className="px-4 py-3 font-medium">State</th>
                                    <th className="px-4 py-3 font-medium rounded-tr-lg">Compliance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {cloudResources.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-300 group-hover:text-orange-400 transition-colors">{r.id}</td>
                                        <td className="px-4 py-3 text-xs">
                                            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-medium">{r.type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-300">{r.provider}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500 font-mono">{r.region}</td>
                                        <td className="px-4 py-3">
                                            <span className="flex items-center text-xs text-emerald-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                                                {r.state}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "text-[10px] uppercase font-bold px-2 py-0.5 rounded border",
                                                r.compliance === "Compliant" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    r.compliance === "Non-Compliant" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            )}>
                                                {r.compliance}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Row 3: Compliance Coverage + Recently Discovered */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Compliance Coverage */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/50 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-lg font-semibold text-slate-100">Asset Compliance Coverage</h3>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-4 flex-1">
                        {complianceCoverage.map((c, i) => {
                            const pct = Math.round((c.covered / c.total) * 100);
                            return (
                                <div key={i} className="flex flex-col space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-300 font-medium">{c.category}</span>
                                        <span className="text-slate-500">{c.covered}/{c.total} <span className={cn(pct >= 90 ? "text-emerald-400" : pct >= 70 ? "text-amber-400" : "text-red-400")}>({pct}%)</span></span>
                                    </div>
                                    <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.8, delay: i * 0.1 }}
                                            className={cn("h-full rounded-full", pct >= 90 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-500" : "bg-red-500")}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recently Discovered Assets */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/50 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-2">
                            <Wifi className="w-5 h-5 text-amber-400" />
                            <h3 className="text-lg font-semibold text-slate-100">Recently Discovered</h3>
                        </div>
                        <span className="text-xs text-slate-500">Last 24h</span>
                    </div>
                    <div className="flex flex-col space-y-3 flex-1">
                        {recentDiscoveries.map((d, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex items-center justify-between group hover:bg-slate-800/40 transition-colors cursor-pointer"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-200 group-hover:text-orange-400 transition-colors">{d.name}</span>
                                    <div className="flex items-center space-x-3 mt-1 text-[10px] text-slate-500">
                                        <span className="font-mono">{d.ip}</span>
                                        <span>via {d.method}</span>
                                        <span className="flex items-center"><Clock className="w-2.5 h-2.5 mr-0.5" />{d.time}</span>
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded border whitespace-nowrap",
                                    d.risk === "critical" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                        d.risk === "high" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                            d.risk === "medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                )}>
                                    {d.risk}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
