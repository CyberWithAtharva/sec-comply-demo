"use client";

import React, { Fragment, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
    X, FilePlus2, ArrowLeft, ArrowRight, Check, FileText, ShieldCheck,
    UploadCloud, Eye, Plus, Sparkles, RefreshCcw, Loader2, CircleCheckBig,
    Info, Heading2, List, Variable, Link2, FileType, FileCode2, HardDrive,
    SignalHigh,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/Card";
import { FRAMEWORKS, FRAMEWORK_CLASSES, CATEGORIES } from "./policy-shared";

interface Props {
    onClose: () => void;
    onComplete: (policyId: string) => void;
}

type ParsedRun = { text: string; chip?: string };
type ParsedPart = { type: "p"; runs: ParsedRun[] } | { type: "ul"; items: string[] };
interface ParsedSection {
    id: string;
    heading: string;
    confidence: number;
    parts: ParsedPart[];
}

const FALLBACK_SECTIONS: ParsedSection[] = [
    { id: "purpose", heading: "1. Purpose", confidence: 98, parts: [{ type: "p", runs: [
        { text: "This policy establishes how " },
        { text: "Acme Technologies", chip: "[Organisation_Name]" },
        { text: " governs the acceptable use of generative AI tools to protect confidentiality, intellectual property, and regulatory obligations." },
    ]}]},
    { id: "scope", heading: "2. Scope", confidence: 95, parts: [{ type: "p", runs: [
        { text: "Applies to every employee, contractor, and third party with access to " },
        { text: "Acme Technologies", chip: "[Organisation_Name]" },
        { text: " systems and data. Owned and reviewed by the CISO (" },
        { text: "Ravi Mehta", chip: "[CISO]" },
        { text: ")." },
    ]}]},
    { id: "rules", heading: "3. Acceptable Use Rules", confidence: 91, parts: [
        { type: "p", runs: [{ text: "The following uses are explicitly permitted, provided no confidential or customer data is shared with public models:" }] },
        { type: "ul", items: [
            "Drafting internal communications and summaries.",
            "Brainstorming, ideation, and outlining for non-confidential work.",
            "Generating boilerplate code for review by an engineer.",
            "Translation of public-facing material.",
        ]},
    ]},
    { id: "prohibited", heading: "4. Prohibited Uses", confidence: 93, parts: [
        { type: "ul", items: [
            "Uploading confidential, customer, or regulated data to public LLMs.",
            "Generating code that touches production secrets without review.",
            "Auto-publishing AI output to customer-facing surfaces without human approval.",
        ]},
    ]},
    { id: "incident", heading: "5. Incident Reporting", confidence: 88, parts: [{ type: "p", runs: [
        { text: "Suspected misuse must be reported to " },
        { text: "security@acme.tech", chip: "[Security_Email]" },
        { text: " within 24 hours. Major incidents trigger the Incident Response Plan with a target RTO of " },
        { text: "4 hours", chip: "[RTO]" },
        { text: "." },
    ]}]},
    { id: "training", heading: "6. Training & Awareness", confidence: 72, parts: [{ type: "p", runs: [
        { text: "All personnel complete mandatory AI safety training within 30 days of joining and annually thereafter. Training records are maintained in Overwatch." },
    ]}]},
];

const CONTROL_SUGGESTIONS: Record<string, string[]> = {
    iso: ["A.5.1", "A.5.10", "A.5.12", "A.5.15", "A.5.23", "A.6.3", "A.8.1", "A.8.16"],
    soc2: ["CC1.1", "CC2.2", "CC5.3", "CC6.1", "CC6.6", "CC7.2", "CC8.1"],
    hipaa: ["§164.308(a)(1)", "§164.308(a)(5)", "§164.312(a)", "§164.502"],
    gdpr: ["Art. 5", "Art. 6", "Art. 24", "Art. 32", "Art. 35"],
    dpdp: ["S. 4", "S. 6", "S. 8", "S. 11"],
};

const controlPlaceholder: Record<string, string> = {
    iso: "e.g. A.5.1",
    soc2: "e.g. CC1.1",
    hipaa: "e.g. §164.308(a)(1)",
    gdpr: "e.g. Art. 5",
    dpdp: "e.g. S. 8",
};

const STEPS = [
    { n: 1, label: "About this policy",      icon: FileText,     sub: "Title, category, description" },
    { n: 2, label: "Frameworks & controls",  icon: ShieldCheck,  sub: "What does this satisfy?" },
    { n: 3, label: "Upload template",        icon: UploadCloud,  sub: "Bring your existing doc" },
    { n: 4, label: "Review parsing",         icon: Eye,          sub: "Confirm what we extracted" },
] as const;

export function CustomPolicyWizardModal({ onClose, onComplete }: Props) {
    const [step, setStep] = useState(1);

    // Step 1
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<typeof CATEGORIES[number]>("Governance");
    const [policyType, setPolicyType] = useState<"Policy" | "Procedure" | "Standard" | "SOP">("Policy");
    const [description, setDescription] = useState("");
    const [whyNeeded, setWhyNeeded] = useState("");

    // Step 2
    const [frameworks, setFrameworks] = useState<string[]>([]);
    const [controls, setControls] = useState<Record<string, string[]>>({});
    const [controlDraft, setControlDraft] = useState<Record<string, string>>({});
    const [activeFw, setActiveFw] = useState<string | null>(null);

    // Step 3
    const [file, setFile] = useState<{ name: string; size: number; type: string } | null>(null);
    const [parsing, setParsing] = useState(false);
    const [parseProgress, setParseProgress] = useState(0);
    const [parseStage, setParseStage] = useState("");
    const [parsed, setParsed] = useState(false);
    const [parsedSections, setParsedSections] = useState<ParsedSection[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Step 4
    const [accepted, setAccepted] = useState<Record<string, boolean>>({});
    const [busy, setBusy] = useState(false);

    // ─── Step 2 helpers ───
    const toggleFw = (id: string) => {
        setFrameworks(fs => {
            if (fs.includes(id)) {
                const next = fs.filter(x => x !== id);
                setControls(c => { const n = { ...c }; delete n[id]; return n; });
                if (activeFw === id) setActiveFw(next[0] ?? null);
                return next;
            }
            const next = [...fs, id];
            if (!activeFw) setActiveFw(id);
            return next;
        });
    };

    const addControl = (fw: string) => {
        const v = (controlDraft[fw] ?? "").trim();
        if (!v) return;
        setControls(c => ({ ...c, [fw]: [...(c[fw] ?? []), v] }));
        setControlDraft(d => ({ ...d, [fw]: "" }));
    };
    const removeControl = (fw: string, code: string) => {
        setControls(c => ({ ...c, [fw]: (c[fw] ?? []).filter(x => x !== code) }));
    };

    // ─── Step 3: parse animation + content extraction ───
    const startParse = async () => {
        if (!file || parsing) return;
        setParsing(true);
        setParseProgress(0);
        setParsed(false);

        const stages = [
            { p: 18, label: "Extracting text from document…" },
            { p: 38, label: "Detecting structure (headings, sections, lists)…" },
            { p: 60, label: "Identifying variable tokens & placeholders…" },
            { p: 82, label: "Matching framework controls…" },
            { p: 100, label: "Building editor view…" },
        ];
        for (const s of stages) {
            setParseStage(s.label);
            setParseProgress(s.p);
            await new Promise(r => setTimeout(r, 540));
        }

        // For demo: use the fallback sections. Real parsing of PDF/DOCX is
        // out of scope; .md/.txt files could be parsed in the future.
        const sections = FALLBACK_SECTIONS;
        setParsedSections(sections);
        const acc: Record<string, boolean> = {};
        sections.forEach(s => { acc[s.id] = true; });
        setAccepted(acc);

        setParsing(false);
        setParsed(true);
    };

    const handleFile = (f: File | undefined) => {
        if (!f) return;
        setFile({ name: f.name, size: f.size, type: f.type });
        setParsed(false);
    };

    // ─── Validation ───
    const canAdvance = useMemo(() => {
        if (step === 1) return title.trim() && description.trim() && whyNeeded.trim();
        if (step === 2) return frameworks.length > 0;
        if (step === 3) return parsed;
        return true;
    }, [step, title, description, whyNeeded, frameworks, parsed]);

    const totalControls = Object.values(controls).reduce((s, arr) => s + arr.length, 0);

    // ─── Submit ───
    const create = async () => {
        setBusy(true);
        const includedSections = parsedSections.filter(s => accepted[s.id]);
        const content = sectionsToMarkdown(includedSections);

        const res = await fetch("/api/policies/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: title.trim(),
                category,
                policy_type: policyType,
                description: description.trim(),
                why_needed: whyNeeded.trim(),
                frameworks,
                controls,
                content,
            }),
        });
        if (res.ok) {
            const j = await res.json();
            toast.success(`Created "${title}" as draft`);
            onComplete(j.id);
        } else {
            const j = await res.json().catch(() => ({}));
            toast.error(j.error ?? "Create failed");
        }
        setBusy(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4" onClick={onClose}>
            <div onClick={e => e.stopPropagation()}
                className="bg-card border border-border rounded-2xl w-full max-w-5xl shadow-2xl my-4 flex flex-col max-h-[calc(100vh-2rem)]">
                {/* Header */}
                <div className="p-5 border-b border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <FilePlus2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Add custom policy</div>
                        <div className="text-base font-semibold text-foreground">{title || "New policy from your organisation"}</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
                </div>

                {/* Stepper */}
                <div className="p-4 border-b border-border flex items-center gap-2 overflow-x-auto">
                    {STEPS.map((s, i) => {
                        const state = step === s.n ? "active" : step > s.n ? "done" : "todo";
                        const Icon = s.icon;
                        return (
                            <Fragment key={s.n}>
                                <button
                                    onClick={() => step > s.n && setStep(s.n)}
                                    className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors min-w-0",
                                        state === "active" && "bg-primary/10 border border-primary/30",
                                        state === "done" && "border border-border hover:bg-secondary/30 cursor-pointer",
                                        state === "todo" && "border border-transparent")}
                                >
                                    <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                                        state === "active" && "bg-primary text-primary-foreground",
                                        state === "done" && "bg-emerald-500/15 text-emerald-400",
                                        state === "todo" && "bg-secondary text-muted-foreground")}>
                                        {state === "done" ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className={cn("text-xs font-medium truncate",
                                            state === "active" ? "text-foreground" : "text-muted-foreground")}>{s.label}</div>
                                        <div className="text-[10px] text-muted-foreground/70 truncate">{s.sub}</div>
                                    </div>
                                </button>
                                {i < STEPS.length - 1 && <div className={cn("h-px w-6 shrink-0", step > s.n ? "bg-emerald-400/60" : "bg-border")} />}
                            </Fragment>
                        );
                    })}
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {step === 1 && (
                        <Pane title="Tell us about this policy" sub="The basics — what is it, where does it sit in your library, and why does it exist?">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="lg:col-span-2">
                                    <Label required>Policy title</Label>
                                    <Input placeholder="e.g. AI Acceptable Use Policy" value={title} onChange={e => setTitle(e.target.value)} />
                                </div>
                                <div>
                                    <Label required>Category</Label>
                                    <select className={inputCls} value={category} onChange={e => setCategory(e.target.value as typeof CATEGORIES[number])}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <Help>Where it appears in your library.</Help>
                                </div>
                                <div>
                                    <Label required>Policy type</Label>
                                    <div className="flex gap-1.5 p-1 rounded-lg bg-secondary/40 border border-border">
                                        {(["Policy", "Procedure", "Standard", "SOP"] as const).map(t => (
                                            <button key={t} onClick={() => setPolicyType(t)}
                                                className={cn("flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors",
                                                    policyType === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                    <Help>Affects header styling and audit classification.</Help>
                                </div>
                                <div className="lg:col-span-2">
                                    <Label required>Description</Label>
                                    <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)}
                                        placeholder="One short sentence explaining what this policy is, e.g. 'Defines acceptable and prohibited uses of generative AI tools across the organisation.'"
                                        className={cn(inputCls, "resize-vertical")} />
                                    <Help>Shown on the library card and at the top of every PDF cover.</Help>
                                </div>
                                <div className="lg:col-span-2">
                                    <Label required>Why we need this policy</Label>
                                    <textarea rows={3} value={whyNeeded} onChange={e => setWhyNeeded(e.target.value)}
                                        placeholder="2–3 sentences. What risk does this address? Which frameworks require it? Who is the primary audience?"
                                        className={cn(inputCls, "resize-vertical")} />
                                    <Help>Appears in the policy detail header and on the PDF cover for auditors.</Help>
                                </div>
                            </div>
                        </Pane>
                    )}

                    {step === 2 && (
                        <Pane title="Which frameworks does this policy satisfy?" sub="Pick the frameworks first, then map specific controls under each. Press Enter to add a control.">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {FRAMEWORKS.map(fw => {
                                    const on = frameworks.includes(fw.id);
                                    const n = (controls[fw.id] ?? []).length;
                                    return (
                                        <button key={fw.id} onClick={() => toggleFw(fw.id)}
                                            className={cn("flex flex-col items-start p-3 rounded-lg border transition-colors text-left",
                                                on ? "border-primary bg-primary/10" : "border-border bg-secondary/30 hover:bg-secondary/50")}>
                                            <div className="flex items-center justify-between w-full mb-3">
                                                <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded border font-mono font-semibold text-[10px]", FRAMEWORK_CLASSES[fw.id])}>
                                                    {fw.short}
                                                </span>
                                                <div className={cn("w-5 h-5 rounded border flex items-center justify-center",
                                                    on ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                                                    {on && <Check className="w-3 h-3" />}
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-foreground">{fw.label}</div>
                                            <div className="text-[11px] text-muted-foreground mt-1">
                                                {on ? <><strong className="text-foreground">{n}</strong> control{n === 1 ? "" : "s"} mapped</> : "Not selected"}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {frameworks.length > 0 && (
                                <div className="mt-5 rounded-lg border border-border bg-secondary/20">
                                    <div className="flex items-center gap-1 px-3 pt-3 overflow-x-auto">
                                        {frameworks.map(fwId => {
                                            const fw = FRAMEWORKS.find(f => f.id === fwId)!;
                                            const n = (controls[fwId] ?? []).length;
                                            return (
                                                <button key={fwId} onClick={() => setActiveFw(fwId)}
                                                    className={cn("flex items-center gap-2 px-3 py-2 rounded-t-md border-b-2 -mb-px text-xs",
                                                        activeFw === fwId ? "border-primary text-foreground bg-card" : "border-transparent text-muted-foreground hover:text-foreground")}>
                                                    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded border font-mono font-semibold text-[10px]", FRAMEWORK_CLASSES[fwId])}>
                                                        {fw.short}
                                                    </span>
                                                    {fw.label}
                                                    <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono">{n}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {activeFw && (
                                        <div className="p-4">
                                            <Label>Controls satisfied by this policy</Label>
                                            <div className={cn(inputCls, "flex flex-wrap items-center gap-1.5 min-h-[44px] py-2")}>
                                                {(controls[activeFw] ?? []).map(code => (
                                                    <span key={code} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/15 border border-primary/30 text-primary text-xs font-mono">
                                                        {code}
                                                        <button onClick={() => removeControl(activeFw, code)} className="hover:bg-primary/20 rounded p-0.5" aria-label={`Remove ${code}`}>
                                                            <X className="w-2.5 h-2.5" />
                                                        </button>
                                                    </span>
                                                ))}
                                                <input
                                                    type="text"
                                                    value={controlDraft[activeFw] ?? ""}
                                                    onChange={e => setControlDraft(d => ({ ...d, [activeFw!]: e.target.value }))}
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter" || e.key === ",") {
                                                            e.preventDefault();
                                                            addControl(activeFw!);
                                                        } else if (e.key === "Backspace" && !(controlDraft[activeFw!] ?? "")) {
                                                            const arr = controls[activeFw!] ?? [];
                                                            if (arr.length) removeControl(activeFw!, arr[arr.length - 1]);
                                                        }
                                                    }}
                                                    placeholder={controlPlaceholder[activeFw] ?? "e.g. CTRL-001"}
                                                    className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground focus:outline-none"
                                                />
                                            </div>
                                            <Help>
                                                Type a control code and press <kbd className="px-1 py-0.5 rounded bg-secondary text-[10px] font-mono">Enter</kbd> to add.
                                            </Help>

                                            <div className="mt-4">
                                                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Suggested</div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(CONTROL_SUGGESTIONS[activeFw] ?? []).map(code => {
                                                        const already = (controls[activeFw] ?? []).includes(code);
                                                        return (
                                                            <button key={code} disabled={already}
                                                                onClick={() => setControls(c => ({ ...c, [activeFw!]: [...(c[activeFw!] ?? []), code] }))}
                                                                className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-mono transition-colors",
                                                                    already
                                                                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 cursor-default"
                                                                        : "border-border bg-secondary/40 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30")}>
                                                                {already ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                                {code}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Pane>
                    )}

                    {step === 3 && (
                        <Pane title="Upload your existing policy document" sub="We'll read it, detect the structure, and turn it into an editable policy in Overwatch. PDF, DOCX or Markdown — up to 20 MB.">
                            {!file && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
                                    onDragLeave={e => e.currentTarget.classList.remove("border-primary")}
                                    onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); handleFile(e.dataTransfer.files?.[0]); }}
                                    className="w-full p-8 rounded-xl border-2 border-dashed border-border bg-secondary/20 flex flex-col items-center text-center hover:bg-secondary/30 transition-colors"
                                >
                                    <div className="w-14 h-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                                        <UploadCloud className="w-7 h-7" />
                                    </div>
                                    <div className="text-base font-semibold text-foreground">Drag &amp; drop your file here</div>
                                    <div className="text-sm text-muted-foreground mt-1">or <span className="text-primary">browse files</span></div>
                                    <div className="flex items-center gap-4 mt-4 text-[11px] text-muted-foreground">
                                        <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" /> PDF</span>
                                        <span className="inline-flex items-center gap-1"><FileType className="w-3 h-3" /> DOCX</span>
                                        <span className="inline-flex items-center gap-1"><FileCode2 className="w-3 h-3" /> Markdown</span>
                                        <span className="inline-flex items-center gap-1"><HardDrive className="w-3 h-3" /> 20 MB max</span>
                                    </div>
                                    <input ref={fileInputRef} type="file" hidden accept=".pdf,.docx,.doc,.md,.txt" onChange={e => handleFile(e.target.files?.[0] ?? undefined)} />
                                </button>
                            )}

                            {file && (
                                <div className="p-4 rounded-xl border border-border bg-secondary/30 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-foreground truncate">{file.name}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            {formatBytes(file.size)} · {fileExt(file.name).toUpperCase()}
                                            {parsed && <span className="ml-2 inline-flex items-center gap-1 text-emerald-400"><Check className="w-3 h-3" /> Parsed</span>}
                                        </div>
                                    </div>
                                    {!parsing && !parsed && <>
                                        <Button variant="ghost" size="sm" onClick={() => { setFile(null); setParsed(false); }}>Replace</Button>
                                        <Button variant="default" size="sm" className="gap-2" onClick={startParse}>
                                            <Sparkles className="w-4 h-4" /> Parse document
                                        </Button>
                                    </>}
                                    {parsing && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                                    {parsed && <Button variant="ghost" size="sm" className="gap-2" onClick={startParse}>
                                        <RefreshCcw className="w-4 h-4" /> Re-parse
                                    </Button>}
                                </div>
                            )}

                            {parsing && (
                                <div className="mt-4 p-4 rounded-lg bg-secondary/30 border border-border">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <div className="flex items-center gap-2 text-foreground">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                            <span>{parseStage}</span>
                                        </div>
                                        <span className="font-mono text-muted-foreground">{parseProgress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-primary transition-all" style={{ width: `${parseProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            {parsed && (
                                <div className="mt-4 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/30">
                                    <div className="flex items-center gap-3 mb-3">
                                        <CircleCheckBig className="w-5 h-5 text-emerald-400" />
                                        <div>
                                            <div className="text-sm font-semibold text-foreground">Document parsed successfully</div>
                                            <div className="text-xs text-muted-foreground">Continue to review the extracted structure.</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                        <Stat icon={Heading2} label="Sections" value={parsedSections.length} />
                                        <Stat icon={List} label="Bullet lists" value={parsedSections.filter(s => s.parts.some(p => p.type === "ul")).length} />
                                        <Stat icon={Variable} label="Variables detected" value={countChips(parsedSections)} />
                                        <Stat icon={Link2} label="Controls referenced" value={totalControls} />
                                    </div>
                                </div>
                            )}
                        </Pane>
                    )}

                    {step === 4 && (
                        <Pane title="Verify the parsed content" sub="Each detected section is shown below. Accept what looks right, toggle off what you want to discard.">
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-2 p-4 rounded-lg bg-secondary/30 border border-border">
                                        <div>
                                            <div className="text-base font-semibold text-foreground">{title || "Untitled policy"}</div>
                                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{category}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{policyType}</span>
                                                {frameworks.map(f => {
                                                    const fw = FRAMEWORKS.find(x => x.id === f);
                                                    return fw ? <span key={f} className={cn("text-[10px] px-1.5 py-0.5 rounded border font-mono font-semibold", FRAMEWORK_CLASSES[f])}>{fw.short}</span> : null;
                                                })}
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                            <Sparkles className="w-3 h-3" /> Parsed from {file?.name ?? "document"}
                                        </span>
                                    </div>

                                    {parsedSections.map(sec => {
                                        const on = accepted[sec.id];
                                        return (
                                            <div key={sec.id} className={cn("p-4 rounded-lg border", on ? "border-border bg-secondary/20" : "border-border/50 bg-secondary/10 opacity-60")}>
                                                <div className="flex items-center justify-between gap-3 mb-3">
                                                    <h3 className="text-sm font-semibold text-foreground">{sec.heading}</h3>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                                            <SignalHigh className="w-3 h-3" /> {sec.confidence}% match
                                                        </span>
                                                        <Toggle on={!!on} onClick={() => setAccepted(a => ({ ...a, [sec.id]: !a[sec.id] }))} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm text-muted-foreground">
                                                    {sec.parts.map((p, i) => {
                                                        if (p.type === "p") {
                                                            return (
                                                                <p key={i} className="leading-relaxed">
                                                                    {p.runs.map((r, j) => r.chip
                                                                        ? <span key={j} className="inline-flex items-baseline gap-1 px-1.5 py-0.5 mx-0.5 rounded bg-primary/10 text-primary border border-primary/30 text-[12px] align-baseline">
                                                                            {r.text}<span className="text-[9px] font-mono opacity-70">{r.chip}</span>
                                                                        </span>
                                                                        : <Fragment key={j}>{r.text}</Fragment>
                                                                    )}
                                                                </p>
                                                            );
                                                        }
                                                        return (
                                                            <ul key={i} className="list-disc pl-5 space-y-1">
                                                                {p.items.map((it, k) => <li key={k}>{it}</li>)}
                                                            </ul>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <aside className="space-y-3">
                                    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                                        <h4 className="text-sm font-semibold text-foreground mb-2">Detection summary</h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Heading2 className="w-3.5 h-3.5" /> {parsedSections.length} sections detected</div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> {Object.values(accepted).filter(Boolean).length} included</div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1"><X className="w-3.5 h-3.5 text-red-400" /> {parsedSections.length - Object.values(accepted).filter(Boolean).length} excluded</div>
                                    </div>

                                    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                                        <h4 className="text-sm font-semibold text-foreground mb-2">Variables identified</h4>
                                        <p className="text-[11px] text-muted-foreground mb-3">Auto-replaced with platform variables. Edit values in <em>Settings → Variables</em>.</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {uniqueChips(parsedSections).map(({ text, chip }) => (
                                                <span key={chip} className="inline-flex items-baseline gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 text-[11px]">
                                                    {text}<span className="text-[9px] font-mono opacity-70">{chip}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/30 flex items-start gap-2">
                                        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                        <div className="text-xs text-muted-foreground">
                                            <strong className="text-foreground">Looks off?</strong> You can edit every section after creation. The parser improves with feedback.
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </Pane>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-border flex items-center gap-2">
                    <Button variant="ghost" disabled={step === 1} onClick={() => setStep(s => s - 1)} className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <span className="text-xs text-muted-foreground">Step {step} of {STEPS.length}</span>
                    <div className="flex-1" />
                    {step < 4 && (
                        <Button variant="default" disabled={!canAdvance} onClick={() => setStep(s => s + 1)} className="gap-2">
                            Continue: {STEPS[step].label} <ArrowRight className="w-4 h-4" />
                        </Button>
                    )}
                    {step === 4 && (
                        <Button variant="default" onClick={create} disabled={busy} className="gap-2">
                            <Sparkles className="w-4 h-4" /> {busy ? "Creating…" : "Create policy draft"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

const inputCls = "w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/50";

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={cn(inputCls, props.className)} />;
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
            {children}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
    );
}

function Help({ children }: { children: React.ReactNode }) {
    return <div className="text-[11px] text-muted-foreground/80 mt-1.5">{children}</div>;
}

function Pane({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
    return (
        <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {sub && <p className="text-sm text-muted-foreground mt-1.5">{sub}</p>}
            <div className="mt-5">{children}</div>
        </div>
    );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Heading2; label: string; value: number | string }) {
    return (
        <div className="flex items-center gap-2 p-2 rounded-md bg-card border border-border">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <div>
                <div className="text-sm font-semibold text-foreground">{value}</div>
                <div className="text-[10px] text-muted-foreground">{label}</div>
            </div>
        </div>
    );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick}
            className={cn("relative w-9 h-5 rounded-full transition-colors", on ? "bg-primary" : "bg-secondary border border-border")}>
            <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all", on ? "left-[18px]" : "left-0.5")} />
        </button>
    );
}

function formatBytes(n: number): string {
    if (!n) return "—";
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
function fileExt(name: string): string {
    const i = name.lastIndexOf(".");
    return i === -1 ? "" : name.slice(i + 1);
}
function countChips(sections: ParsedSection[]): number {
    let c = 0;
    for (const s of sections) for (const p of s.parts) if (p.type === "p") for (const r of p.runs) if (r.chip) c++;
    return c;
}
function uniqueChips(sections: ParsedSection[]): { text: string; chip: string }[] {
    const m = new Map<string, string>();
    for (const s of sections) for (const p of s.parts) if (p.type === "p") for (const r of p.runs) if (r.chip && !m.has(r.chip)) m.set(r.chip, r.text);
    return Array.from(m.entries()).map(([chip, text]) => ({ chip, text }));
}

/** Serialise the accepted parsed sections into Markdown the editor + variable engine can consume. */
function sectionsToMarkdown(sections: ParsedSection[]): string {
    const out: string[] = [];
    for (const s of sections) {
        out.push(`## ${s.heading}`);
        for (const p of s.parts) {
            if (p.type === "p") {
                // Re-emit chip placeholders as their key tokens; values are substituted at render time.
                const text = p.runs.map(r => r.chip ?? r.text).join("");
                out.push(text);
            } else if (p.type === "ul") {
                for (const item of p.items) out.push(`- ${item}`);
            }
        }
        out.push("");
    }
    return out.join("\n\n").trim();
}
