"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, FileUp } from "lucide-react";
import Link from "next/link";

export default function QuestionnairePage() {
    const [activeSection, setActiveSection] = useState("Cloud Infrastructure");
    const [answers, setAnswers] = useState<Record<string, "yes" | "no" | null>>({});

    const sections = [
        { name: "Cloud Infrastructure", count: 6, answered: 2 },
        { name: "Identity & Access", count: 12, answered: 0 },
        { name: "Network Security", count: 6, answered: 0 },
        { name: "Endpoint & User Compute", count: 10, answered: 0 },
        { name: "Data Protection", count: 12, answered: 0 },
        { name: "Application Security", count: 12, answered: 0 },
    ];

    const currentQuestions = [
        { id: "CLD-Q-001", text: "Is Infrastructure as Code (IaC) used for cloud resource provisioning?" },
        { id: "CLD-Q-002", text: "Is there a multi-account or multi-project strategy for workload isolation?" },
        { id: "CLD-Q-003", text: "Are cloud costs and resource usage monitored for anomalies?" },
    ];

    return (
        <div className="w-full flex flex-col space-y-6 animate-in fade-in duration-700 h-full">
            {/* Header */}
            <div className="flex items-center text-sm font-mono text-slate-400 tracking-wide">
                <Link href="/" className="hover:text-slate-200 cursor-pointer transition-colors flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Assessment
                </Link>
            </div>

            <div className="flex flex-col mb-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-100">Questionnaire</h1>
                <p className="text-slate-400 mt-1">Answer questions to assess your compliance posture</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 flex-1">
                {/* Left Sidebar */}
                <div className="w-full lg:w-64 shrink-0 flex flex-col space-y-2">
                    {sections.map((section) => {
                        const isActive = activeSection === section.name;
                        return (
                            <button
                                key={section.name}
                                onClick={() => setActiveSection(section.name)}
                                className={`flex flex-col text-left px-4 py-3 rounded-xl transition-all ${isActive ? "bg-slate-800/60 border border-slate-700/50 shadow-glow" : "hover:bg-slate-800/30 border border-transparent"
                                    }`}
                            >
                                <span className={`text-sm font-medium ${isActive ? "text-blue-400" : "text-slate-300"}`}>
                                    {section.name}
                                </span>
                                <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden flex items-center justify-between relative">
                                    <div
                                        className={`h-full ${isActive ? "bg-blue-500" : "bg-slate-500"} transition-all duration-500`}
                                        style={{ width: `${(section.answered / section.count) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-mono mt-1 self-end text-slate-500">
                                    {section.answered}/{section.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Center Canvas */}
                <div className="flex-1 glass-panel rounded-2xl p-6 lg:p-8 flex flex-col min-h-[600px]">
                    <div className="flex justify-between items-start mb-8 border-b border-slate-800/50 pb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-100">{activeSection}</h2>
                            <p className="text-sm text-slate-400 mt-1 max-w-xl">
                                IaaS configuration, encryption at rest and in transit, cloud networking, and service security settings.
                            </p>
                        </div>
                        <div className="text-xs font-mono bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                            <span className="text-slate-100">2/6</span> <span className="text-slate-400">answered</span>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-8 flex-1">
                        {currentQuestions.map((q, idx) => (
                            <motion.div
                                key={q.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex flex-col space-y-4"
                            >
                                <div className="flex items-start gap-4">
                                    <span className="text-xs font-mono text-slate-500 mt-1 whitespace-nowrap">{q.id}</span>
                                    <div className="flex flex-col space-y-3 w-full">
                                        <p className="text-[15px] font-medium text-slate-200 leading-snug">
                                            {q.text} <span className="text-red-400">*</span>
                                        </p>

                                        {/* Yes / No Toggle Group */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: "yes" }))}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${answers[q.id] === 'yes'
                                                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                                    : "bg-slate-900/40 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                                                    }`}>
                                                {answers[q.id] === 'yes' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                                Yes
                                            </button>
                                            <button
                                                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: "no" }))}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${answers[q.id] === 'no'
                                                    ? "bg-red-500/10 border-red-500/50 text-red-400"
                                                    : "bg-slate-900/40 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                                                    }`}>
                                                {answers[q.id] === 'no' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                                No
                                            </button>
                                        </div>

                                        {/* Dynamic Sub-state or File Upload if Yes (Just an example flow) */}
                                        <AnimatePresence>
                                            {answers[q.id] === 'yes' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="pt-2 overflow-hidden"
                                                >
                                                    <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-slate-800/50 transition-colors">
                                                        <FileUp className="w-6 h-6 text-slate-500 mb-2 group-hover:text-blue-400 transition-colors" />
                                                        <p className="text-sm font-medium text-slate-300">Upload evidence (Optional)</p>
                                                        <p className="text-xs text-slate-500 mt-1">PDF, DOCX, or Images up to 10MB</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Notes Box */}
                                        <textarea
                                            placeholder="Additional notes or evidence references..."
                                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none h-20"
                                        />
                                    </div>
                                </div>

                                {idx !== currentQuestions.length - 1 && (
                                    <div className="h-px w-full bg-slate-800/50 my-2" />
                                )}
                            </motion.div>
                        ))}
                    </div>

                </div>

                {/* Right Collapsible Panel (Programs Summary) */}
                <div className="w-full lg:w-72 shrink-0">
                    <div className="glass-panel border-blue-500/20 rounded-2xl p-5 shadow-glow sticky top-6">
                        <h3 className="text-sm font-semibold text-blue-400 mb-4 flex items-center justify-between">
                            Live Impact
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                        </h3>

                        <div className="space-y-4">
                            <div className="flex flex-col space-y-1.5">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-300">SOC 2 Type II</span>
                                    <span className="text-emerald-400">+2%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '60%' }}></div>
                                </div>
                                <span className="text-[10px] text-slate-500">32/51 controls complete</span>
                            </div>

                            <div className="flex flex-col space-y-1.5">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-300">ISO 27001</span>
                                    <span className="text-slate-500">Unchanged</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full" style={{ width: '25%' }}></div>
                                </div>
                                <span className="text-[10px] text-slate-500">23/93 controls complete</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
