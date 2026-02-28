"use client";

import React, { useState } from "react";
import {
    GraduationCap, PlayCircle, Users, Clock, BookOpen,
    CheckCircle2, ChevronRight, X, Send, Shield,
    Lock, Eye, AlertTriangle, Database, FileText
} from "lucide-react";

interface TrainingModule {
    id: string;
    title: string;
    description: string;
    duration: string;
    slides: number;
    topics: string[];
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    content: { slide: number; title: string; body: string }[];
}

const MODULES: TrainingModule[] = [
    {
        id: "security-fundamentals",
        title: "Security Awareness Fundamentals",
        description: "Core security concepts every employee must understand — threats, safe practices, and reporting obligations.",
        duration: "20 min",
        slides: 10,
        topics: ["Threat Landscape", "Social Engineering", "Incident Reporting", "Safe Browsing"],
        icon: Shield,
        color: "blue",
        content: [
            { slide: 1, title: "Why Security Matters", body: "Cyber threats cost organizations millions annually. Every employee is the first line of defense." },
            { slide: 2, title: "Common Threats", body: "Phishing, malware, ransomware, and insider threats are the top attack vectors facing companies today." },
            { slide: 3, title: "Social Engineering", body: "Attackers manipulate people rather than systems. Always verify identities before sharing information." },
            { slide: 4, title: "Safe Email Practices", body: "Never click unexpected links. Verify sender addresses. Report suspicious emails to IT immediately." },
            { slide: 5, title: "Password Hygiene", body: "Use unique passwords for every account. Enable MFA wherever possible. Never share credentials." },
            { slide: 6, title: "Safe Browsing", body: "Avoid unverified downloads. Use company-approved tools only. Keep software updated." },
            { slide: 7, title: "Physical Security", body: "Lock screens when stepping away. Shred sensitive documents. Challenge unfamiliar visitors." },
            { slide: 8, title: "Remote Work Security", body: "Use VPN on public networks. Do not work in public on sensitive data. Secure your home router." },
            { slide: 9, title: "Incident Reporting", body: "Report any suspected breach immediately to your security team. Early reporting minimizes damage." },
            { slide: 10, title: "Your Responsibility", body: "Security is everyone's job. You are accountable for protecting company and customer data." },
        ],
    },
    {
        id: "data-privacy",
        title: "Data Privacy & Compliance",
        description: "Understanding GDPR, data handling obligations, and your role in protecting personal information.",
        duration: "15 min",
        slides: 8,
        topics: ["GDPR Basics", "Data Classification", "Retention Policies", "Customer Rights"],
        icon: Database,
        color: "purple",
        content: [
            { slide: 1, title: "What is Personal Data?", body: "Names, emails, IPs, and behavioral data are all personal data under GDPR and similar regulations." },
            { slide: 2, title: "Lawful Basis for Processing", body: "You must have a legal reason to process personal data — consent, contract, legal obligation, or legitimate interest." },
            { slide: 3, title: "Data Classification", body: "Classify data as Public, Internal, Confidential, or Restricted. Handle each tier accordingly." },
            { slide: 4, title: "Data Minimization", body: "Collect only what you need. Do not store data longer than necessary. Less data = less risk." },
            { slide: 5, title: "Customer Rights", body: "Users have the right to access, correct, delete, and port their data. Requests must be fulfilled within 30 days." },
            { slide: 6, title: "Breach Notification", body: "A personal data breach must be reported to regulators within 72 hours. Notify affected individuals promptly." },
            { slide: 7, title: "Third-Party Sharing", body: "Only share personal data with vendors who have signed a Data Processing Agreement (DPA)." },
            { slide: 8, title: "Your Obligations", body: "You are personally responsible for handling data you access. Violations can result in significant fines." },
        ],
    },
    {
        id: "phishing",
        title: "Phishing & Social Engineering",
        description: "Recognize and respond to phishing emails, vishing calls, and pretexting attacks.",
        duration: "25 min",
        slides: 12,
        topics: ["Email Phishing", "Smishing", "Vishing", "Spear Phishing", "Pretexting"],
        icon: AlertTriangle,
        color: "orange",
        content: [
            { slide: 1, title: "The Human Element", body: "90% of breaches involve human error. Attackers exploit trust, urgency, and authority." },
            { slide: 2, title: "What is Phishing?", body: "Phishing is a deceptive attempt to obtain credentials or data by impersonating a trusted entity via email." },
            { slide: 3, title: "Red Flags in Emails", body: "Unexpected urgency, mismatched sender domains, generic greetings, and suspicious attachments are warning signs." },
            { slide: 4, title: "Spear Phishing", body: "Targeted attacks using your name, role, or company details. Far more convincing than bulk phishing." },
            { slide: 5, title: "Smishing (SMS Phishing)", body: "Fraudulent text messages impersonating banks, couriers, or IT. Never click links in unexpected SMS messages." },
            { slide: 6, title: "Vishing (Voice Phishing)", body: "Attackers call pretending to be IT support or executives. Always verify via a separate channel." },
            { slide: 7, title: "Pretexting", body: "Creating a fabricated scenario to extract information. 'I'm from auditing and need your password' is never legitimate." },
            { slide: 8, title: "Business Email Compromise", body: "Attackers impersonate executives to authorize fraudulent wire transfers. Always verify financial requests in person." },
            { slide: 9, title: "What To Do If Targeted", body: "Do not engage. Do not click. Forward the email to security@company.com and delete it." },
            { slide: 10, title: "Reporting Phishing", body: "Use the 'Report Phishing' button in your email client. Every report helps protect the entire organization." },
            { slide: 11, title: "Real-World Examples", body: "The 2020 Twitter hack, 2021 Colonial Pipeline attack, and countless others started with a phishing email." },
            { slide: 12, title: "Stay Vigilant", body: "When in doubt, don't click. A moment of caution can prevent months of incident response." },
        ],
    },
    {
        id: "password-mfa",
        title: "Password Security & MFA",
        description: "Best practices for strong credentials, password managers, and enabling multi-factor authentication.",
        duration: "10 min",
        slides: 6,
        topics: ["Strong Passwords", "Password Managers", "MFA Setup", "Credential Hygiene"],
        icon: Lock,
        color: "green",
        content: [
            { slide: 1, title: "Why Passwords Fail", body: "Short, reused, or simple passwords are cracked in seconds. Credential stuffing attacks use breached passwords across sites." },
            { slide: 2, title: "Strong Password Rules", body: "Use 12+ characters, mixing upper/lower case, numbers, and symbols. Avoid dictionary words, names, or dates." },
            { slide: 3, title: "Password Managers", body: "Use a company-approved password manager (1Password, Bitwarden). One strong master password protects all others." },
            { slide: 4, title: "Never Reuse Passwords", body: "Each account must have a unique password. If one service is breached, all your other accounts stay safe." },
            { slide: 5, title: "Multi-Factor Authentication", body: "Enable MFA on all accounts. An attacker with your password still cannot log in without your second factor." },
            { slide: 6, title: "Action Items", body: "Enable MFA today. Install the approved password manager. Change any reused passwords immediately." },
        ],
    },
    {
        id: "acceptable-use",
        title: "Acceptable Use Policy",
        description: "Understand what is and isn't allowed when using company systems, devices, and data.",
        duration: "12 min",
        slides: 7,
        topics: ["Device Policy", "Internet Use", "Data Handling", "BYOD Rules", "Consequences"],
        icon: FileText,
        color: "slate",
        content: [
            { slide: 1, title: "Company Systems Are For Work", body: "Company devices, email, and systems are provided for business use. Personal use is limited and monitored." },
            { slide: 2, title: "Internet Use Policy", body: "Accessing illegal, inappropriate, or unauthorized content on company networks is prohibited and logged." },
            { slide: 3, title: "Data Handling Rules", body: "Do not copy sensitive data to personal devices or cloud storage not approved by IT." },
            { slide: 4, title: "BYOD Policy", body: "Personal devices used for work must be enrolled in MDM. Company data on personal devices is subject to remote wipe." },
            { slide: 5, title: "Software Installation", body: "Do not install unauthorized software on company devices. All software must be approved by IT." },
            { slide: 6, title: "Monitoring", body: "Company systems are monitored for security purposes. You have no expectation of privacy on company devices." },
            { slide: 7, title: "Consequences", body: "Violations may result in disciplinary action up to and including termination, and legal consequences in serious cases." },
        ],
    },
    {
        id: "incident-reporting",
        title: "Incident Reporting Procedures",
        description: "Know what constitutes a security incident and how to report it quickly and correctly.",
        duration: "10 min",
        slides: 6,
        topics: ["What's an Incident", "Reporting Channels", "Response Timelines", "Do's and Don'ts"],
        icon: Eye,
        color: "red",
        content: [
            { slide: 1, title: "What is a Security Incident?", body: "Any event that could compromise the confidentiality, integrity, or availability of company data or systems." },
            { slide: 2, title: "Examples of Incidents", body: "Lost devices, suspicious emails clicked, unauthorized access, data shared with wrong person, ransomware pop-ups." },
            { slide: 3, title: "Report Immediately", body: "Do not wait to see if it 'resolves itself'. Early reporting is always better. There is no penalty for reporting in good faith." },
            { slide: 4, title: "How to Report", body: "Email security@company.com, call the security hotline, or use the ticketing system. Include what happened and when." },
            { slide: 5, title: "What Not To Do", body: "Do not try to investigate or remediate yourself. Do not discuss the incident externally. Preserve evidence — don't wipe devices." },
            { slide: 6, title: "After Reporting", body: "The security team will guide next steps. Your cooperation is essential. All reports are treated confidentially." },
        ],
    },
];

const COLOR_MAP: Record<string, { bg: string; border: string; icon: string; badge: string; btn: string }> = {
    blue: {
        bg: "from-blue-500/5 to-blue-500/0",
        border: "border-blue-500/20 hover:border-blue-500/40",
        icon: "text-blue-400 bg-blue-500/10",
        badge: "bg-blue-500/10 text-blue-400",
        btn: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20",
    },
    purple: {
        bg: "from-purple-500/5 to-purple-500/0",
        border: "border-purple-500/20 hover:border-purple-500/40",
        icon: "text-purple-400 bg-purple-500/10",
        badge: "bg-purple-500/10 text-purple-400",
        btn: "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20",
    },
    orange: {
        bg: "from-orange-500/5 to-orange-500/0",
        border: "border-orange-500/20 hover:border-orange-500/40",
        icon: "text-orange-400 bg-orange-500/10",
        badge: "bg-orange-500/10 text-orange-400",
        btn: "bg-orange-600 hover:bg-orange-500 shadow-orange-500/20",
    },
    green: {
        bg: "from-emerald-500/5 to-emerald-500/0",
        border: "border-emerald-500/20 hover:border-emerald-500/40",
        icon: "text-emerald-400 bg-emerald-500/10",
        badge: "bg-emerald-500/10 text-emerald-400",
        btn: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20",
    },
    slate: {
        bg: "from-slate-500/5 to-slate-500/0",
        border: "border-slate-500/20 hover:border-slate-600/40",
        icon: "text-slate-300 bg-slate-500/10",
        badge: "bg-slate-500/10 text-slate-300",
        btn: "bg-slate-600 hover:bg-slate-500 shadow-slate-500/20",
    },
    red: {
        bg: "from-red-500/5 to-red-500/0",
        border: "border-red-500/20 hover:border-red-500/40",
        icon: "text-red-400 bg-red-500/10",
        badge: "bg-red-500/10 text-red-400",
        btn: "bg-red-600 hover:bg-red-500 shadow-red-500/20",
    },
};

export default function TrainingPage() {
    const [assigned, setAssigned] = useState<Set<string>>(new Set());
    const [previewModule, setPreviewModule] = useState<TrainingModule | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [assignTarget, setAssignTarget] = useState<TrainingModule | null>(null);
    const [assignSent, setAssignSent] = useState(false);

    function handleAssign(mod: TrainingModule) {
        setAssignTarget(mod);
        setAssignSent(false);
    }

    function confirmAssign() {
        if (!assignTarget) return;
        setAssigned(prev => new Set([...prev, assignTarget.id]));
        setAssignSent(true);
        setTimeout(() => setAssignTarget(null), 1800);
    }

    function openPreview(mod: TrainingModule) {
        setPreviewModule(mod);
        setCurrentSlide(0);
    }

    const totalAssigned = assigned.size;

    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <GraduationCap className="w-8 h-8 mr-3 text-emerald-500" />
                        Security Awareness Training
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">
                        Assign compliance training modules to employees. Track acknowledgement and completion.
                    </p>
                </div>
                {totalAssigned > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-300">
                            {totalAssigned} module{totalAssigned > 1 ? "s" : ""} assigned
                        </span>
                    </div>
                )}
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Modules Available", value: MODULES.length, icon: BookOpen, color: "text-blue-400" },
                    { label: "Assigned to Org", value: totalAssigned, icon: Users, color: "text-emerald-400" },
                    { label: "Total Training Time", value: "92 min", icon: Clock, color: "text-purple-400" },
                ].map(stat => (
                    <div key={stat.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-100">{stat.value}</div>
                            <div className="text-xs text-slate-500">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Course Library */}
            <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Course Library</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {MODULES.map(mod => {
                        const c = COLOR_MAP[mod.color];
                        const isAssigned = assigned.has(mod.id);
                        return (
                            <div
                                key={mod.id}
                                className={`relative bg-gradient-to-br ${c.bg} bg-slate-900/60 border ${c.border} rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200`}
                            >
                                {/* Assigned badge */}
                                {isAssigned && (
                                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                        <span className="text-[11px] font-medium text-emerald-400">Assigned</span>
                                    </div>
                                )}

                                {/* Icon + Title */}
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
                                        <mod.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-16">
                                        <h3 className="text-sm font-semibold text-slate-100 leading-snug">{mod.title}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />{mod.duration}
                                            </span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <BookOpen className="w-3 h-3" />{mod.slides} slides
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-xs text-slate-400 leading-relaxed">{mod.description}</p>

                                {/* Topic tags */}
                                <div className="flex flex-wrap gap-1.5">
                                    {mod.topics.map(t => (
                                        <span key={t} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.badge}`}>
                                            {t}
                                        </span>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-auto pt-1">
                                    <button
                                        onClick={() => openPreview(mod)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
                                    >
                                        <PlayCircle className="w-3.5 h-3.5" />
                                        Preview
                                    </button>
                                    <button
                                        onClick={() => handleAssign(mod)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-white text-xs font-medium transition-all shadow-lg ${c.btn}`}
                                    >
                                        <Users className="w-3.5 h-3.5" />
                                        {isAssigned ? "Re-assign" : "Assign to All"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Slide Preview Modal ── */}
            {previewModule && (() => {
                const slide = previewModule.content[currentSlide];
                const c = COLOR_MAP[previewModule.color];
                const isLast = currentSlide === previewModule.slides - 1;
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                            {/* Modal header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.icon}`}>
                                        <previewModule.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-100">{previewModule.title}</div>
                                        <div className="text-xs text-slate-500">Slide {currentSlide + 1} of {previewModule.slides}</div>
                                    </div>
                                </div>
                                <button onClick={() => setPreviewModule(null)} className="text-slate-500 hover:text-slate-300 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Progress bar */}
                            <div className="h-1 bg-slate-800">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-300"
                                    style={{ width: `${((currentSlide + 1) / previewModule.slides) * 100}%` }}
                                />
                            </div>

                            {/* Slide content */}
                            <div className="flex-1 px-8 py-10 flex flex-col items-center justify-center text-center min-h-[220px]">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${c.icon}`}>
                                    <previewModule.icon className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-100 mb-3">{slide.title}</h2>
                                <p className="text-slate-400 text-sm leading-relaxed max-w-lg">{slide.body}</p>
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
                                <button
                                    onClick={() => setCurrentSlide(s => Math.max(0, s - 1))}
                                    disabled={currentSlide === 0}
                                    className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm disabled:opacity-30 hover:bg-slate-800 transition-colors"
                                >
                                    Back
                                </button>
                                <div className="flex gap-1.5">
                                    {Array.from({ length: previewModule.slides }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentSlide(i)}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentSlide ? "bg-blue-400 w-4" : "bg-slate-700 hover:bg-slate-500"}`}
                                        />
                                    ))}
                                </div>
                                {isLast ? (
                                    <button
                                        onClick={() => { setPreviewModule(null); handleAssign(previewModule); }}
                                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium flex items-center gap-1.5 transition-colors"
                                    >
                                        <Users className="w-4 h-4" /> Assign to All
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setCurrentSlide(s => Math.min(previewModule.slides - 1, s + 1))}
                                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm flex items-center gap-1.5 transition-colors"
                                    >
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── Assign Confirmation Modal ── */}
            {assignTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
                        {assignSent ? (
                            <div className="text-center py-4">
                                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-100">Training Assigned!</h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    All employees have been notified about <span className="text-slate-200 font-medium">{assignTarget.title}</span>.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-base font-semibold text-slate-100">Assign Training to All Employees</h3>
                                    <button onClick={() => setAssignTarget(null)} className="text-slate-500 hover:text-slate-300">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="bg-slate-800/60 rounded-xl p-4 mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${COLOR_MAP[assignTarget.color].icon}`}>
                                            <assignTarget.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-100">{assignTarget.title}</div>
                                            <div className="text-xs text-slate-500">{assignTarget.duration} · {assignTarget.slides} slides</div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-400 mb-6">
                                    This will notify all members of your organization to complete this training module. They will receive an email with a link to the training.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setAssignTarget(null)}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmAssign}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
                                    >
                                        <Send className="w-4 h-4" />
                                        Publish & Notify
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
