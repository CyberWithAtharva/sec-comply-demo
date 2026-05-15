"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
    Database, Plus, Search, X, CheckCircle2, Clock,
    ShieldAlert, Eye, Edit2, PlayCircle, ChevronDown,
} from "lucide-react";
import { cn } from "@/components/ui/Card";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AISystem {
    id: string;
    name: string;
    description: string;
    type: "Internal Model" | "Third-Party API" | "SaaS with AI";
    riskTier: "Unacceptable" | "High" | "Medium" | "Low";
    owner: string;
    frameworks: string[];
    lastReviewed: string;
    status: "Active" | "Under Review" | "Decommissioned";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_SYSTEMS: AISystem[] = [
    {
        id: "AIS-001", name: "Customer Churn Predictor",
        description: "ML model that predicts customer churn using behavioral and transaction data.",
        type: "Internal Model", riskTier: "High", owner: "Priya Mehta",
        frameworks: ["EU AI Act", "ISO 42001"], lastReviewed: "12 days ago", status: "Active",
    },
    {
        id: "AIS-002", name: "GPT-4 via OpenAI API",
        description: "Large language model used for internal support ticket summarization.",
        type: "Third-Party API", riskTier: "Medium", owner: "Rahul Shah",
        frameworks: ["NIST AI RMF"], lastReviewed: "5 days ago", status: "Active",
    },
    {
        id: "AIS-003", name: "GitHub Copilot",
        description: "AI-powered code completion tool for engineering teams.",
        type: "SaaS with AI", riskTier: "Low", owner: "Dev Team",
        frameworks: ["ISO 42001"], lastReviewed: "20 days ago", status: "Active",
    },
    {
        id: "AIS-004", name: "Loan Approval Model",
        description: "Automated loan risk scoring model used by credit underwriting team.",
        type: "Internal Model", riskTier: "High", owner: "Arjun Nair",
        frameworks: ["EU AI Act"], lastReviewed: "3 days ago", status: "Under Review",
    },
    {
        id: "AIS-005", name: "HR Resume Screener",
        description: "Automated resume ranking and shortlisting model for HR recruitment.",
        type: "Internal Model", riskTier: "High", owner: "Sneha Patil",
        frameworks: ["EU AI Act", "NIST AI RMF"], lastReviewed: "30 days ago", status: "Active",
    },
    {
        id: "AIS-006", name: "Gemini API (Google)",
        description: "Used by marketing team for content generation and SEO analysis.",
        type: "Third-Party API", riskTier: "Medium", owner: "Rahul Shah",
        frameworks: ["NIST AI RMF"], lastReviewed: "8 days ago", status: "Active",
    },
    {
        id: "AIS-007", name: "Fraud Detection Engine",
        description: "Real-time transaction anomaly detection system for payment processing.",
        type: "Internal Model", riskTier: "High", owner: "Priya Mehta",
        frameworks: ["EU AI Act", "ISO 42001", "NIST AI RMF"], lastReviewed: "7 days ago", status: "Active",
    },
    {
        id: "AIS-008", name: "Notion AI",
        description: "AI writing assistant integrated into Notion workspace for admin team.",
        type: "SaaS with AI", riskTier: "Low", owner: "Admin",
        frameworks: [], lastReviewed: "45 days ago", status: "Active",
    },
];

const RISK_CONFIG: Record<AISystem["riskTier"], { label: string; cls: string }> = {
    Unacceptable: { label: "Unacceptable", cls: "bg-red-900/40 text-red-300 border-red-700/50" },
    High:         { label: "High",         cls: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
    Medium:       { label: "Medium",       cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
    Low:          { label: "Low",          cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
};

const STATUS_CONFIG: Record<AISystem["status"], { label: string; cls: string; icon: React.ReactNode }> = {
    Active:        { label: "Active",        cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", icon: <CheckCircle2 className="w-3 h-3" /> },
    "Under Review": { label: "Under Review", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30",    icon: <Clock className="w-3 h-3" /> },
    Decommissioned: { label: "Decommissioned", cls: "bg-slate-500/15 text-muted-foreground border-slate-500/30", icon: <X className="w-3 h-3" /> },
};

const FW_COLORS: Record<string, string> = {
    "EU AI Act":    "bg-blue-500/15 text-blue-300 border-blue-500/25",
    "ISO 42001":    "bg-purple-500/15 text-purple-300 border-purple-500/25",
    "NIST AI RMF":  "bg-teal-500/15 text-teal-300 border-teal-500/25",
    "DPDP Act":     "bg-violet-500/15 text-violet-300 border-violet-500/25",
    "SOC 2":        "bg-orange-500/15 text-orange-300 border-orange-500/25",
};

// ─── Register Modal ───────────────────────────────────────────────────────────

function RegisterModal({ onClose, onRegister }: { onClose: () => void; onRegister: (s: AISystem) => void }) {
    const [form, setForm] = useState({
        name: "", description: "", type: "Internal Model" as AISystem["type"],
        riskTier: "Medium" as AISystem["riskTier"], owner: "",
        frameworks: [] as string[], status: "Active" as AISystem["status"],
    });

    const allFrameworks = ["EU AI Act", "ISO 42001", "NIST AI RMF", "DPDP Act", "SOC 2"];

    const toggleFw = (fw: string) =>
        setForm(f => ({ ...f, frameworks: f.frameworks.includes(fw) ? f.frameworks.filter(x => x !== fw) : [...f.frameworks, fw] }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.owner.trim()) return;
        onRegister({
            id: `AIS-${String(Date.now()).slice(-3)}`,
            name: form.name, description: form.description,
            type: form.type, riskTier: form.riskTier, owner: form.owner,
            frameworks: form.frameworks, lastReviewed: "Just now", status: form.status,
        });
        onClose();
    };

    const inputCls = "w-full bg-secondary/60 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-orange-500/50 transition-colors";
    const selectCls = inputCls + " cursor-pointer appearance-none";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border/50 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between p-5 border-b border-border/50">
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">Register New AI System</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Add an AI system to your governance inventory</p>
                    </div>
                    <Button variant="plain" onClick={onClose} className="text-muted-foreground hover:text-muted-foreground transition-colors h-auto"><X className="w-5 h-5" /></Button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">System Name *</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Customer Churn Predictor" className={inputCls} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description</label>
                        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="What does this AI system do?" className={inputCls + " resize-none"} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">System Type</label>
                            <div className="relative">
                                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as AISystem["type"] }))} className={selectCls}>
                                    <option>Internal Model</option>
                                    <option>Third-Party API</option>
                                    <option>SaaS with AI</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Risk Tier</label>
                            <div className="relative">
                                <select value={form.riskTier} onChange={e => setForm(f => ({ ...f, riskTier: e.target.value as AISystem["riskTier"] }))} className={selectCls}>
                                    <option>Unacceptable</option>
                                    <option>High</option>
                                    <option>Medium</option>
                                    <option>Low</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Business Owner *</label>
                            <input value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} placeholder="e.g. Priya Mehta" className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                            <div className="relative">
                                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as AISystem["status"] }))} className={selectCls}>
                                    <option>Active</option>
                                    <option>Under Review</option>
                                    <option>Decommissioned</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">Frameworks</label>
                        <div className="flex flex-wrap gap-2">
                            {allFrameworks.map(fw => (
                                <Button variant="plain" key={fw} type="button" onClick={() => toggleFw(fw)}
                                    className={cn("h-auto", "text-xs px-2.5 py-1 rounded-lg border font-medium transition-all",
                                        form.frameworks.includes(fw)
                                            ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                                            : "bg-secondary/50 text-muted-foreground border-border/50 hover:border-slate-600"
                                    )}>
                                    {fw}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-1">
                        <Button variant="plain" type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors h-auto">Cancel</Button>
                        <Button variant="plain" type="submit" className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors h-auto">
                            <Database className="w-3.5 h-3.5" /> Register System
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIInventoryPage() {
    const [systems, setSystems] = useState<AISystem[]>(INITIAL_SYSTEMS);
    const [search, setSearch] = useState("");
    const [filterRisk, setFilterRisk] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showModal, setShowModal] = useState(false);

    const filtered = useMemo(() => systems.filter(s => {
        if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.owner.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterRisk !== "all" && s.riskTier !== filterRisk) return false;
        if (filterType !== "all" && s.type !== filterType) return false;
        if (filterStatus !== "all" && s.status !== filterStatus) return false;
        return true;
    }), [systems, search, filterRisk, filterType, filterStatus]);

    const stats = useMemo(() => ({
        total: systems.length,
        high: systems.filter(s => s.riskTier === "High" || s.riskTier === "Unacceptable").length,
        pending: systems.filter(s => s.status === "Under Review").length,
        unmapped: systems.filter(s => s.frameworks.length === 0).length,
    }), [systems]);

    const selectCls = "bg-secondary/60 border border-border/50 rounded-xl px-3 py-2 text-sm text-muted-foreground focus:outline-none focus:border-orange-500/40 transition-colors cursor-pointer";

    return (
        <div className="w-full flex flex-col space-y-5 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Database className="w-5 h-5 text-orange-400" />
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">AI System Inventory</h1>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">PREVIEW</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Register and manage all AI systems in your organization</p>
                </div>
                <Button variant="plain"
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold rounded-xl transition-colors shrink-0 shadow-lg shadow-orange-900/30 h-auto"
                >
                    <Plus className="w-4 h-4" /> Register New AI System
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total AI Systems", value: stats.total, icon: Database, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                    { label: "High Risk Systems", value: stats.high, icon: ShieldAlert, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
                    { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                    { label: "No Framework Mapped", value: stats.unmapped, icon: Eye, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-card/60 border border-border/60 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-muted-foreground font-medium">{label}</span>
                            <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center", bg)}>
                                <Icon className={cn("w-4 h-4", color)} />
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-foreground">{value}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-card/60 border border-border/60 rounded-xl p-4">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or owner…"
                            className="w-full bg-secondary/60 border border-border/50 rounded-xl pl-9 pr-3 py-2 text-sm text-muted-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-orange-500/40 transition-colors"
                        />
                    </div>
                    <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className={selectCls}>
                        <option value="all">All Risk Tiers</option>
                        <option>Unacceptable</option><option>High</option><option>Medium</option><option>Low</option>
                    </select>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className={selectCls}>
                        <option value="all">All Types</option>
                        <option>Internal Model</option><option>Third-Party API</option><option>SaaS with AI</option>
                    </select>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectCls}>
                        <option value="all">All Statuses</option>
                        <option>Active</option><option>Under Review</option><option>Decommissioned</option>
                    </select>
                    {(search || filterRisk !== "all" || filterType !== "all" || filterStatus !== "all") && (
                        <Button variant="plain" onClick={() => { setSearch(""); setFilterRisk("all"); setFilterType("all"); setFilterStatus("all"); }}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground bg-secondary/50 rounded-xl border border-border/40 transition-colors h-auto">
                            <X className="w-3.5 h-3.5" /> Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-card/60 border border-border/60 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border/60">
                                {["System Name", "Type", "Risk Tier", "Owner", "Frameworks", "Last Reviewed", "Status", "Actions"].map(h => (
                                    <th key={h} className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence initial={false}>
                                {filtered.map((s, i) => {
                                    const risk = RISK_CONFIG[s.riskTier];
                                    const status = STATUS_CONFIG[s.status];
                                    return (
                                        <motion.tr
                                            key={s.id}
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="border-b border-border/40 hover:bg-secondary/20 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground whitespace-nowrap">{s.name}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">{s.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-xs text-muted-foreground bg-secondary/50 border border-border/40 rounded-lg px-2 py-1">{s.type}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-lg border", risk.cls)}>{risk.label}</span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{s.owner}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {s.frameworks.length === 0
                                                        ? <span className="text-xs text-muted-foreground/70 italic">None mapped</span>
                                                        : s.frameworks.map(fw => (
                                                            <span key={fw} className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", FW_COLORS[fw] ?? "bg-secondary/40 text-muted-foreground border-slate-600/40")}>{fw}</span>
                                                        ))
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{s.lastReviewed}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border", status.cls)}>
                                                    {status.icon}{status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    {[{ icon: Eye, tip: "View" }, { icon: Edit2, tip: "Edit" }, { icon: PlayCircle, tip: "Run Assessment" }].map(({ icon: Icon, tip }) => (
                                                        <Button variant="plain" key={tip} title={tip}
                                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors h-auto">
                                                            <Icon className="w-3.5 h-3.5" />
                                                        </Button>
                                                    ))}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">
                                        No AI systems match your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-border/40 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{filtered.length} of {systems.length} systems</span>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <RegisterModal onClose={() => setShowModal(false)} onRegister={s => setSystems(prev => [s, ...prev])} />
                )}
            </AnimatePresence>
        </div>
    );
}
