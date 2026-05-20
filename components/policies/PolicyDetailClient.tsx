"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    ArrowLeft, Download, Send, CircleCheck, UsersRound, History,
    Pencil, Eye, Layers, X, GitBranch, GitCommitHorizontal, Check,
    RefreshCw, FileSpreadsheet, AtSign, Upload, Copy, Undo2,
    UserPlus, MessageCircle, Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, cn } from "@/components/ui/Card";
import {
    STATUS_LABEL, STATUS_CLASSES, FRAMEWORKS, FRAMEWORK_CLASSES,
    normaliseStatus, substituteVariables, nextVersion,
    type PolicyStatusV2,
} from "./policy-shared";
import { PolicyEditor } from "./PolicyEditor";

interface Version {
    id: string;
    version: string;
    status: PolicyStatusV2;
    classification: "auto" | "minor" | "major" | null;
    summary: string | null;
    created_at: string;
    approved_at: string | null;
    created_by_name: string | null;
    approved_by_name: string | null;
    reviewer_name: string | null;
    reviewed_at: string | null;
    reviewer_decision: "approved" | "changes_requested" | null;
    reviewer_comment: string | null;
}

interface Member { id: string; name: string; role: string }
interface RoleAssignment { id: string; name: string }

interface AckRecipient {
    id: string;
    email: string;
    name: string | null;
    status: "pending" | "acknowledged" | "expired";
    submitted_name: string | null;
    match_status: "matched" | "unverified" | null;
    acknowledged_at: string | null;
    ip_address: string | null;
}

interface FrameworkControl {
    framework: string;
    control_code: string;
    description: string | null;
}

interface Policy {
    id: string;
    code: string | null;
    title: string;
    category: string | null;
    description: string | null;
    content: string;
    version: string;
    status: string;
    frameworks_list: string[];
    updated_at: string;
    owner_name: string | null;
    updated_by_name: string | null;
    author: RoleAssignment | null;
    reviewer: RoleAssignment | null;
    approver: RoleAssignment | null;
}

interface Props {
    policy: Policy;
    versions: Version[];
    controls: FrameworkControl[];
    recipients: AckRecipient[];
    variables: Record<string, string>;
    members: Member[];
    currentUserId: string;
    isOwner: boolean;
}

type Tab = "editor" | "preview" | "controls" | "acks" | "versions";

function StatusPill({ status }: { status: string }) {
    const s = normaliseStatus(status);
    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider", STATUS_CLASSES[s])}>
            <span className={cn("w-1.5 h-1.5 rounded-full",
                s === "active" ? "bg-emerald-400" : s === "in_review" ? "bg-amber-400" : s === "superseded" ? "bg-muted-foreground/50" : "bg-muted-foreground")} />
            {STATUS_LABEL[s]}
        </span>
    );
}

function FrameworkChip({ id }: { id: string }) {
    const fw = FRAMEWORKS.find(f => f.id === id);
    if (!fw) return null;
    return (
        <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded border font-mono font-semibold text-[10px]",
            FRAMEWORK_CLASSES[id] ?? "bg-secondary/40 text-muted-foreground border-border")}>
            {fw.short}
        </span>
    );
}

function AckRing({ pct, size = 72, stroke = 6 }: { pct: number; size?: number; stroke?: number }) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const dash = (pct / 100) * c;
    const color = pct === 100 ? "stroke-emerald-400" : pct >= 50 ? "stroke-orange-400" : "stroke-amber-400";
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-border" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" className={color} strokeWidth={stroke}
                strokeLinecap="round" strokeDasharray={`${dash} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
            <text x={size / 2} y={size / 2 + 4} textAnchor="middle" className="fill-foreground font-bold" style={{ fontSize: size * 0.26 }}>{pct}%</text>
        </svg>
    );
}

export function PolicyDetailClient({ policy, versions, controls, recipients, variables, members, currentUserId, isOwner }: Props) {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("editor");
    const [busy, setBusy] = useState(false);
    const [approveOpen, setApproveOpen] = useState(false);
    const [sendOpen, setSendOpen] = useState(false);
    const [reviewOpen, setReviewOpen] = useState<"approve" | "changes" | null>(null);

    const status = normaliseStatus(policy.status);
    const iAmAuthor = !!policy.author && policy.author.id === currentUserId;
    const iAmReviewer = !!policy.reviewer && policy.reviewer.id === currentUserId;
    const iAmApprover = !!policy.approver && policy.approver.id === currentUserId;
    // For the demo we let owners stand in for any unassigned role.
    const canActAsAuthor = iAmAuthor || isOwner;
    const canActAsReviewer = iAmReviewer || isOwner;
    const canActAsApprover = iAmApprover || isOwner;
    const ackDone = recipients.filter(r => r.status === "acknowledged").length;
    const ackPct = recipients.length ? Math.round((ackDone / recipients.length) * 100) : 0;
    // Per the Feature Doc, the editor is always available. The act of editing an
    // Active policy is what creates a new Draft — enforced server-side.
    const editorCanEdit = true;

    const handleSubmit = async () => {
        setBusy(true);
        const res = await fetch(`/api/policies/${policy.id}/submit`, { method: "POST" });
        if (res.ok) { toast.success("Submitted for approval"); router.refresh(); }
        else { const j = await res.json().catch(() => ({})); toast.error(j.error ?? "Submit failed"); }
        setBusy(false);
    };

    const downloadPdf = () => {
        window.open(`/api/policies/${policy.id}/pdf`, "_blank");
    };

    return (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-500">
            {/* Header */}
            <Card variant="solid" className="p-5">
                <div className="flex items-start gap-4 flex-wrap">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/policies")} className="mt-1">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 min-w-[280px]">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            {policy.code && <code className="text-[11px] font-mono text-muted-foreground bg-secondary/40 px-1.5 py-0.5 rounded">{policy.code}</code>}
                            <StatusPill status={policy.status} />
                            <span className="text-xs font-mono text-foreground">{policy.version}</span>
                            <span className="text-muted-foreground/40">·</span>
                            <div className="flex items-center gap-1">{policy.frameworks_list.map(f => <FrameworkChip key={f} id={f} />)}</div>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">{policy.title}</h1>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                            {policy.owner_name && <span>Owner: <strong className="text-foreground">{policy.owner_name}</strong></span>}
                            {policy.updated_by_name && <>
                                <span className="text-muted-foreground/40">·</span>
                                <span>Updated {new Date(policy.updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} by {policy.updated_by_name}</span>
                            </>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button variant="outline" size="sm" className="gap-2" onClick={downloadPdf} disabled={status !== "active"}>
                            <Download className="w-4 h-4" /> Download PDF
                        </Button>

                        {/* Draft → Submit for review (author) */}
                        {status === "draft" && canActAsAuthor && (
                            <Button
                                variant="default"
                                size="sm"
                                className="gap-2"
                                disabled={busy || !policy.reviewer}
                                onClick={handleSubmit}
                                title={!policy.reviewer ? "Assign a reviewer in the Workflow card first" : ""}
                            >
                                <Send className="w-4 h-4" /> Submit for review
                            </Button>
                        )}

                        {/* In review → Sign off / Request changes (reviewer) */}
                        {status === "in_review" && canActAsReviewer && (<>
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => setReviewOpen("changes")}>
                                <Undo2 className="w-4 h-4" /> Request changes
                            </Button>
                            <Button variant="default" size="sm" className="gap-2" onClick={() => setReviewOpen("approve")}>
                                <CircleCheck className="w-4 h-4" /> Sign off — send for approval
                            </Button>
                        </>)}

                        {/* Awaiting approval → Approve / Reject (approver) */}
                        {status === "awaiting_approval" && canActAsApprover && (
                            <Button variant="default" size="sm" className="gap-2" onClick={() => setApproveOpen(true)}>
                                <CircleCheck className="w-4 h-4" /> Review &amp; approve
                            </Button>
                        )}

                        {/* Active → Send for acknowledgement */}
                        {status === "active" && (
                            <Button variant="default" size="sm" className="gap-2" onClick={() => setSendOpen(true)}>
                                <UsersRound className="w-4 h-4" /> Send for acknowledgement
                            </Button>
                        )}
                    </div>
                </div>

                {/* Description */}
                {policy.description && (
                    <div className="mt-4 p-4 rounded-lg bg-secondary/40 border border-border">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Why we need this policy</div>
                        <p className="text-sm leading-relaxed text-muted-foreground">{policy.description}</p>
                    </div>
                )}
            </Card>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-border">
                {([
                    { id: "editor", label: "Editor", icon: Pencil },
                    { id: "preview", label: "Preview", icon: Eye },
                    { id: "controls", label: "Framework controls", icon: Layers },
                    { id: "acks", label: "Acknowledgement", icon: UsersRound },
                    { id: "versions", label: "Version history", icon: History },
                ] as const).map(t => {
                    const Icon = t.icon;
                    const active = tab === t.id;
                    return (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={cn("flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors",
                                active ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground")}>
                            <Icon className="w-3.5 h-3.5" />
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab content */}
            {tab === "editor" && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
                    <div>
                        {status === "active" && (
                            <div className="mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                                <strong className="text-amber-200">{policy.version} is Active.</strong> Editing here automatically creates a new Draft. The Active version stays locked until the new Draft is approved.
                            </div>
                        )}
                        {status === "superseded" && (
                            <div className="mb-3 p-3 rounded-lg bg-secondary/40 border border-border text-xs text-muted-foreground">
                                Showing a <strong className="text-foreground">Superseded</strong> version — edits will start a new Draft from this content.
                            </div>
                        )}
                        <PolicyEditor
                            policyId={policy.id}
                            initialMarkdown={policy.content}
                            variables={variables}
                            editable={editorCanEdit}
                        />
                    </div>
                    <SideRail policy={policy} recipients={recipients} controls={controls} ackPct={ackPct} ackDone={ackDone}
                        status={status} members={members} onSend={() => setSendOpen(true)} />
                </div>
            )}

            {tab === "preview" && (
                <div className="py-2">
                    <div className="max-w-3xl mx-auto bg-card border border-border rounded-xl shadow-xl p-8 lg:p-12">
                        <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded bg-gradient-to-br from-orange-500 to-amber-400 text-white text-xs font-bold flex items-center justify-center">
                                    {(variables["[Organisation_Name]"] ?? "Y").slice(0, 1).toUpperCase()}
                                </div>
                                <div className="text-xs font-semibold text-foreground">
                                    {variables["[Organisation_Name]"] ?? "Your organisation"}
                                </div>
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground">{policy.code ?? policy.title} · {policy.version}</div>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-1 tracking-tight">{policy.title}</h1>
                        <div className="text-xs font-mono text-muted-foreground mb-6 tracking-wider">CONFIDENTIAL · {policy.version}</div>
                        <PolicyEditor
                            policyId={policy.id}
                            initialMarkdown={substituteVariables(policy.content, variables)}
                            variables={{}}
                            editable={false}
                            chrome={false}
                            tone="app"
                        />
                        <div className="flex items-center justify-between mt-10 pt-4 border-t border-border text-[10px] font-mono text-muted-foreground tracking-wider">
                            <span>CONFIDENTIAL</span>
                            <span>Page 1 of 1 — Preview</span>
                            <span>Do not distribute</span>
                        </div>
                    </div>
                </div>
            )}

            {tab === "controls" && (
                <Card variant="solid" className="p-6">
                    <h3 className="text-base font-semibold text-foreground mb-1">Mapped framework controls</h3>
                    <p className="text-sm text-muted-foreground mb-5">Clauses across enrolled frameworks satisfied by this policy.</p>
                    <div className="flex flex-col divide-y divide-border/50">
                        {controls.length === 0 && <div className="text-sm text-muted-foreground py-2">No controls mapped yet.</div>}
                        {controls.map((c, i) => (
                            <div key={i} className="flex items-center gap-3 py-3">
                                <FrameworkChip id={c.framework} />
                                <code className="text-xs font-mono text-foreground bg-secondary/40 px-1.5 py-0.5 rounded">{c.control_code}</code>
                                <span className="text-sm text-muted-foreground flex-1">{c.description ?? "—"}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {tab === "acks" && (
                <AckPanel policy={policy} recipients={recipients} onSend={() => setSendOpen(true)} />
            )}

            {tab === "versions" && (
                <Card variant="solid" className="overflow-hidden p-0">
                    <table className="w-full text-left text-sm">
                        <thead className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider bg-secondary/30 border-b border-border">
                            <tr>
                                <th className="px-4 py-3 font-medium">Version</th>
                                <th className="px-3 py-3 font-medium">Status</th>
                                <th className="px-3 py-3 font-medium">Author</th>
                                <th className="px-3 py-3 font-medium">Reviewer</th>
                                <th className="px-3 py-3 font-medium">Approver</th>
                                <th className="px-3 py-3 font-medium">Approved</th>
                                <th className="px-3 py-3 font-medium">Summary</th>
                                <th className="px-3 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {versions.map(v => (
                                <tr key={v.id} className={cn(v.status === "active" && "bg-primary/5")}>
                                    <td className="px-4 py-3 font-mono text-sm text-foreground font-semibold">{v.version}</td>
                                    <td className="px-3 py-3"><StatusPill status={v.status} /></td>
                                    <td className="px-3 py-3 text-xs text-muted-foreground">
                                        <div>{v.created_by_name ?? "—"}</div>
                                        <div className="text-[10px] text-muted-foreground/70">{new Date(v.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
                                    </td>
                                    <td className="px-3 py-3 text-xs text-muted-foreground">
                                        {v.reviewer_name ? (
                                            <div className="flex flex-col">
                                                <span>{v.reviewer_name}</span>
                                                {v.reviewer_decision === "approved" && <span className="text-[10px] text-emerald-400">Signed off</span>}
                                                {v.reviewer_decision === "changes_requested" && <span className="text-[10px] text-amber-400">Changes requested</span>}
                                                {v.reviewed_at && <span className="text-[10px] text-muted-foreground/70">{new Date(v.reviewed_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>}
                                            </div>
                                        ) : "—"}
                                    </td>
                                    <td className="px-3 py-3 text-xs text-muted-foreground">{v.approved_by_name ?? "—"}</td>
                                    <td className="px-3 py-3 text-xs text-muted-foreground">{v.approved_at ? new Date(v.approved_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                                    <td className="px-3 py-3 text-xs text-muted-foreground max-w-md">
                                        <div>{v.summary ?? "—"}</div>
                                        {v.reviewer_comment && <div className="text-[10px] text-amber-400/80 italic mt-1">Reviewer: &ldquo;{v.reviewer_comment}&rdquo;</div>}
                                    </td>
                                    <td className="px-3 py-3">
                                        <Button variant="ghost" size="icon"
                                            onClick={() => window.open(`/api/policies/${policy.id}/pdf?version=${encodeURIComponent(v.version)}`, "_blank")}
                                            disabled={v.status !== "active" && v.status !== "superseded"}
                                            title="Download PDF">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {approveOpen && <ApproveModal policy={policy} onClose={() => setApproveOpen(false)} onDone={() => { setApproveOpen(false); router.refresh(); }} />}
            {sendOpen && <SendAckModal policy={policy} onClose={() => setSendOpen(false)} onDone={() => { setSendOpen(false); router.refresh(); }} />}
            {reviewOpen && (
                <ReviewModal
                    policy={policy}
                    decision={reviewOpen}
                    onClose={() => setReviewOpen(null)}
                    onDone={() => { setReviewOpen(null); router.refresh(); }}
                />
            )}
        </div>
    );
}

function SideRail({ policy, recipients, controls, ackPct, ackDone, status, members, onSend }: {
    policy: Policy; recipients: AckRecipient[]; controls: FrameworkControl[]; ackPct: number; ackDone: number; status: PolicyStatusV2; members: Member[]; onSend: () => void;
}) {
    return (
        <div className="flex flex-col gap-4">
            <WorkflowCard policy={policy} status={status} members={members} />

            {status === "active" && recipients.length > 0 && (
                <Card variant="solid" className="p-5">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Acknowledgement</h4>
                    <div className="flex items-center gap-4">
                        <AckRing pct={ackPct} size={72} stroke={6} />
                        <div>
                            <div className="text-xs text-muted-foreground">Acknowledged</div>
                            <div className="text-xl font-bold text-foreground">{ackDone}<span className="text-sm font-normal text-muted-foreground">/{recipients.length}</span></div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                {recipients.length - ackDone} pending
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1 gap-1.5"><RefreshCw className="w-3 h-3" />Resend</Button>
                        <Button variant="default" size="sm" className="flex-1 gap-1.5" onClick={onSend}><UsersRound className="w-3 h-3" />Send</Button>
                    </div>
                </Card>
            )}
            <Card variant="solid" className="p-5">
                <h4 className="text-sm font-semibold text-foreground mb-3">Framework controls</h4>
                <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto">
                    {controls.slice(0, 8).map((c, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <FrameworkChip id={c.framework} />
                            <code className="text-[10px] font-mono text-foreground">{c.control_code}</code>
                            <span className="text-[11px] text-muted-foreground truncate flex-1" title={c.description ?? ""}>{c.description}</span>
                        </div>
                    ))}
                    {controls.length > 8 && <div className="text-[11px] text-muted-foreground/70 mt-1">+ {controls.length - 8} more</div>}
                </div>
            </Card>
        </div>
    );
}

function WorkflowCard({ policy, status, members }: { policy: Policy; status: PolicyStatusV2; members: Member[] }) {
    const router = useRouter();
    const [editing, setEditing] = useState<"author_id" | "reviewer_id" | "approver_id" | null>(null);
    const [busy, setBusy] = useState(false);

    const setAssignment = async (role: "author_id" | "reviewer_id" | "approver_id", userId: string | null) => {
        setBusy(true);
        const res = await fetch(`/api/policies/${policy.id}/assign`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [role]: userId }),
        });
        if (res.ok) {
            toast.success("Assignment updated");
            router.refresh();
        } else {
            const j = await res.json().catch(() => ({}));
            toast.error(j.error ?? "Update failed");
        }
        setEditing(null);
        setBusy(false);
    };

    const stages: { key: "author_id" | "reviewer_id" | "approver_id"; label: string; person: RoleAssignment | null; activeAt: PolicyStatusV2; doneAt: PolicyStatusV2[]; description: string }[] = [
        { key: "author_id",   label: "Author",   person: policy.author,   activeAt: "draft",              doneAt: ["in_review", "awaiting_approval", "active", "superseded"], description: "Drafts and edits the policy content." },
        { key: "reviewer_id", label: "Reviewer", person: policy.reviewer, activeAt: "in_review",          doneAt: ["awaiting_approval", "active", "superseded"],            description: "Reviews and signs off on the draft." },
        { key: "approver_id", label: "Approver", person: policy.approver, activeAt: "awaiting_approval",  doneAt: ["active", "superseded"],                                  description: "Gives final approval, locking the version." },
    ];

    return (
        <Card variant="solid" className="p-5">
            <div className="flex items-center gap-2 mb-3">
                <Workflow className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Workflow</h4>
            </div>

            <div className="flex flex-col gap-3">
                {stages.map((stage, i) => {
                    const isActive = status === stage.activeAt;
                    const isDone = stage.doneAt.includes(status);
                    return (
                        <div key={stage.key} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold border",
                                    isDone ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                                        : isActive ? "bg-primary/15 border-primary/40 text-primary"
                                        : "bg-secondary/40 border-border text-muted-foreground")}>
                                    {isDone ? <Check className="w-3 h-3" /> : i + 1}
                                </div>
                                {i < stages.length - 1 && (
                                    <div className={cn("w-px flex-1 my-1 min-h-[14px]",
                                        isDone ? "bg-emerald-500/40" : "bg-border")} />
                                )}
                            </div>
                            <div className="flex-1 pb-2">
                                <div className="text-xs font-semibold text-foreground">{stage.label}</div>
                                {editing === stage.key ? (
                                    <div className="mt-1.5 flex items-center gap-1.5">
                                        <select
                                            autoFocus
                                            disabled={busy}
                                            value={stage.person?.id ?? ""}
                                            onChange={e => setAssignment(stage.key, e.target.value || null)}
                                            className="flex-1 bg-secondary/40 border border-border rounded text-xs px-2 py-1 text-foreground focus:outline-none focus:border-primary/50"
                                        >
                                            <option value="">— Unassigned —</option>
                                            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditing(null)} title="Cancel"><X className="w-3 h-3" /></Button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setEditing(stage.key)}
                                        className="mt-1 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
                                    >
                                        {stage.person ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-semibold flex items-center justify-center">
                                                    {stage.person.name.slice(0, 1).toUpperCase()}
                                                </span>
                                                <span className="text-foreground">{stage.person.name}</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-amber-400">
                                                <UserPlus className="w-3 h-3" /> Assign {stage.label.toLowerCase()}
                                            </span>
                                        )}
                                        <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                )}
                                <div className="text-[10px] text-muted-foreground/70 mt-0.5">{stage.description}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

function ReviewModal({ policy, decision, onClose, onDone }: { policy: Policy; decision: "approve" | "changes"; onClose: () => void; onDone: () => void }) {
    const [comment, setComment] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        setBusy(true);
        const res = await fetch(`/api/policies/${policy.id}/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                decision: decision === "approve" ? "approve" : "request_changes",
                comment,
            }),
        });
        if (res.ok) {
            toast.success(decision === "approve" ? "Signed off — sent for approval" : "Returned to draft with comments");
            onDone();
        } else {
            const j = await res.json().catch(() => ({}));
            toast.error(j.error ?? "Review failed");
        }
        setBusy(false);
    };

    const isApprove = decision === "approve";
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-border flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center",
                        isApprove ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400")}>
                        {isApprove ? <CircleCheck className="w-5 h-5" /> : <Undo2 className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-foreground">{isApprove ? "Sign off as reviewer" : "Request changes"}</h3>
                        <p className="text-xs text-muted-foreground">{policy.title} · {policy.version}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
                </div>
                <div className="p-5 space-y-3">
                    <div className="p-3 rounded-lg bg-secondary/40 border border-border text-xs text-muted-foreground">
                        {isApprove
                            ? <>Your sign-off moves the policy to <strong className="text-foreground">Awaiting Approval</strong>. The approver — {policy.approver?.name ?? "the assigned approver"} — will be notified.</>
                            : <>This sends the policy back to <strong className="text-foreground">Draft</strong> with your comments visible to the author.</>}
                    </div>
                    <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> {isApprove ? "Comment (optional)" : "What needs to change"}
                        </div>
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            rows={4}
                            placeholder={isApprove ? "Anything the approver should know…" : "Be specific so the author can fix it without back-and-forth."}
                            className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/50 resize-vertical font-sans"
                        />
                    </div>
                </div>
                <div className="p-5 border-t border-border flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant="default" disabled={busy || (!isApprove && !comment.trim())} onClick={submit} className="gap-2">
                        {isApprove ? <><CircleCheck className="w-4 h-4" /> Sign off & send for approval</> : <><Undo2 className="w-4 h-4" /> Send back to draft</>}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function AckPanel({ policy, recipients, onSend }: { policy: Policy; recipients: AckRecipient[]; onSend: () => void }) {
    const [filter, setFilter] = useState<"all" | "acknowledged" | "pending" | "expired">("all");
    const counts = recipients.reduce((c, r) => ({ ...c, [r.status]: (c[r.status as keyof typeof c] ?? 0) + 1 }), { acknowledged: 0, pending: 0, expired: 0 });
    const ackPct = recipients.length ? Math.round((counts.acknowledged / recipients.length) * 100) : 0;
    const filtered = recipients.filter(r => filter === "all" || r.status === filter);

    return (
        <Card variant="solid" className="overflow-hidden p-0">
            <div className="p-5 border-b border-border flex items-center gap-5 flex-wrap">
                <AckRing pct={ackPct} size={84} stroke={7} />
                <div>
                    <h3 className="text-base font-semibold text-foreground">Acknowledgement tracking</h3>
                    <p className="text-sm text-muted-foreground">Magic-link acks for {policy.version} · sent to {recipients.length} employees</p>
                </div>
                <div className="flex-1" />
                <Button variant="default" size="sm" className="gap-2" onClick={onSend}><UsersRound className="w-4 h-4" /> Send to more</Button>
            </div>
            <div className="p-3 border-b border-border flex gap-2 flex-wrap">
                {([
                    { id: "all", label: "All", count: recipients.length },
                    { id: "acknowledged", label: "Acknowledged", count: counts.acknowledged },
                    { id: "pending", label: "Pending", count: counts.pending },
                    { id: "expired", label: "Expired", count: counts.expired },
                ] as const).map(t => (
                    <button key={t.id} onClick={() => setFilter(t.id)}
                        className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border",
                            filter === t.id ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
                        {t.label}<span className="text-[10px] opacity-70">{t.count}</span>
                    </button>
                ))}
            </div>
            {filtered.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No recipients in this view.</div>
            ) : (
                <table className="w-full text-left text-sm">
                    <thead className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider bg-secondary/30 border-b border-border">
                        <tr>
                            <th className="px-4 py-3 font-medium">Employee</th>
                            <th className="px-3 py-3 font-medium">Email</th>
                            <th className="px-3 py-3 font-medium">Status</th>
                            <th className="px-3 py-3 font-medium">Match</th>
                            <th className="px-3 py-3 font-medium">Acknowledged</th>
                            <th className="px-3 py-3 font-medium">IP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filtered.map(r => (
                            <tr key={r.id}>
                                <td className="px-4 py-3 text-sm text-foreground font-medium">{r.submitted_name ?? r.name ?? "—"}</td>
                                <td className="px-3 py-3 text-xs text-muted-foreground">{r.email}</td>
                                <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                                <td className="px-3 py-3">
                                    {r.match_status === "matched" && <span className="text-[10px] font-semibold uppercase text-emerald-400">Matched</span>}
                                    {r.match_status === "unverified" && <span className="text-[10px] font-semibold uppercase text-amber-400">Unverified</span>}
                                    {!r.match_status && <span className="text-xs text-muted-foreground/60">—</span>}
                                </td>
                                <td className="px-3 py-3 text-xs text-muted-foreground">{r.acknowledged_at ? new Date(r.acknowledged_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                                <td className="px-3 py-3 text-[11px] font-mono text-muted-foreground">{r.ip_address ?? "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </Card>
    );
}

function StatusBadge({ status }: { status: AckRecipient["status"] }) {
    const cls = status === "acknowledged" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        : status === "expired" ? "bg-red-500/10 text-red-400 border-red-500/30"
        : "bg-amber-500/10 text-amber-400 border-amber-500/30";
    return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider", cls)}>{status}</span>;
}

// ─── Approve modal ────────────────────────────────────────────────────────────

function ApproveModal({ policy, onClose, onDone }: { policy: Policy; onClose: () => void; onDone: () => void }) {
    const [decision, setDecision] = useState<"approve" | "reject">("approve");
    const [classification, setClassification] = useState<"minor" | "major">("minor");
    const [summary, setSummary] = useState("");
    const [busy, setBusy] = useState(false);
    const nextVer = nextVersion(policy.version, classification);

    const submit = async () => {
        setBusy(true);
        const res = await fetch(`/api/policies/${policy.id}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ decision, classification, summary }),
        });
        if (res.ok) {
            const j = await res.json();
            toast.success(decision === "approve" ? `Approved as ${j.version}` : "Returned to draft");
            onDone();
        } else {
            const j = await res.json().catch(() => ({}));
            toast.error(j.error ?? "Approve failed");
        }
        setBusy(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><CircleCheck className="w-5 h-5" /></div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-foreground">Review & approve</h3>
                        <p className="text-xs text-muted-foreground">{policy.title} · {policy.version} → <span className="text-foreground font-mono">{nextVer}</span></p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Decision</div>
                        <div className="flex gap-2">
                            <Choice selected={decision === "approve"} onClick={() => setDecision("approve")} icon={<Check className="w-4 h-4" />} title="Approve" sub="Lock version, capture evidence" />
                            <Choice selected={decision === "reject"} onClick={() => setDecision("reject")} icon={<X className="w-4 h-4" />} title="Reject" sub="Return to Draft with comment" />
                        </div>
                    </div>

                    {decision === "approve" && (
                        <div>
                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Change classification</div>
                            <div className="flex flex-col gap-2">
                                <Choice selected={classification === "minor"} onClick={() => setClassification("minor")}
                                    icon={<GitCommitHorizontal className="w-4 h-4" />}
                                    title="Minor — wording, formatting, variable values"
                                    sub={`Increments to ${nextVersion(policy.version, "minor")}`}
                                    full />
                                <Choice selected={classification === "major"} onClick={() => setClassification("major")}
                                    icon={<GitBranch className="w-4 h-4" />}
                                    title="Major — scope change, new sections, obligations"
                                    sub={`Increments to ${nextVersion(policy.version, "major")}`}
                                    full />
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                            {decision === "approve" ? "Approval note (optional)" : "Reason for rejection"}
                        </div>
                        <textarea
                            value={summary} onChange={e => setSummary(e.target.value)}
                            rows={3}
                            placeholder={decision === "approve" ? "Summary of changes for the version history…" : "Tell the editor what needs to change…"}
                            className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/50 font-sans resize-vertical"
                        />
                    </div>
                </div>
                <div className="p-5 border-t border-border flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant="default" disabled={busy} onClick={submit} className="gap-2">
                        {decision === "approve" ? <><CircleCheck className="w-4 h-4" /> Approve {nextVer}</> : <><X className="w-4 h-4" /> Reject & return to draft</>}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function Choice({ selected, onClick, icon, title, sub, full }: { selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string; full?: boolean }) {
    return (
        <button onClick={onClick}
            className={cn("flex items-start gap-3 p-3 rounded-lg border text-left transition-colors",
                selected ? "border-primary bg-primary/10" : "border-border bg-secondary/30 hover:bg-secondary/50",
                full ? "w-full" : "flex-1")}>
            <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>{icon}</div>
            <div>
                <div className="text-sm font-medium text-foreground">{title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
            </div>
        </button>
    );
}

// ─── Send-for-Ack modal ───────────────────────────────────────────────────────

function SendAckModal({ policy, onClose, onDone }: { policy: Policy; onClose: () => void; onDone: () => void }) {
    const [mode, setMode] = useState<"manual" | "csv">("manual");
    const [text, setText] = useState("aarav.singh@acme.tech, bhavna.g@acme.tech, chen.w@acme.tech");
    const [csvName, setCsvName] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [magicLinks, setMagicLinks] = useState<{ email: string; url: string }[] | null>(null);

    const parseManual = (): { name: string | null; email: string }[] => {
        return text.split(/[,\n]/).map(s => s.trim()).filter(Boolean).map(email => ({ name: null, email }));
    };

    const send = async () => {
        const list = mode === "manual" ? parseManual()
            // CSV demo: prefill with 12 fake employees
            : Array.from({ length: 12 }).map((_, i) => ({ name: `Employee ${i + 1}`, email: `employee${i + 1}@acme.tech` }));
        if (list.length === 0) { toast.error("Add at least one recipient"); return; }
        setBusy(true);
        const res = await fetch(`/api/policies/${policy.id}/send-acknowledgement`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipients: list }),
        });
        if (res.ok) {
            const j = await res.json();
            setMagicLinks(j.magicLinks ?? []);
            toast.success(`${list.length} magic-link emails queued`);
        } else {
            const j = await res.json().catch(() => ({}));
            toast.error(j.error ?? "Send failed");
        }
        setBusy(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><UsersRound className="w-5 h-5" /></div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-foreground">Send for acknowledgement</h3>
                        <p className="text-xs text-muted-foreground">{policy.title} · {policy.version}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
                </div>

                {!magicLinks && (
                    <div className="p-5 space-y-4">
                        <div className="flex gap-2">
                            <Choice selected={mode === "manual"} onClick={() => setMode("manual")} icon={<AtSign className="w-4 h-4" />} title="Manual entry" sub="Comma-separated emails" />
                            <Choice selected={mode === "csv"} onClick={() => setMode("csv")} icon={<FileSpreadsheet className="w-4 h-4" />} title="Upload CSV" sub="Name + Email columns" />
                        </div>

                        {mode === "manual" && (
                            <textarea value={text} onChange={e => setText(e.target.value)} rows={5}
                                className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-primary/50 resize-vertical"
                            />
                        )}
                        {mode === "csv" && (
                            <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-border bg-secondary/30 cursor-pointer hover:bg-secondary/50">
                                <Upload className="w-5 h-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-foreground">{csvName ?? "Drop CSV / Excel file here"}</div>
                                    <div className="text-xs text-muted-foreground">Required columns: Name, Email · Demo seeds 12 recipients</div>
                                </div>
                                <input type="file" accept=".csv,.xls,.xlsx" className="hidden"
                                    onChange={e => setCsvName(e.target.files?.[0]?.name ?? null)} />
                            </label>
                        )}

                        <div className="p-3 rounded-lg bg-secondary/40 border border-border">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">What employees see</div>
                            <p className="text-xs text-muted-foreground">
                                Each recipient gets a one-time magic link. No login. Link expires in 30 days. Name + IP + timestamp captured for audit.
                            </p>
                        </div>
                    </div>
                )}

                {magicLinks && (
                    <div className="p-5 space-y-3">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                            <CircleCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-foreground">Magic links generated. In production these are emailed — for the demo, copy them from the list below.</span>
                        </div>
                        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                            {magicLinks.map(m => (
                                <div key={m.email} className="flex items-center gap-2 p-2 rounded bg-secondary/40 border border-border">
                                    <span className="text-xs text-muted-foreground truncate flex-1">{m.email}</span>
                                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(m.url); toast.success("Link copied"); }}>
                                        <Copy className="w-3 h-3" /> Copy link
                                    </Button>
                                    <a href={m.url} target="_blank" rel="noreferrer">
                                        <Button variant="default" size="sm">Open</Button>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="p-5 border-t border-border flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                    {!magicLinks && (
                        <Button variant="default" disabled={busy} onClick={send} className="gap-2">
                            <Send className="w-4 h-4" /> Send magic links
                        </Button>
                    )}
                    {magicLinks && <Button variant="default" onClick={onDone}>Done</Button>}
                </div>
            </div>
        </div>
    );
}
