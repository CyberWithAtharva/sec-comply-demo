"use client";

import React, { useRef, useEffect, useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft, FileText, Save, CheckCircle2, Clock,
    Users, RotateCcw, AlertCircle,
} from "lucide-react";
import { cn } from "@/components/ui/Card";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Policy {
    id: string;
    org_id: string;
    title: string;
    version: string;
    status: "draft" | "under_review" | "approved" | "archived";
    content: string | null;
    file_url: string | null;
    owner_id: string | null;
    next_review: string | null;
    created_at: string;
    updated_at: string;
    owner: { id: string; full_name: string | null } | null;
    ackCount: number;
    totalMembers: number;
    framework_id?: string | null;
}

interface PolicyEditorClientProps {
    policy: Policy;
    currentUserId: string;
    isAdmin: boolean;
}

const STATUS_CONFIG = {
    draft:        { label: "Draft",        color: "text-slate-400",   bg: "bg-slate-800",      border: "border-slate-700" },
    under_review: { label: "Under Review", color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
    approved:     { label: "Active",       color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    archived:     { label: "Archived",     color: "text-slate-500",   bg: "bg-slate-800/50",   border: "border-slate-700/50" },
};

const TABS = ["Editor", "Versions", "Acknowledgments"] as const;

// ─── Toolbar button ────────────────────────────────────────────────────────────

function ToolBtn({
    label, title, onMouseDown, active,
}: { label: React.ReactNode; title: string; onMouseDown: (e: React.MouseEvent) => void; active?: boolean }) {
    return (
        <button
            type="button"
            title={title}
            onMouseDown={onMouseDown}
            className={cn(
                "px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors select-none",
                active
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/60"
            )}
        >
            {label}
        </button>
    );
}

// ─── Markdown → HTML converter (for existing markdown content) ────────────────

function mdToHtml(md: string): string {
    if (!md) return "";
    // Check if already HTML
    if (md.trim().startsWith("<")) return md;

    return md
        .split("\n")
        .map(line => {
            if (/^### (.+)/.test(line)) return `<h3>${line.replace(/^### /, "")}</h3>`;
            if (/^## (.+)/.test(line)) return `<h2>${line.replace(/^## /, "")}</h2>`;
            if (/^# (.+)/.test(line)) return `<h2>${line.replace(/^# /, "")}</h2>`;
            if (/^- (.+)/.test(line)) return `<ul><li>${line.replace(/^- /, "")}</li></ul>`;
            if (/^\d+\. (.+)/.test(line)) return `<ol><li>${line.replace(/^\d+\. /, "")}</li></ol>`;
            if (line.trim() === "") return "<p><br></p>";
            // Inline: bold, italic
            line = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
            line = line.replace(/_(.+?)_/g, "<em>$1</em>");
            return `<p>${line}</p>`;
        })
        .join("")
        .replace(/<\/ul><ul>/g, "")
        .replace(/<\/ol><ol>/g, "");
}

// ─── Main component ────────────────────────────────────────────────────────────

export function PolicyEditorClient({ policy, currentUserId: _, isAdmin: __ }: PolicyEditorClientProps) {
    const router = useRouter();
    const editorRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Editor");
    const [status, setStatus] = useState(policy.status);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [savedAt, setSavedAt] = useState<string | null>(null);
    const [, startTransition] = useTransition();

    // Load initial content into editor
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerHTML = mdToHtml(policy.content ?? "");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // execCommand helper
    const exec = useCallback((command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    }, []);

    const isActive = useCallback((command: string) => {
        try { return document.queryCommandState(command); } catch { return false; }
    }, []);

    // Save content
    const save = useCallback(async (nextStatus?: Policy["status"]) => {
        if (!editorRef.current) return;
        setSaving(true);
        setSaveError(null);

        const content = editorRef.current.innerHTML;
        const payload: Record<string, unknown> = { content, status: nextStatus ?? status };

        const res = await fetch(`/api/policies/${policy.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) {
            setSaveError(json.error ?? "Save failed");
            setSaving(false);
            return;
        }
        if (nextStatus) setStatus(nextStatus);
        setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        setSaving(false);
        startTransition(() => router.refresh());
    }, [policy.id, status, router]);

    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
    const ackPct = policy.totalMembers > 0
        ? Math.round((policy.ackCount / policy.totalMembers) * 100)
        : 0;

    return (
        <div className="flex flex-col min-h-[calc(100vh-56px)] -mx-6 -my-6">

            {/* Top action bar */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-slate-800/60 bg-[#020617]">
                <button
                    onClick={() => router.push("/policies")}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Policies
                </button>
                <div className="flex items-center gap-2">
                    {saveError && (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                            <AlertCircle className="w-3.5 h-3.5" /> {saveError}
                        </span>
                    )}
                    {savedAt && !saveError && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" /> Saved at {savedAt}
                        </span>
                    )}
                    <span className={cn(
                        "text-xs font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wider",
                        cfg.color, cfg.bg, cfg.border
                    )}>
                        {cfg.label}
                    </span>
                    <button
                        onClick={() => save()}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-50 transition-colors"
                    >
                        {saving ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Draft
                    </button>
                    {status !== "approved" && (
                        <button
                            onClick={() => save("approved")}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark as Active
                        </button>
                    )}
                    {status === "approved" && (
                        <button
                            onClick={() => save("draft")}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium disabled:opacity-50 transition-colors"
                        >
                            Revert to Draft
                        </button>
                    )}
                </div>
            </div>

            {/* Policy header */}
            <div className="px-8 pt-6 pb-4">
                <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 mt-1 flex-shrink-0">
                        <FileText className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{policy.title}</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {policy.owner?.full_name ?? "Unassigned"} · policy
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 px-8 border-b border-slate-800">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                            activeTab === tab
                                ? "border-orange-500 text-orange-400"
                                : "border-transparent text-slate-500 hover:text-slate-300"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Editor tab */}
            {activeTab === "Editor" && (
                <div className="flex-1 flex flex-col px-8 py-5">
                    {/* Formatting toolbar */}
                    <div className="flex items-center gap-0.5 mb-3 p-2 bg-[#0e1117] border border-slate-800 rounded-xl w-fit">
                        <ToolBtn
                            label={<strong>B</strong>} title="Bold"
                            onMouseDown={e => { e.preventDefault(); exec("bold"); }}
                            active={isActive("bold")}
                        />
                        <ToolBtn
                            label={<em>I</em>} title="Italic"
                            onMouseDown={e => { e.preventDefault(); exec("italic"); }}
                            active={isActive("italic")}
                        />
                        <ToolBtn
                            label={<span className="underline">U</span>} title="Underline"
                            onMouseDown={e => { e.preventDefault(); exec("underline"); }}
                            active={isActive("underline")}
                        />
                        <div className="w-px h-5 bg-slate-700 mx-1" />
                        <ToolBtn
                            label={<span className="text-xs font-bold">H2</span>} title="Heading 2"
                            onMouseDown={e => { e.preventDefault(); exec("formatBlock", "h2"); }}
                            active={false}
                        />
                        <ToolBtn
                            label={<span className="text-xs">H3</span>} title="Heading 3"
                            onMouseDown={e => { e.preventDefault(); exec("formatBlock", "h3"); }}
                            active={false}
                        />
                        <div className="w-px h-5 bg-slate-700 mx-1" />
                        <ToolBtn
                            label={
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <circle cx="2" cy="4" r="1.5" fill="currentColor"/>
                                    <circle cx="2" cy="8" r="1.5" fill="currentColor"/>
                                    <circle cx="2" cy="12" r="1.5" fill="currentColor"/>
                                    <rect x="5" y="3" width="9" height="2" rx="1" fill="currentColor"/>
                                    <rect x="5" y="7" width="9" height="2" rx="1" fill="currentColor"/>
                                    <rect x="5" y="11" width="9" height="2" rx="1" fill="currentColor"/>
                                </svg>
                            }
                            title="Bullet list"
                            onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList"); }}
                            active={isActive("insertUnorderedList")}
                        />
                        <ToolBtn
                            label={
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <text x="0" y="5" fill="currentColor" fontSize="5" fontWeight="bold">1.</text>
                                    <text x="0" y="9" fill="currentColor" fontSize="5" fontWeight="bold">2.</text>
                                    <text x="0" y="13" fill="currentColor" fontSize="5" fontWeight="bold">3.</text>
                                    <rect x="6" y="3" width="8" height="2" rx="1" fill="currentColor"/>
                                    <rect x="6" y="7" width="8" height="2" rx="1" fill="currentColor"/>
                                    <rect x="6" y="11" width="8" height="2" rx="1" fill="currentColor"/>
                                </svg>
                            }
                            title="Numbered list"
                            onMouseDown={e => { e.preventDefault(); exec("insertOrderedList"); }}
                            active={isActive("insertOrderedList")}
                        />
                    </div>

                    {/* ContentEditable editor */}
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck
                        className={cn(
                            "flex-1 min-h-[480px] px-6 py-5 rounded-xl border border-slate-800 bg-[#0e1117]",
                            "text-slate-100 text-sm leading-7 focus:outline-none focus:border-orange-500/40",
                            "policy-editor"
                        )}
                        onKeyDown={e => {
                            // Ctrl/Cmd+S to save
                            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                                e.preventDefault();
                                save();
                            }
                            // Ctrl/Cmd+B
                            if ((e.ctrlKey || e.metaKey) && e.key === "b") {
                                e.preventDefault();
                                exec("bold");
                            }
                            // Ctrl/Cmd+I
                            if ((e.ctrlKey || e.metaKey) && e.key === "i") {
                                e.preventDefault();
                                exec("italic");
                            }
                        }}
                    />
                    <p className="text-xs text-slate-600 mt-2">
                        <kbd className="bg-slate-800 border border-slate-700 rounded px-1">⌘S</kbd> to save
                    </p>
                </div>
            )}

            {/* Versions tab */}
            {activeTab === "Versions" && (
                <div className="flex-1 px-8 py-8">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold text-slate-200 mb-4">Version History</p>
                        <div className="space-y-3">
                            <div className="flex items-start gap-4 p-4 bg-[#0e1117] border border-slate-800 rounded-xl">
                                <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-orange-400">
                                    v{policy.version}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-slate-200">Version {policy.version}</p>
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded border uppercase",
                                            cfg.color, cfg.bg, cfg.border
                                        )}>{cfg.label}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Last updated {new Date(policy.updated_at).toLocaleDateString("en-US", {
                                            year: "numeric", month: "short", day: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Acknowledgments tab */}
            {activeTab === "Acknowledgments" && (
                <div className="flex-1 px-8 py-8">
                    <div className="max-w-2xl space-y-5">
                        <p className="text-sm font-semibold text-slate-200">Team Acknowledgments</p>

                        {/* Progress */}
                        <div className="p-5 bg-[#0e1117] border border-slate-800 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-200">
                                        {policy.ackCount} of {policy.totalMembers} members acknowledged
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-orange-400">{ackPct}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-orange-500 transition-all duration-700"
                                    style={{ width: `${ackPct}%` }}
                                />
                            </div>
                            {policy.totalMembers === 0 && (
                                <p className="text-xs text-slate-600 mt-3">No team members in your organization yet.</p>
                            )}
                        </div>

                        {policy.status !== "approved" && (
                            <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-300">
                                    Acknowledgments are only collected once the policy is marked as Active.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
