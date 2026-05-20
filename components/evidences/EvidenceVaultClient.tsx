"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Download,
    FileText,
    FolderGit2,
    Link2,
    Search,
    SearchCheck,
    ShieldCheck,
    UploadCloud,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/components/ui/Card";

export interface EvidenceArtifact {
    id: string;
    org_id: string;
    control_id: string | null;
    name: string;
    description: string | null;
    file_url: string | null;
    file_type: string | null;
    file_size: number | null;
    uploaded_by: string | null;
    status: string;
    expires_at: string | null;
    created_at: string;
    uploader: { id: string; full_name: string | null } | null;
}

export interface Control {
    id: string;
    control_id: string;
    title: string;
    domain: string;
    category: string;
    framework_id: string;
    description?: string | null;
}

export interface ControlStatus {
    control_id: string;
    status: "verified" | "in_progress" | "not_started" | "not_applicable";
    evidence_count: number;
}

export interface FrameworkSummary {
    id: string;
    name: string;
    version: string;
    controls_count?: number;
}

export interface PolicySummary {
    id: string;
    title: string;
    status: "draft" | "under_review" | "approved" | "archived" | "in_review" | "active" | "awaiting_approval" | "superseded";
    updated_at: string;
}

export interface PolicyControlLink {
    policy_id: string;
    control_id: string;
}

type Evidence = {
    id: string;
    name: string;
    uploadedAt: string;
    fileUrl?: string;
    uploaderName: string;
};

type AuditEvent = {
    id: string;
    kind: "uploaded" | "replaced" | "archived";
    message: string;
    at: string;
};

type VaultControl = Control & {
    vaultGroup: string;
    status: ControlStatus["status"];
    evidence: Evidence | null;
    linkedPolicy: PolicySummary | null;
    auditTrail: AuditEvent[];
};

interface EvidenceVaultClientProps {
    initialArtifacts: EvidenceArtifact[];
    controls: Control[];
    statuses: ControlStatus[];
    frameworks: FrameworkSummary[];
    policies: PolicySummary[];
    policyLinks: PolicyControlLink[];
    orgId: string;
}

const FILTERS = ["all", "evidenced", "missing"] as const;
type Filter = typeof FILTERS[number];

function formatDate(value?: string) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatDateTime(value?: string) {
    if (!value) return "—";
    return new Date(value).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function evidenceFromArtifact(artifact: EvidenceArtifact): Evidence {
    return {
        id: artifact.id,
        name: artifact.name,
        uploadedAt: artifact.created_at,
        fileUrl: artifact.file_url ?? undefined,
        uploaderName: artifact.uploader?.full_name ?? "Unknown user",
    };
}

function buildVaultControls(
    framework: FrameworkSummary,
    controls: Control[],
    artifacts: EvidenceArtifact[],
    policies: PolicySummary[],
    policyLinks: PolicyControlLink[],
    statuses: ControlStatus[],
): VaultControl[] {
    const artifactsByControl = new Map<string, EvidenceArtifact[]>();
    artifacts.forEach((a) => {
        if (!a.control_id) return;
        const list = artifactsByControl.get(a.control_id) ?? [];
        list.push(a);
        artifactsByControl.set(a.control_id, list);
    });

    const policyById = new Map(policies.map((p) => [p.id, p]));
    const linksByControl = new Map<string, string[]>();
    policyLinks.forEach((l) => {
        const list = linksByControl.get(l.control_id) ?? [];
        list.push(l.policy_id);
        linksByControl.set(l.control_id, list);
    });

    const statusByControl = new Map(statuses.map((s) => [s.control_id, s]));

    return controls.map((control) => {
        const controlArtifacts = artifactsByControl.get(control.id) ?? [];
        const newestArtifact = controlArtifacts[0] ?? null;
        const evidence = newestArtifact ? evidenceFromArtifact(newestArtifact) : null;

        const linkedApproved = (linksByControl.get(control.id) ?? [])
            .map((id) => policyById.get(id))
            .filter((p): p is PolicySummary => Boolean(p))
            .filter((p) => p.status === "approved" || p.status === "active")
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

        const status = statusByControl.get(control.id)?.status ?? "not_started";

        const auditTrail: AuditEvent[] = controlArtifacts
            .map((a) => ({
                id: `uploaded-${a.id}`,
                kind: "uploaded" as const,
                message: `${a.name} uploaded by ${a.uploader?.full_name ?? "Unknown user"}`,
                at: a.created_at,
            }))
            .sort((l, r) => new Date(r.at).getTime() - new Date(l.at).getTime());

        return {
            ...control,
            vaultGroup: control.category || control.domain || framework.name,
            status,
            evidence,
            linkedPolicy: linkedApproved[0] ?? null,
            auditTrail,
        };
    });
}

function ControlStatusPill({ control }: { control: VaultControl }) {
    if (control.evidence) {
        return (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
                Evidenced
            </span>
        );
    }
    if (control.linkedPolicy) {
        return (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border text-blue-400 bg-blue-500/10 border-blue-500/30">
                Policy
            </span>
        );
    }
    return (
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border text-muted-foreground bg-secondary/70 border-border/60">
            Missing
        </span>
    );
}

function SummaryStat({
    label,
    value,
    icon: Icon,
    color,
    bg,
}: {
    label: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
}) {
    return (
        <div className="bg-card/60 border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
                <div className={cn("p-1.5 rounded-lg border", bg)}>
                    <Icon className={cn("w-4 h-4", color)} />
                </div>
            </div>
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
        </div>
    );
}

function ReplaceConfirmModal({
    onCancel,
    onConfirm,
}: {
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-card border border-border/50 rounded-2xl w-full max-w-lg shadow-2xl"
            >
                <div className="flex items-center justify-between p-5 border-b border-border/50">
                    <div>
                        <h2 className="text-base font-semibold text-foreground">Replace Evidence</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Confirm before uploading a replacement file.</p>
                    </div>
                    <Button variant="plain" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors h-auto">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                        <p className="text-sm text-amber-300">
                            This will replace the existing evidence. The previous file will be archived. Continue?
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="plain"
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground h-auto"
                        >
                            Cancel
                        </Button>
                        <Button variant="plain"
                            type="button"
                            onClick={onConfirm}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors h-auto"
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

type UploadContext = {
    frameworkId: string;
    controlId: string;
    mode: "upload" | "replace";
};

export function EvidenceVaultClient({
    initialArtifacts,
    controls,
    statuses,
    frameworks,
    policies,
    policyLinks,
    orgId,
}: EvidenceVaultClientProps) {
    const supabase = createClient();

    const [vaultByFramework, setVaultByFramework] = useState<Record<string, VaultControl[]>>(() =>
        frameworks.reduce<Record<string, VaultControl[]>>((acc, fw) => {
            const fwControls = controls.filter((c) => c.framework_id === fw.id);
            acc[fw.id] = buildVaultControls(fw, fwControls, initialArtifacts, policies, policyLinks, statuses);
            return acc;
        }, {}),
    );

    const [selectedFrameworkId, setSelectedFrameworkId] = useState(frameworks[0]?.id ?? "");
    const [selectedControlId, setSelectedControlId] = useState("");
    const [activeFilter, setActiveFilter] = useState<Filter>("all");
    const [search, setSearch] = useState("");
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
    const [auditOpen, setAuditOpen] = useState(true);
    const [dragActive, setDragActive] = useState(false);
    const [linkDraft, setLinkDraft] = useState("");
    const [replaceContext, setReplaceContext] = useState<UploadContext | null>(null);
    const [uploadContext, setUploadContext] = useState<UploadContext | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentControls = useMemo(
        () => vaultByFramework[selectedFrameworkId] ?? [],
        [selectedFrameworkId, vaultByFramework],
    );

    const filteredControls = useMemo(() => {
        const q = search.trim().toLowerCase();
        return currentControls.filter((c) => {
            if (activeFilter === "evidenced" && !c.evidence) return false;
            if (activeFilter === "missing" && c.evidence) return false;
            if (!q) return true;
            return (
                c.control_id.toLowerCase().includes(q) ||
                c.title.toLowerCase().includes(q) ||
                c.vaultGroup.toLowerCase().includes(q)
            );
        });
    }, [activeFilter, currentControls, search]);

    const groupedControls = useMemo(() => {
        return filteredControls.reduce<Record<string, VaultControl[]>>((acc, c) => {
            acc[c.vaultGroup] = acc[c.vaultGroup] ?? [];
            acc[c.vaultGroup].push(c);
            return acc;
        }, {});
    }, [filteredControls]);

    useEffect(() => {
        if (!selectedFrameworkId && frameworks[0]?.id) {
            setSelectedFrameworkId(frameworks[0].id);
        }
    }, [frameworks, selectedFrameworkId]);

    useEffect(() => {
        if (!filteredControls.length) {
            setSelectedControlId("");
            return;
        }
        const stillExists = filteredControls.some((c) => c.id === selectedControlId);
        if (!stillExists) {
            setSelectedControlId(filteredControls[0].id);
        }
    }, [filteredControls, selectedControlId]);

    const selectedControl = filteredControls.find((c) => c.id === selectedControlId) ?? currentControls[0];

    const summary = useMemo(() => {
        const total = currentControls.length;
        const evidenced = currentControls.filter((c) => c.evidence).length;
        const policyOnly = currentControls.filter((c) => !c.evidence && c.linkedPolicy).length;
        const missing = currentControls.filter((c) => !c.evidence && !c.linkedPolicy).length;
        return { total, evidenced, policyOnly, missing };
    }, [currentControls]);

    function applyArtifactToControl(
        frameworkId: string,
        controlId: string,
        artifact: EvidenceArtifact,
        mode: "upload" | "replace",
    ) {
        setVaultByFramework((previous) => {
            const next = { ...previous };
            next[frameworkId] = (previous[frameworkId] ?? []).map((c) => {
                if (c.id !== controlId) return c;
                const newEvidence = evidenceFromArtifact(artifact);
                const previousEvidence = c.evidence;
                const newEvent: AuditEvent = {
                    id: `${mode}-${artifact.id}`,
                    kind: mode === "replace" ? "replaced" : "uploaded",
                    message: mode === "replace"
                        ? `${artifact.name} replaced the previous evidence`
                        : `${artifact.name} uploaded by ${artifact.uploader?.full_name ?? "Unknown user"}`,
                    at: artifact.created_at,
                };
                const archiveEvent: AuditEvent | null = mode === "replace" && previousEvidence
                    ? {
                        id: `archived-${previousEvidence.id}`,
                        kind: "archived",
                        message: `${previousEvidence.name} archived after replacement`,
                        at: artifact.created_at,
                    }
                    : null;

                return {
                    ...c,
                    evidence: newEvidence,
                    auditTrail: [newEvent, ...(archiveEvent ? [archiveEvent] : []), ...c.auditTrail],
                };
            });
            return next;
        });
    }

    async function persistArtifact({
        file,
        linkUrl,
        controlId,
        label,
    }: {
        file?: File;
        linkUrl?: string;
        controlId: string;
        label: string;
    }) {
        let fileUrl: string | null = null;
        let fileType: string | null = null;
        let fileSize: number | null = null;

        if (file) {
            const extension = file.name.split(".").pop();
            const path = `${orgId}/${Date.now()}-${label.replace(/\s+/g, "-").toLowerCase()}.${extension}`;
            const { error: uploadError } = await supabase.storage
                .from("evidence-artifacts")
                .upload(path, file, { contentType: file.type });

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            const { data } = supabase.storage.from("evidence-artifacts").getPublicUrl(path);
            fileUrl = data.publicUrl;
            fileType = file.type;
            fileSize = file.size;
        }

        if (linkUrl) {
            fileUrl = linkUrl;
            fileType = "text/uri-list";
        }

        const response = await fetch("/api/evidence", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                org_id: orgId,
                name: file?.name ?? `${label} Link`,
                description: label,
                control_id: controlId,
                file_url: fileUrl,
                file_type: fileType,
                file_size: fileSize,
            }),
        });

        const payload = await response.json();
        if (!response.ok || !payload.artifact) {
            throw new Error(payload.error ?? "Evidence upload failed");
        }

        return {
            ...(payload.artifact as EvidenceArtifact),
            uploader: (payload.artifact.profiles as { id: string; full_name: string | null } | null) ?? null,
        };
    }

    async function handleManualFile(file: File, context: UploadContext) {
        const control = (vaultByFramework[context.frameworkId] ?? []).find((c) => c.id === context.controlId);
        if (!control) return;

        setIsUploading(true);
        try {
            const artifact = await persistArtifact({
                file,
                controlId: control.id,
                label: control.title,
            });
            applyArtifactToControl(context.frameworkId, context.controlId, artifact, context.mode);
            toast.success(context.mode === "replace" ? "Evidence replaced" : "Evidence uploaded");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to upload evidence");
        } finally {
            setIsUploading(false);
            setUploadContext(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    async function handleLinkSubmit(control: VaultControl) {
        const url = linkDraft.trim();
        if (!url) return;

        setIsUploading(true);
        try {
            const artifact = await persistArtifact({
                linkUrl: url,
                controlId: control.id,
                label: control.title,
            });
            applyArtifactToControl(selectedFrameworkId, control.id, artifact, "upload");
            setLinkDraft("");
            toast.success("Evidence link added");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add link");
        } finally {
            setIsUploading(false);
        }
    }

    function openFilePicker(context: UploadContext) {
        setUploadContext(context);
        fileInputRef.current?.click();
    }

    function toggleGroup(group: string) {
        setCollapsedGroups((previous) => {
            const next = new Set(previous);
            if (next.has(group)) next.delete(group);
            else next.add(group);
            return next;
        });
    }

    return (
        <div className="space-y-6">
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.xlsx,.docx,.csv"
                className="hidden"
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file && uploadContext) {
                        void handleManualFile(file, uploadContext);
                    }
                }}
            />

            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <FolderGit2 className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Evidence Vault</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Upload and track evidence for every control in your assigned frameworks.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 bg-card/50 border border-border rounded-lg p-1 w-fit">
                {frameworks.map((framework) => (
                    <Button variant="plain"
                        key={framework.id}
                        onClick={() => setSelectedFrameworkId(framework.id)}
                        className={cn("h-auto",
                            "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                            selectedFrameworkId === framework.id
                                ? "bg-orange-600 text-white shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                        )}
                    >
                        {framework.name} {framework.version ? `v${framework.version}` : ""}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryStat label="Total Controls" value={summary.total} icon={ShieldCheck} color="text-foreground" bg="bg-secondary/70 border-border/60" />
                <SummaryStat label="Evidenced" value={summary.evidenced} icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-500/10 border-emerald-500/20" />
                <SummaryStat label="Policy-Covered" value={summary.policyOnly} icon={FileText} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/20" />
                <SummaryStat label="Missing Evidence" value={summary.missing} icon={AlertTriangle} color="text-red-400" bg="bg-red-500/10 border-red-500/20" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6 items-start">
                <div className="bg-card/60 border border-border rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-border/60 space-y-3">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Control List</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{filteredControls.length} of {currentControls.length} controls</p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search controls…"
                                className="w-full pl-9 pr-3 py-2 bg-background/40 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/20 transition-colors"
                            />
                        </div>

                        <div className="flex items-center gap-1 bg-secondary/50 border border-border/50 rounded-lg p-1 w-fit">
                            {FILTERS.map((filter) => (
                                <Button variant="plain"
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={cn("h-auto",
                                        "px-3 py-1 rounded-md text-xs font-medium capitalize transition-all",
                                        activeFilter === filter
                                            ? "bg-orange-600 text-white shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
                                    )}
                                >
                                    {filter}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="max-h-[780px] overflow-y-auto">
                        {Object.entries(groupedControls).map(([group, groupControls]) => {
                            const isCollapsed = collapsedGroups.has(group);
                            return (
                                <div key={group} className="border-b border-border/40 last:border-b-0">
                                    <Button variant="plain"
                                        onClick={() => toggleGroup(group)}
                                        className="w-full flex items-center justify-between px-4 py-2 hover:bg-secondary/30 transition-colors text-left h-auto"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground truncate">{group}</p>
                                            <span className="text-[10px] font-mono text-muted-foreground/70 flex-shrink-0">{groupControls.length}</span>
                                        </div>
                                        {isCollapsed ? (
                                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                        )}
                                    </Button>

                                    {!isCollapsed && (
                                        <div className="divide-y divide-border/30">
                                            {groupControls.map((control) => {
                                                const active = selectedControl?.id === control.id;
                                                return (
                                                    <Button variant="plain"
                                                        key={control.id}
                                                        onClick={() => setSelectedControlId(control.id)}
                                                        className={cn("h-auto",
                                                            "w-full px-4 py-2.5 text-left transition-colors block",
                                                            active
                                                                ? "bg-orange-500/15 border-l-2 border-l-orange-500"
                                                                : "hover:bg-secondary/20 border-l-2 border-l-transparent",
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[11px] font-mono text-orange-400">{control.control_id}</span>
                                                                    <ControlStatusPill control={control} />
                                                                </div>
                                                                <p className="text-sm text-foreground truncate mt-0.5">{control.title}</p>
                                                            </div>
                                                        </div>
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {!filteredControls.length && (
                            <div className="py-16 px-6 text-center">
                                <SearchCheck className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">No controls match this filter</p>
                                <p className="text-xs text-muted-foreground mt-1">Try clearing search or switching the framework.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-card/60 border border-border rounded-xl overflow-hidden min-h-[680px]">
                    {selectedControl ? (
                        <div className="p-5 space-y-5">
                            <div className="space-y-3 border-b border-border/60 pb-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-mono text-orange-400">{selectedControl.control_id}</p>
                                        <h2 className="text-xl font-semibold text-foreground mt-1">{selectedControl.title}</h2>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border text-muted-foreground bg-secondary/80 border-border/60">
                                        {selectedControl.vaultGroup}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {selectedControl.description ?? "No description available for this control."}
                                </p>

                                {selectedControl.linkedPolicy && (
                                    <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/20 rounded-lg px-3 py-2">
                                        <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">Linked policy</p>
                                            <p className="text-sm text-foreground truncate">
                                                {selectedControl.linkedPolicy.title}
                                                <span className="text-xs text-muted-foreground ml-2">· approved {formatDate(selectedControl.linkedPolicy.updated_at)}</span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-foreground">Uploaded Evidence</h3>
                                    <ControlStatusPill control={selectedControl} />
                                </div>

                                {selectedControl.evidence ? (
                                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div className="bg-card/60 border border-emerald-500/15 rounded-lg p-3 min-w-0">
                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Filename</p>
                                                <p className="text-sm text-foreground truncate">{selectedControl.evidence.name}</p>
                                            </div>
                                            <div className="bg-card/60 border border-emerald-500/15 rounded-lg p-3">
                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Uploaded</p>
                                                <p className="text-sm text-foreground">{formatDateTime(selectedControl.evidence.uploadedAt)}</p>
                                            </div>
                                            <div className="bg-card/60 border border-emerald-500/15 rounded-lg p-3 min-w-0">
                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Uploader</p>
                                                <p className="text-sm text-foreground truncate">{selectedControl.evidence.uploaderName}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 mt-4">
                                            <Button variant="plain"
                                                onClick={() => setReplaceContext({
                                                    frameworkId: selectedFrameworkId,
                                                    controlId: selectedControl.id,
                                                    mode: "replace",
                                                })}
                                                className="px-4 py-2 bg-secondary hover:bg-secondary text-foreground text-sm font-medium rounded-lg transition-colors h-auto"
                                            >
                                                Replace
                                            </Button>
                                            {selectedControl.evidence.fileUrl && (
                                                <a
                                                    href={selectedControl.evidence.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    Download
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div
                                            onDragOver={(event) => {
                                                event.preventDefault();
                                                setDragActive(true);
                                            }}
                                            onDragLeave={() => setDragActive(false)}
                                            onDrop={(event) => {
                                                event.preventDefault();
                                                setDragActive(false);
                                                const file = event.dataTransfer.files?.[0];
                                                if (file) {
                                                    void handleManualFile(file, {
                                                        frameworkId: selectedFrameworkId,
                                                        controlId: selectedControl.id,
                                                        mode: "upload",
                                                    });
                                                }
                                            }}
                                            className={cn(
                                                "border-2 border-dashed rounded-xl p-6 text-center transition-colors",
                                                dragActive
                                                    ? "border-orange-500/60 bg-orange-500/5"
                                                    : "border-border/60 bg-background/30",
                                            )}
                                        >
                                            <UploadCloud className="w-6 h-6 text-muted-foreground mx-auto mb-3" />
                                            <p className="text-sm font-medium text-foreground">
                                                Drop file here or click to upload
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                PDF, PNG, JPG, XLSX, DOCX, CSV are supported.
                                            </p>
                                            <Button variant="plain"
                                                type="button"
                                                disabled={isUploading}
                                                onClick={() => openFilePicker({
                                                    frameworkId: selectedFrameworkId,
                                                    controlId: selectedControl.id,
                                                    mode: "upload",
                                                })}
                                                className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors h-auto"
                                            >
                                                {isUploading ? "Uploading..." : "Browse Files"}
                                            </Button>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-2">
                                            <input
                                                type="url"
                                                value={linkDraft}
                                                onChange={(event) => setLinkDraft(event.target.value)}
                                                placeholder="Paste evidence URL"
                                                className="flex-1 bg-secondary/60 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-orange-500/50 transition-colors"
                                            />
                                            <Button variant="plain"
                                                type="button"
                                                disabled={isUploading || !linkDraft.trim()}
                                                onClick={() => void handleLinkSubmit(selectedControl)}
                                                className="px-4 py-2 bg-secondary hover:bg-secondary disabled:opacity-50 text-foreground text-sm font-medium rounded-lg transition-colors flex items-center gap-2 h-auto"
                                            >
                                                <Link2 className="w-3.5 h-3.5" />
                                                Add Link
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-border/60 pt-5">
                                <Button variant="plain"
                                    onClick={() => setAuditOpen((previous) => !previous)}
                                    className="w-full flex items-center justify-between text-left h-auto"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Audit Trail</p>
                                        <p className="text-xs text-muted-foreground mt-1">{selectedControl.auditTrail.length} upload event{selectedControl.auditTrail.length === 1 ? "" : "s"} recorded.</p>
                                    </div>
                                    {auditOpen ? (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </Button>

                                {auditOpen && (
                                    <div className="mt-4 space-y-4">
                                        {selectedControl.auditTrail.length === 0 ? (
                                            <p className="text-xs text-muted-foreground italic">No evidence uploaded yet for this control.</p>
                                        ) : (
                                            selectedControl.auditTrail.map((event, index) => (
                                                <div key={event.id} className="flex gap-3">
                                                    <div className="flex flex-col items-center">
                                                        <span
                                                            className={cn(
                                                                "w-2.5 h-2.5 rounded-full mt-1",
                                                                event.kind === "uploaded" || event.kind === "replaced"
                                                                    ? "bg-emerald-500"
                                                                    : "bg-slate-600",
                                                            )}
                                                        />
                                                        {index !== selectedControl.auditTrail.length - 1 && <span className="w-px flex-1 bg-secondary mt-2" />}
                                                    </div>
                                                    <div className="pb-4">
                                                        <p className="text-sm text-foreground">{event.message}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(event.at)}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-24 px-6 text-center">
                            <FolderGit2 className="w-12 h-12 text-muted-foreground/50 mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">Select a control to review its evidence</p>
                            <p className="text-xs text-muted-foreground mt-1">The detail panel will load without leaving the page.</p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {replaceContext && (
                    <ReplaceConfirmModal
                        onCancel={() => setReplaceContext(null)}
                        onConfirm={() => {
                            openFilePicker(replaceContext);
                            setReplaceContext(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
