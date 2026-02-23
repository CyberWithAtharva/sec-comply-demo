"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    BadgeCheck, Globe, Link2, ExternalLink, Activity,
    Shield, FileText, Download, Eye, Users, Lock,
    CheckCircle2, Clock, ChevronRight, TrendingUp, BarChart3
} from "lucide-react";
import { cn } from "@/components/ui/Card";

const certifications = [
    { name: "SOC 2 Type II", issuer: "Deloitte", issued: "2024-08-15", expires: "2025-08-15", status: "Active", icon: Shield },
    { name: "ISO 27001:2022", issuer: "BSI Group", issued: "2024-03-01", expires: "2027-03-01", status: "Active", icon: BadgeCheck },
    { name: "HIPAA", issuer: "HITRUST", issued: "2024-06-20", expires: "2026-06-20", status: "Active", icon: Lock },
    { name: "PCI DSS v4.0", issuer: "Coalfire", issued: "2024-11-01", expires: "2025-11-01", status: "Active", icon: Shield },
    { name: "CSA STAR Level 2", issuer: "Schellman", issued: "2024-09-10", expires: "2025-09-10", status: "Active", icon: BadgeCheck },
    { name: "GDPR DPA", issuer: "Internal", issued: "2024-01-15", expires: "N/A", status: "Active", icon: FileText },
];

const documents = [
    { name: "SOC 2 Type II Report", type: "PDF", size: "2.4 MB", downloads: 142, nda: true, updated: "Aug 2024" },
    { name: "Penetration Test Executive Summary", type: "PDF", size: "890 KB", downloads: 89, nda: true, updated: "Nov 2024" },
    { name: "Information Security Policy", type: "PDF", size: "1.1 MB", downloads: 234, nda: false, updated: "Oct 2024" },
    { name: "Business Continuity Plan", type: "PDF", size: "1.8 MB", downloads: 67, nda: true, updated: "Sep 2024" },
    { name: "Data Processing Agreement", type: "PDF", size: "450 KB", downloads: 312, nda: false, updated: "Jan 2024" },
    { name: "Vulnerability Disclosure Policy", type: "PDF", size: "180 KB", downloads: 178, nda: false, updated: "Dec 2024" },
];

const subprocessors = [
    { name: "Amazon Web Services", purpose: "Cloud Infrastructure", location: "US, EU", status: "Active", risk: "Low" },
    { name: "Datadog", purpose: "Monitoring & Observability", location: "US", status: "Active", risk: "Low" },
    { name: "Snowflake", purpose: "Data Warehouse", location: "US, EU", status: "Active", risk: "Medium" },
    { name: "PagerDuty", purpose: "Incident Management", location: "US", status: "Active", risk: "Low" },
    { name: "Okta", purpose: "Identity Provider", location: "US", status: "Active", risk: "Medium" },
];

const visitorStats = [
    { metric: "Page Views (30d)", value: "2,847", trend: "+12%" },
    { metric: "Document Downloads", value: "456", trend: "+8%" },
    { metric: "NDA Requests", value: "23", trend: "+34%" },
    { metric: "Avg. Time on Page", value: "4m 12s", trend: "+18%" },
];

const accessRequests = [
    { company: "Stripe", contact: "Sarah K.", type: "Full Access", date: "2 hours ago", status: "Pending" },
    { company: "Shopify", contact: "Mike L.", type: "SOC 2 Only", date: "5 hours ago", status: "Pending" },
    { company: "Notion", contact: "Priya M.", type: "Full Access", date: "1 day ago", status: "Approved" },
    { company: "Linear", contact: "Alex T.", type: "Pen Test", date: "2 days ago", status: "Approved" },
];

export default function TrustCenterPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <BadgeCheck className="w-8 h-8 mr-3 text-blue-500" />
                        Public Trust Center
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Manage your customer-facing security posture and compliance certifications.</p>
                </div>
                <button className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Preview Live Site
                </button>
            </div>

            {/* Hero Banner */}
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-blue-900/10 to-slate-900/50 flex flex-col lg:flex-row items-start justify-between">
                <div className="flex-1">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">Published</span>
                    <h2 className="text-2xl font-bold text-slate-100 mb-2">OmniGuard Security Portal</h2>
                    <p className="text-slate-400 max-w-md mb-4">Your real-time security posture is currently visible to 48 active prospects under NDA.</p>
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 max-w-md bg-slate-900/80 border border-slate-700 rounded-lg flex items-center px-4 py-3">
                            <span className="text-slate-500 text-sm">trust.omniguard.com/security</span>
                        </div>
                        <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
                            <Link2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex items-center space-x-6 mt-6 lg:mt-0">
                    {visitorStats.map((s, i) => (
                        <div key={i} className="text-center">
                            <span className="block text-xl font-bold text-slate-100">{s.value}</span>
                            <span className="text-[10px] text-slate-500 block">{s.metric}</span>
                            <span className="text-[10px] text-emerald-400 font-medium flex items-center justify-center mt-0.5">
                                <TrendingUp className="w-2.5 h-2.5 mr-0.5" />{s.trend}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Certifications Grid */}
            <div>
                <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-emerald-400" />
                    Active Certifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {certifications.map((cert, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-panel p-5 rounded-2xl border border-slate-800/50 flex items-start space-x-4 group hover:border-emerald-500/20 transition-all cursor-pointer"
                        >
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                                <cert.icon className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <span className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">{cert.name}</span>
                                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-2 shrink-0">{cert.status}</span>
                                </div>
                                <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-slate-500">
                                    <span>{cert.issuer}</span>
                                    <span>Exp: {cert.expires}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Row 3: Documents + Access Requests */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Document Library */}
                <div className="xl:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800/50 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-semibold text-slate-100">Document Library</h3>
                        </div>
                        <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center transition-colors">Upload New <ChevronRight className="w-3 h-3 ml-1" /></button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900/40">
                                <tr>
                                    <th className="px-4 py-3 font-medium rounded-tl-lg">Document</th>
                                    <th className="px-4 py-3 font-medium">NDA</th>
                                    <th className="px-4 py-3 font-medium">Size</th>
                                    <th className="px-4 py-3 font-medium">Downloads</th>
                                    <th className="px-4 py-3 font-medium">Updated</th>
                                    <th className="px-4 py-3 font-medium rounded-tr-lg"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {documents.map((doc, i) => (
                                    <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-2">
                                                <FileText className="w-4 h-4 text-slate-500" />
                                                <span className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{doc.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {doc.nda ? (
                                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Required</span>
                                            ) : (
                                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Public</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500 font-mono">{doc.size}</td>
                                        <td className="px-4 py-3 text-xs text-slate-300 flex items-center"><Download className="w-3 h-3 mr-1 text-slate-500" />{doc.downloads}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{doc.updated}</td>
                                        <td className="px-4 py-3">
                                            <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Access Requests */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/50 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-amber-400" />
                            <h3 className="text-lg font-semibold text-slate-100">Access Requests</h3>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white">2</div>
                    </div>
                    <div className="flex flex-col space-y-3 flex-1">
                        {accessRequests.map((r, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex flex-col group hover:bg-slate-800/40 transition-colors cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-1.5">
                                    <span className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{r.company}</span>
                                    <span className={cn(
                                        "text-[10px] uppercase font-bold px-2 py-0.5 rounded border",
                                        r.status === "Pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    )}>{r.status}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-[10px] text-slate-500">
                                    <span>{r.contact}</span>
                                    <span>{r.type}</span>
                                    <span className="flex items-center"><Clock className="w-2.5 h-2.5 mr-0.5" />{r.date}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <button className="w-full mt-3 shrink-0 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 py-2.5 rounded-xl transition-colors font-medium text-sm">
                        Review All Requests
                    </button>
                </div>
            </div>

            {/* Row 4: Sub-processors */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/50 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-slate-100">Sub-processor Registry</h3>
                    </div>
                    <span className="text-xs text-slate-500">{subprocessors.length} active</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900/40">
                            <tr>
                                <th className="px-4 py-3 font-medium rounded-tl-lg">Provider</th>
                                <th className="px-4 py-3 font-medium">Purpose</th>
                                <th className="px-4 py-3 font-medium">Location</th>
                                <th className="px-4 py-3 font-medium">Risk</th>
                                <th className="px-4 py-3 font-medium rounded-tr-lg">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {subprocessors.map((sp, i) => (
                                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-200">{sp.name}</td>
                                    <td className="px-4 py-3 text-xs text-slate-400">{sp.purpose}</td>
                                    <td className="px-4 py-3 text-xs text-slate-500">{sp.location}</td>
                                    <td className="px-4 py-3">
                                        <span className={cn(
                                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded border",
                                            sp.risk === "Low" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        )}>{sp.risk}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="flex items-center text-xs text-emerald-400">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />{sp.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
