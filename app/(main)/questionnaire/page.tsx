"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, FileUp, ChevronDown, Calendar, Upload, ToggleLeft, ToggleRight, Minus, Plus, Zap, TrendingUp, TrendingDown, Shield, Activity, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/ui/Card";

// ------ Question Type Definitions ------
type QuestionType = "yes_no" | "dropdown" | "text" | "textarea" | "multi_select" | "radio" | "slider" | "date" | "file_upload" | "toggle";

interface Question {
    id: string;
    text: string;
    type: QuestionType;
    required?: boolean;
    options?: string[];
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    labels?: string[];
}

interface Section {
    name: string;
    description: string;
    count: number;
    answered: number;
    questions: Question[];
}

// ------ Mock Data: 6 Sections with diverse question types ------
const sectionsData: Section[] = [
    {
        name: "Cloud Infrastructure",
        description: "IaaS configuration, encryption at rest and in transit, cloud networking, and service security settings.",
        count: 6,
        answered: 2,
        questions: [
            { id: "CLD-Q-001", text: "Is Infrastructure as Code (IaC) used for cloud resource provisioning?", type: "yes_no", required: true },
            { id: "CLD-Q-002", text: "Select your primary cloud service provider", type: "dropdown", options: ["AWS", "Azure", "GCP", "Oracle Cloud", "IBM Cloud", "Multi-Cloud"], required: true },
            { id: "CLD-Q-003", text: "Which workload isolation strategies are currently implemented?", type: "multi_select", options: ["Multi-account/project", "VPC segmentation", "Namespace isolation", "Service mesh"], required: true },
            { id: "CLD-Q-004", text: "Enter your primary VPC/VNet CIDR range", type: "text", placeholder: "e.g., 10.0.0.0/16", required: false },
            { id: "CLD-Q-005", text: "Rate your cloud infrastructure maturity level", type: "slider", min: 1, max: 5, step: 1, labels: ["Initial", "Developing", "Defined", "Managed", "Optimized"] },
            { id: "CLD-Q-006", text: "Is cost anomaly detection enabled for all cloud accounts?", type: "toggle" },
        ]
    },
    {
        name: "Identity & Access",
        description: "IAM policies, role-based access control, multi-factor authentication, and privileged access management.",
        count: 6,
        answered: 0,
        questions: [
            { id: "IAM-Q-001", text: "Is multi-factor authentication (MFA) enforced for all user accounts?", type: "toggle", required: true },
            { id: "IAM-Q-002", text: "How frequently are user access reviews conducted?", type: "radio", options: ["Monthly", "Quarterly", "Semi-annually", "Annually"], required: true },
            { id: "IAM-Q-003", text: "Describe your privileged access management (PAM) strategy", type: "textarea", placeholder: "Include details about just-in-time access, session recording, break-glass procedures..." },
            { id: "IAM-Q-004", text: "When was the last comprehensive IAM audit performed?", type: "date", required: true },
            { id: "IAM-Q-005", text: "Which SSO protocols are currently in use?", type: "multi_select", options: ["SAML 2.0", "OAuth 2.0", "OpenID Connect", "LDAP", "Kerberos"] },
            { id: "IAM-Q-006", text: "Upload your current IAM policy documentation", type: "file_upload" },
        ]
    },
    {
        name: "Network Security",
        description: "Firewall rules, intrusion detection, network segmentation, and DDoS protection measures.",
        count: 6,
        answered: 0,
        questions: [
            { id: "NET-Q-001", text: "Is a web application firewall (WAF) deployed in front of all public-facing services?", type: "yes_no", required: true },
            { id: "NET-Q-002", text: "Select your primary IDS/IPS solution", type: "dropdown", options: ["AWS GuardDuty", "Azure Sentinel", "Palo Alto", "CrowdStrike", "Snort/Suricata", "None"] },
            { id: "NET-Q-003", text: "Rate your network segmentation maturity", type: "slider", min: 1, max: 5, step: 1, labels: ["Flat", "Basic", "Segmented", "Micro-segmented", "Zero Trust"] },
            { id: "NET-Q-004", text: "Is DDoS protection enabled for all external endpoints?", type: "toggle" },
            { id: "NET-Q-005", text: "Which network monitoring capabilities are in place?", type: "multi_select", options: ["Flow logs", "Packet capture", "DNS monitoring", "NetFlow/sFlow"] },
            { id: "NET-Q-006", text: "Describe any network security exceptions or waivers currently in place", type: "textarea", placeholder: "Include exception ID, justification, and expiry date..." },
        ]
    },
    {
        name: "Endpoint & User Compute",
        description: "Device management, endpoint detection and response, patch management, and BYOD policies.",
        count: 4,
        answered: 0,
        questions: [
            { id: "EPT-Q-001", text: "Is an EDR solution deployed across all corporate endpoints?", type: "yes_no", required: true },
            { id: "EPT-Q-002", text: "What is your target patch deployment SLA for critical vulnerabilities?", type: "dropdown", options: ["24 hours", "48 hours", "7 days", "14 days", "30 days"] },
            { id: "EPT-Q-003", text: "Is disk encryption enforced on all managed devices?", type: "toggle" },
            { id: "EPT-Q-004", text: "Upload your endpoint hardening baseline document", type: "file_upload" },
        ]
    },
    {
        name: "Data Protection",
        description: "Data classification, encryption standards, data loss prevention, and backup strategies.",
        count: 5,
        answered: 0,
        questions: [
            { id: "DAT-Q-001", text: "Is a formal data classification policy in place and enforced?", type: "yes_no", required: true },
            { id: "DAT-Q-002", text: "Which encryption standards are used for data at rest?", type: "multi_select", options: ["AES-256", "AES-128", "RSA-2048", "ChaCha20", "Platform-managed keys"] },
            { id: "DAT-Q-003", text: "Rate your backup and recovery maturity", type: "slider", min: 1, max: 5, step: 1, labels: ["Ad-hoc", "Basic", "Tested", "Automated", "Resilient"] },
            { id: "DAT-Q-004", text: "When was the last successful disaster recovery test?", type: "date" },
            { id: "DAT-Q-005", text: "Describe your data retention and disposal procedures", type: "textarea", placeholder: "Include retention periods, disposal methods, and compliance references..." },
        ]
    },
    {
        name: "Application Security",
        description: "SDLC security, code review practices, SAST/DAST tooling, and dependency management.",
        count: 5,
        answered: 0,
        questions: [
            { id: "APP-Q-001", text: "Are SAST/DAST scans integrated into the CI/CD pipeline?", type: "yes_no", required: true },
            { id: "APP-Q-002", text: "Select your primary application security testing tools", type: "multi_select", options: ["SonarQube", "Snyk", "Checkmarx", "Veracode", "Semgrep", "Trivy"] },
            { id: "APP-Q-003", text: "How are third-party dependencies managed and scanned?", type: "radio", options: ["Automated SCA in CI", "Manual periodic review", "Dependabot/Renovate", "No formal process"] },
            { id: "APP-Q-004", text: "Enter your target remediation SLA for critical SAST findings (in days)", type: "text", placeholder: "e.g., 3" },
            { id: "APP-Q-005", text: "Upload your secure development lifecycle (SDL) documentation", type: "file_upload" },
        ]
    },
];

// ------ Question Input Components ------
function YesNoInput({ value, onChange }: { value: any; onChange: (v: any) => void }) {
    return (
        <div className="flex gap-3">
            {(["yes", "no"] as const).map((opt) => (
                <button
                    key={opt}
                    onClick={() => onChange(opt)}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200",
                        value === opt
                            ? opt === "yes"
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                                : "bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                            : "bg-slate-900/40 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                    )}
                >
                    {value === opt ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    {opt === "yes" ? "Yes" : "No"}
                </button>
            ))}
        </div>
    );
}

function DropdownInput({ value, onChange, options }: { value: any; onChange: (v: any) => void; options: string[] }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between w-full max-w-md px-4 py-2.5 rounded-xl border text-sm transition-all",
                    value
                        ? "bg-slate-800/60 border-blue-500/30 text-slate-200"
                        : "bg-slate-900/40 border-slate-700/50 text-slate-500 hover:border-slate-600"
                )}
            >
                <span>{value || "Select an option..."}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-20 mt-1 w-full max-w-md bg-slate-800/95 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-2xl overflow-hidden"
                    >
                        {options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className={cn(
                                    "w-full text-left px-4 py-2.5 text-sm transition-colors",
                                    value === opt
                                        ? "bg-blue-500/10 text-blue-400"
                                        : "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
                                )}
                            >
                                {opt}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function TextInput({ value, onChange, placeholder }: { value: any; onChange: (v: any) => void; placeholder?: string }) {
    return (
        <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Type your answer..."}
            className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
        />
    );
}

function TextareaInput({ value, onChange, placeholder }: { value: any; onChange: (v: any) => void; placeholder?: string }) {
    return (
        <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Provide additional details..."}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none h-24"
        />
    );
}

function MultiSelectInput({ value, onChange, options }: { value: any; onChange: (v: any) => void; options: string[] }) {
    const selected: string[] = value || [];
    const toggle = (opt: string) => {
        onChange(selected.includes(opt) ? selected.filter((s: string) => s !== opt) : [...selected, opt]);
    };
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
                const isSelected = selected.includes(opt);
                return (
                    <button
                        key={opt}
                        onClick={() => toggle(opt)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200",
                            isSelected
                                ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.12)]"
                                : "bg-slate-900/40 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                        )}
                    >
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                        {opt}
                    </button>
                );
            })}
        </div>
    );
}

function RadioInput({ value, onChange, options }: { value: any; onChange: (v: any) => void; options: string[] }) {
    return (
        <div className="flex flex-col space-y-2 max-w-md">
            {options.map((opt) => (
                <button
                    key={opt}
                    onClick={() => onChange(opt)}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 text-left",
                        value === opt
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                            : "bg-slate-900/40 border-slate-800/50 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                    )}
                >
                    <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                        value === opt ? "border-blue-400" : "border-slate-600"
                    )}>
                        {value === opt && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                    </div>
                    {opt}
                </button>
            ))}
        </div>
    );
}

function SliderInput({ value, onChange, min = 1, max = 5, labels }: { value: any; onChange: (v: any) => void; min?: number; max?: number; step?: number; labels?: string[] }) {
    const current = value || min;
    return (
        <div className="max-w-lg">
            <div className="flex items-center justify-between mb-3">
                <button onClick={() => onChange(Math.max(min, current - 1))} className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors">
                    <Minus className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <div className="flex-1 mx-4 relative">
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                            animate={{ width: `${((current - min) / (max - min)) * 100}%` }}
                            transition={{ duration: 0.2 }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((tick) => (
                            <button
                                key={tick}
                                onClick={() => onChange(tick)}
                                className={cn(
                                    "flex flex-col items-center transition-colors cursor-pointer",
                                    current === tick ? "text-blue-400" : "text-slate-600 hover:text-slate-400"
                                )}
                            >
                                <div className={cn("w-2 h-2 rounded-full mt-1 transition-all", current === tick ? "bg-blue-400 scale-125" : "bg-slate-700")} />
                                <span className="text-[9px] mt-1 font-mono font-bold">{tick}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={() => onChange(Math.min(max, current + 1))} className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors">
                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                </button>
            </div>
            {labels && labels[current - min] && (
                <motion.div
                    key={current}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                        Level {current}: {labels[current - min]}
                    </span>
                </motion.div>
            )}
        </div>
    );
}

function DateInput({ value, onChange }: { value: any; onChange: (v: any) => void }) {
    return (
        <div className="relative max-w-xs">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
                type="date"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all [color-scheme:dark]"
            />
        </div>
    );
}

function FileUploadInput({ value, onChange }: { value: any; onChange: (v: any) => void }) {
    return (
        <div
            onClick={() => onChange("file_uploaded")}
            className={cn(
                "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group max-w-md",
                value
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : "bg-slate-900/30 border-slate-700/50 hover:border-blue-500/40 hover:bg-slate-800/20"
            )}
        >
            {value ? (
                <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                    <span className="text-sm font-semibold text-emerald-400">File Uploaded</span>
                    <span className="text-xs text-slate-500 mt-1">Click to replace</span>
                </>
            ) : (
                <>
                    <Upload className="w-8 h-8 text-slate-500 mb-2 group-hover:text-blue-400 transition-colors" />
                    <span className="text-sm font-medium text-slate-300">Drop file here or click to upload</span>
                    <span className="text-xs text-slate-500 mt-1">PDF, DOCX, XLSX, JSON · Max 10MB</span>
                </>
            )}
        </div>
    );
}

function ToggleInput({ value, onChange }: { value: any; onChange: (v: any) => void }) {
    const isOn = value === true;
    return (
        <button
            onClick={() => onChange(!isOn)}
            className="flex items-center gap-3 group"
        >
            <div className={cn(
                "relative w-12 h-6 rounded-full transition-all duration-300",
                isOn ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-slate-800 border border-slate-700"
            )}>
                <motion.div
                    className={cn("absolute top-0.5 w-5 h-5 rounded-full shadow-lg transition-colors", isOn ? "bg-emerald-400" : "bg-slate-500")}
                    animate={{ left: isOn ? 24 : 2 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                />
            </div>
            <span className={cn("text-sm font-medium transition-colors", isOn ? "text-emerald-400" : "text-slate-500")}>
                {isOn ? "Enabled" : "Disabled"}
            </span>
        </button>
    );
}

function QuestionInput({ question, value, onChange }: { question: Question; value: any; onChange: (v: any) => void }) {
    switch (question.type) {
        case "yes_no": return <YesNoInput value={value} onChange={onChange} />;
        case "dropdown": return <DropdownInput value={value} onChange={onChange} options={question.options || []} />;
        case "text": return <TextInput value={value} onChange={onChange} placeholder={question.placeholder} />;
        case "textarea": return <TextareaInput value={value} onChange={onChange} placeholder={question.placeholder} />;
        case "multi_select": return <MultiSelectInput value={value} onChange={onChange} options={question.options || []} />;
        case "radio": return <RadioInput value={value} onChange={onChange} options={question.options || []} />;
        case "slider": return <SliderInput value={value} onChange={onChange} min={question.min} max={question.max} step={question.step} labels={question.labels} />;
        case "date": return <DateInput value={value} onChange={onChange} />;
        case "file_upload": return <FileUploadInput value={value} onChange={onChange} />;
        case "toggle": return <ToggleInput value={value} onChange={onChange} />;
        default: return null;
    }
}

// Type badge colors
const typeBadges: Record<QuestionType, { label: string; color: string }> = {
    yes_no: { label: "Yes / No", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    dropdown: { label: "Dropdown", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    text: { label: "Text", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
    textarea: { label: "Long Text", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
    multi_select: { label: "Multi-Select", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
    radio: { label: "Single Choice", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    slider: { label: "Scale", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
    date: { label: "Date", color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
    file_upload: { label: "File Upload", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
    toggle: { label: "Toggle", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
};

// ------ Circular Progress Ring ------
function CircularProgressRing({ value, size = 56, strokeWidth = 4, color }: { value: number; size?: number; strokeWidth?: number; color: string }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-slate-800" />
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />
        </svg>
    );
}

// ------ Main Page ------
export default function QuestionnairePage() {
    const [activeSection, setActiveSection] = useState("Cloud Infrastructure");
    const [answers, setAnswers] = useState<Record<string, any>>({});

    const currentSection = sectionsData.find(s => s.name === activeSection) || sectionsData[0];

    const answeredCount = useCallback((sectionName: string) => {
        const section = sectionsData.find(s => s.name === sectionName);
        if (!section) return 0;
        return section.questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== "").length;
    }, [answers]);

    const totalAnswered = sectionsData.reduce((sum, s) => sum + s.questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== "").length, 0);
    const totalQuestions = sectionsData.reduce((sum, s) => sum + s.questions.length, 0);

    // Simulated Live Impact metrics
    const soc2Progress = Math.min(100, Math.round(32 + (totalAnswered / totalQuestions) * 68));
    const isoProgress = Math.min(100, Math.round(25 + (totalAnswered / totalQuestions) * 45));
    const riskScore = Math.max(0, Math.round(78 - (totalAnswered / totalQuestions) * 40));

    // Recent activity
    const recentKeys = Object.keys(answers).slice(-3).reverse();
    const recentActivity = recentKeys.map(key => {
        const q = sectionsData.flatMap(s => s.questions).find(q => q.id === key);
        return q ? { id: q.id, text: q.text.slice(0, 40) + "...", time: "Just now" } : null;
    }).filter(Boolean);

    return (
        <div className="w-full flex flex-col space-y-6 animate-in fade-in duration-700 h-full">
            {/* Header */}
            <div className="flex items-center text-sm font-mono text-slate-400 tracking-wide">
                <Link href="/" className="hover:text-slate-200 cursor-pointer transition-colors flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Assessment
                </Link>
            </div>

            <div className="flex flex-col mb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Questionnaire</h1>
                        <p className="text-slate-400 mt-1">Answer questions to assess your compliance posture</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-slate-100">{totalAnswered}<span className="text-slate-500 text-lg">/{totalQuestions}</span></div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Completed</div>
                        </div>
                        <CircularProgressRing value={(totalAnswered / totalQuestions) * 100} size={48} strokeWidth={3} color="#3b82f6" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 flex-1">
                {/* Left Sidebar — Sections */}
                <div className="w-full lg:w-64 shrink-0 flex flex-col space-y-2">
                    {sectionsData.map((section) => {
                        const isActive = activeSection === section.name;
                        const answered = answeredCount(section.name);
                        const pct = Math.round((answered / section.questions.length) * 100);
                        return (
                            <button
                                key={section.name}
                                onClick={() => setActiveSection(section.name)}
                                className={cn(
                                    "flex flex-col text-left px-4 py-3 rounded-xl transition-all border",
                                    isActive
                                        ? "bg-slate-800/60 border-slate-700/50 shadow-glow"
                                        : "hover:bg-slate-800/30 border-transparent"
                                )}
                            >
                                <span className={cn("text-sm font-medium", isActive ? "text-blue-400" : "text-slate-300")}>
                                    {section.name}
                                </span>
                                <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                                    <motion.div
                                        className={cn("h-full transition-all duration-500", pct === 100 ? "bg-emerald-500" : isActive ? "bg-blue-500" : "bg-slate-600")}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <span className="text-[10px] font-mono mt-1 self-end text-slate-500">
                                    {answered}/{section.questions.length}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Center Canvas — Questions */}
                <div className="flex-1 glass-panel rounded-2xl p-6 lg:p-8 flex flex-col min-h-[600px]">
                    <div className="flex justify-between items-start mb-8 border-b border-slate-800/50 pb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-100">{currentSection.name}</h2>
                            <p className="text-sm text-slate-400 mt-1 max-w-xl">{currentSection.description}</p>
                        </div>
                        <div className="text-xs font-mono bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                            <span className="text-slate-100">{answeredCount(activeSection)}/{currentSection.questions.length}</span> <span className="text-slate-400">answered</span>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-8 flex-1 overflow-y-auto no-scrollbar">
                        {currentSection.questions.map((q, idx) => (
                            <motion.div
                                key={q.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.06 }}
                                className="flex flex-col space-y-3"
                            >
                                <div className="flex items-start gap-4">
                                    <span className="text-xs font-mono text-slate-500 mt-1 whitespace-nowrap">{q.id}</span>
                                    <div className="flex flex-col space-y-3 w-full">
                                        <div className="flex items-start justify-between">
                                            <p className="text-[15px] font-medium text-slate-200 leading-snug">
                                                {q.text} {q.required && <span className="text-red-400">*</span>}
                                            </p>
                                            <span className={cn("text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ml-3 whitespace-nowrap flex-shrink-0", typeBadges[q.type].color)}>
                                                {typeBadges[q.type].label}
                                            </span>
                                        </div>

                                        <QuestionInput
                                            question={q}
                                            value={answers[q.id]}
                                            onChange={(v) => setAnswers(prev => ({ ...prev, [q.id]: v }))}
                                        />
                                    </div>
                                </div>

                                {idx !== currentSection.questions.length - 1 && (
                                    <div className="h-px w-full bg-slate-800/50 my-2" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Live Impact Panel */}
                <div className="w-full lg:w-80 shrink-0">
                    <div className="glass-panel border-blue-500/20 rounded-2xl p-5 shadow-glow sticky top-6 space-y-6">
                        {/* Header */}
                        <h3 className="text-sm font-semibold text-blue-400 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                Live Impact
                            </span>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                            </span>
                        </h3>

                        {/* Framework Progress Rings */}
                        <div className="space-y-4">
                            {[
                                { name: "SOC 2 Type II", progress: soc2Progress, delta: totalAnswered > 0 ? `+${Math.round((totalAnswered / totalQuestions) * 8)}%` : "—", color: "#10b981", controls: `${Math.round(soc2Progress * 0.51)}/51` },
                                { name: "ISO 27001", progress: isoProgress, delta: totalAnswered > 2 ? `+${Math.round((totalAnswered / totalQuestions) * 5)}%` : "Unchanged", color: "#3b82f6", controls: `${Math.round(isoProgress * 0.93)}/93` },
                            ].map((fw) => (
                                <div key={fw.name} className="flex items-center gap-4">
                                    <div className="relative">
                                        <CircularProgressRing value={fw.progress} size={52} strokeWidth={4} color={fw.color} />
                                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-200">
                                            {fw.progress}%
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-300 truncate">{fw.name}</span>
                                            <span className={cn("text-[10px] font-bold", fw.delta.startsWith("+") ? "text-emerald-400" : "text-slate-500")}>{fw.delta}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500">{fw.controls} controls</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="h-px bg-slate-800/50" />

                        {/* Risk Score */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Risk Score</span>
                                <span className={cn("text-xs font-bold", riskScore > 50 ? "text-amber-400" : "text-emerald-400")}>
                                    {riskScore > 50 ? "Medium" : "Low"}
                                </span>
                            </div>
                            <div className="relative">
                                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className={cn("h-full rounded-full", riskScore > 60 ? "bg-gradient-to-r from-amber-500 to-red-500" : riskScore > 30 ? "bg-gradient-to-r from-emerald-500 to-amber-400" : "bg-emerald-500")}
                                        animate={{ width: `${riskScore}%` }}
                                        transition={{ duration: 0.6 }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1 text-[9px] text-slate-600 font-mono">
                                    <span>0</span>
                                    <span>50</span>
                                    <span>100</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-800/50" />

                        {/* Controls Coverage */}
                        <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3 block">Controls Coverage</span>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: "Satisfied", count: Math.round(totalAnswered * 1.5), color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                                    { label: "Partial", count: Math.round(totalAnswered * 0.8), color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                                    { label: "Gaps", count: Math.max(0, 12 - totalAnswered), color: "text-red-400 bg-red-500/10 border-red-500/20" },
                                ].map((item) => (
                                    <div key={item.label} className={cn("flex flex-col items-center py-2 rounded-lg border", item.color)}>
                                        <span className="text-lg font-bold">{item.count}</span>
                                        <span className="text-[9px] font-semibold uppercase tracking-wider">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-slate-800/50" />

                        {/* Recent Activity */}
                        <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Recent Activity</span>
                            {recentActivity.length === 0 ? (
                                <p className="text-xs text-slate-600 italic">No answers yet — start responding to see live updates</p>
                            ) : (
                                <div className="space-y-2">
                                    {recentActivity.map((item: any) => (
                                        <div key={item.id} className="flex items-start gap-2">
                                            <Clock className="w-3 h-3 text-slate-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[11px] text-slate-400 truncate">{item.text}</span>
                                                <span className="text-[9px] text-slate-600">{item.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
