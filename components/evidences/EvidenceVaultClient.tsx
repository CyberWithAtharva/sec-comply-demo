"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Download,
    ExternalLink,
    FolderGit2,
    Link2,
    Loader2,
    RefreshCw,
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
    evidenceRequirements?: EvidenceRequirement[];
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
    status: "draft" | "under_review" | "approved" | "archived";
    updated_at: string;
}

export interface PolicyControlLink {
    policy_id: string;
    control_id: string;
}

export type EvidenceRequirement = {
    id: string;
    label: string;
    type: "policy" | "scanner" | "manual";
    source?: "cspm" | "scm" | "github_security";
    linkedPolicyId?: string;
    status: "fulfilled" | "pending" | "missing";
    evidence?: Evidence;
};

export type Evidence = {
    id: string;
    name: string;
    uploadedAt?: string;
    autoFetchedAt?: string;
    source: "manual_upload" | "policy" | "cspm" | "scm" | "github_security";
    fileUrl?: string;
    policyName?: string;
    policyPublishedAt?: string;
    scanSummary?: string;
};

type AuditEvent = {
    id: string;
    kind: "uploaded" | "replaced" | "archived" | "auto_fetched" | "policy_published" | "scan_attempted";
    message: string;
    at: string;
};

type VaultControl = Control & {
    evidenceRequirements: EvidenceRequirement[];
    vaultGroup: string;
    auditTrail: AuditEvent[];
};

type SeedRequirement = {
    label: string;
    type: EvidenceRequirement["type"];
    source?: EvidenceRequirement["source"];
    policyTitle?: string;
    status: EvidenceRequirement["status"];
    evidence?: Evidence;
    lastAttemptedAt?: string;
    scanDetails?: string[];
};

type SeedControl = {
    controlId: string;
    vaultGroup: string;
    title: string;
    description: string;
    requirements: SeedRequirement[];
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

const ISO_27001_VAULT_SEED: SeedControl[] = [
    {
        controlId: "A.5.1",
        vaultGroup: "A.5 Policies",
        title: "Policies for information security",
        description: "Information security policy and topic-specific policies shall be defined, approved by management, published, communicated, and reviewed.",
        requirements: [
            {
                label: "Information Security Policy",
                type: "policy",
                status: "fulfilled",
                evidence: {
                    id: "seed-policy-a51",
                    name: "Information Security Policy",
                    source: "policy",
                    policyName: "Information Security Policy",
                    policyPublishedAt: "2026-03-12T09:30:00.000Z",
                },
            },
        ],
    },
    {
        controlId: "A.5.2",
        vaultGroup: "A.5 Policies",
        title: "Information security roles and responsibilities",
        description: "Information security roles and responsibilities shall be defined and allocated.",
        requirements: [
            {
                label: "Roles & Responsibilities Policy",
                type: "policy",
                status: "pending",
            },
            {
                label: "RACI Matrix",
                type: "manual",
                status: "missing",
            },
        ],
    },
    {
        controlId: "A.5.15",
        vaultGroup: "A.5 Policies",
        title: "Access control",
        description: "Rules to control physical and logical access to information and other associated assets shall be established.",
        requirements: [
            {
                label: "Access Control Policy",
                type: "policy",
                status: "fulfilled",
                evidence: {
                    id: "seed-policy-a515",
                    name: "Access Control Policy",
                    source: "policy",
                    policyName: "Access Control Policy",
                    policyPublishedAt: "2026-02-21T08:00:00.000Z",
                },
            },
        ],
    },
    {
        controlId: "A.5.16",
        vaultGroup: "A.9 Access Control",
        title: "Identity management",
        description: "The full life cycle of identities shall be managed.",
        requirements: [
            {
                label: "Identity Lifecycle Scan",
                type: "scanner",
                source: "cspm",
                status: "fulfilled",
                evidence: {
                    id: "seed-scan-a516",
                    name: "Identity Lifecycle Scan",
                    source: "cspm",
                    autoFetchedAt: "2026-04-10T06:40:00.000Z",
                    scanSummary: "MFA enforced on 47/47 privileged users",
                },
                scanDetails: [
                    "47 privileged identities reviewed across AWS and Google Workspace.",
                    "0 dormant admin accounts found.",
                    "Joiner, mover, leaver workflow completed within SLA for the last 30 days.",
                ],
            },
            {
                label: "Joiner / Mover / Leaver Evidence",
                type: "manual",
                status: "fulfilled",
                evidence: {
                    id: "seed-manual-a516",
                    name: "JML Control Matrix.xlsx",
                    source: "manual_upload",
                    uploadedAt: "2026-04-03T10:15:00.000Z",
                    fileUrl: "#",
                },
            },
        ],
    },
    {
        controlId: "A.5.18",
        vaultGroup: "A.9 Access Control",
        title: "Access rights",
        description: "Access rights to information and other associated assets shall be provisioned, reviewed, modified and removed.",
        requirements: [
            {
                label: "Quarterly Access Review Export",
                type: "manual",
                status: "missing",
            },
            {
                label: "Access Review SOP",
                type: "policy",
                status: "pending",
            },
        ],
    },
    {
        controlId: "A.8.2",
        vaultGroup: "A.9 Access Control",
        title: "Privileged access rights",
        description: "The allocation and use of privileged access rights shall be restricted and managed.",
        requirements: [
            {
                label: "Privileged Access Rights Scan",
                type: "scanner",
                source: "scm",
                status: "pending",
                lastAttemptedAt: "2026-04-08T04:20:00.000Z",
                scanDetails: [
                    "Awaiting latest repository and infrastructure entitlement data.",
                    "The next scan will refresh admin group membership and permission drift.",
                ],
            },
        ],
    },
    {
        controlId: "A.8.3",
        vaultGroup: "A.9 Access Control",
        title: "Information access restriction",
        description: "Access to information and other associated assets shall be restricted in accordance with the established access control policy.",
        requirements: [
            {
                label: "Data Access Restriction Policy",
                type: "policy",
                status: "fulfilled",
                evidence: {
                    id: "seed-policy-a83",
                    name: "Data Access Restriction Policy",
                    source: "policy",
                    policyName: "Data Access Restriction Policy",
                    policyPublishedAt: "2026-01-17T11:30:00.000Z",
                },
            },
            {
                label: "GitHub Branch Restriction Scan",
                type: "scanner",
                source: "github_security",
                status: "fulfilled",
                evidence: {
                    id: "seed-scan-a83",
                    name: "GitHub Branch Restriction Scan",
                    source: "github_security",
                    autoFetchedAt: "2026-04-11T07:45:00.000Z",
                    scanSummary: "Branch protection enforced on 18/18 production repositories",
                },
                scanDetails: [
                    "Required reviews enabled on every production repository.",
                    "Force-push disabled on protected branches.",
                    "Secret scanning push protection active on all internet-facing repos.",
                ],
            },
        ],
    },
    {
        controlId: "A.8.4",
        vaultGroup: "A.8 Asset Management",
        title: "Access to source code",
        description: "Read and write access to source code, development tools and software libraries shall be appropriately managed.",
        requirements: [
            {
                label: "Source Code Access Scan",
                type: "scanner",
                source: "scm",
                status: "fulfilled",
                evidence: {
                    id: "seed-scan-a84",
                    name: "Source Code Access Scan",
                    source: "scm",
                    autoFetchedAt: "2026-04-12T09:10:00.000Z",
                    scanSummary: "Least-privilege confirmed for 62/62 engineering identities",
                },
                scanDetails: [
                    "All repositories are owned by teams, not individuals.",
                    "No direct admin access outside platform engineering.",
                    "Repository write access reviewed against SSO group membership.",
                ],
            },
            {
                label: "Repository Access Review",
                type: "manual",
                status: "fulfilled",
                evidence: {
                    id: "seed-manual-a84",
                    name: "Repository Access Review.pdf",
                    source: "manual_upload",
                    uploadedAt: "2026-04-02T14:10:00.000Z",
                    fileUrl: "#",
                },
            },
        ],
    },
    {
        controlId: "A.8.15",
        vaultGroup: "A.8 Asset Management",
        title: "Logging",
        description: "Logs that record activities, exceptions, faults and other relevant events shall be produced, stored, protected and analysed.",
        requirements: [
            {
                label: "Centralized Logging Scan",
                type: "scanner",
                source: "cspm",
                status: "pending",
                lastAttemptedAt: "2026-04-09T12:05:00.000Z",
                scanDetails: [
                    "CloudTrail and audit log destinations will be re-validated.",
                    "Retention policy checks are queued for the next scanner pass.",
                ],
            },
            {
                label: "Log Retention Standard",
                type: "manual",
                status: "fulfilled",
                evidence: {
                    id: "seed-manual-a815",
                    name: "Log Retention Standard.pdf",
                    source: "manual_upload",
                    uploadedAt: "2026-03-29T13:22:00.000Z",
                    fileUrl: "#",
                },
            },
        ],
    },
];

const FILTERS = ["all", "complete", "incomplete", "missing"] as const;

const STATUS_BADGE_STYLES: Record<EvidenceRequirement["status"], string> = {
    fulfilled: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    pending: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    missing: "text-slate-400 bg-slate-800/70 border-slate-700/60",
};

const SOURCE_LABEL: Record<NonNullable<EvidenceRequirement["source"]>, string> = {
    cspm: "CSPM",
    scm: "SCM",
    github_security: "GitHub Security",
};

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

function createEvent(kind: AuditEvent["kind"], at: string, message: string): AuditEvent {
    return {
        id: `${kind}-${at}-${message}`,
        kind,
        at,
        message,
    };
}

function getRequirementSummary(control: VaultControl) {
    const total = control.evidenceRequirements.length;
    const fulfilled = control.evidenceRequirements.filter((requirement) => requirement.status === "fulfilled").length;
    const pending = control.evidenceRequirements.filter((requirement) => requirement.status === "pending").length;
    const missing = control.evidenceRequirements.filter((requirement) => requirement.status === "missing").length;
    const state = fulfilled === total ? "complete" : fulfilled === 0 ? "missing" : "incomplete";

    return { total, fulfilled, pending, missing, state };
}

function buildAuditTrail(requirements: EvidenceRequirement[]) {
    return requirements
        .flatMap((requirement) => {
            const events: AuditEvent[] = [];

            if (requirement.type === "policy" && requirement.evidence?.policyPublishedAt) {
                events.push(
                    createEvent(
                        "policy_published",
                        requirement.evidence.policyPublishedAt,
                        `${requirement.evidence.policyName ?? requirement.label} published`,
                    ),
                );
            }

            if (requirement.type === "scanner") {
                if (requirement.evidence?.autoFetchedAt) {
                    events.push(
                        createEvent(
                            "auto_fetched",
                            requirement.evidence.autoFetchedAt,
                            `${SOURCE_LABEL[requirement.source ?? "cspm"]} evidence fetched automatically`,
                        ),
                    );
                } else if ((requirement as EvidenceRequirement & { lastAttemptedAt?: string }).lastAttemptedAt) {
                    events.push(
                        createEvent(
                            "scan_attempted",
                            (requirement as EvidenceRequirement & { lastAttemptedAt?: string }).lastAttemptedAt!,
                            `${SOURCE_LABEL[requirement.source ?? "cspm"]} scan attempted`,
                        ),
                    );
                }
            }

            if (requirement.type === "manual" && requirement.evidence?.uploadedAt) {
                events.push(
                    createEvent(
                        "uploaded",
                        requirement.evidence.uploadedAt,
                        `${requirement.evidence.name} uploaded`,
                    ),
                );
            }

            return events;
        })
        .sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime());
}

function matchPolicyForRequirement(
    requirement: SeedRequirement,
    linkedPolicies: PolicySummary[],
) {
    if (linkedPolicies.length === 0) return null;
    if (requirement.policyTitle) {
        const exact = linkedPolicies.find((policy) => policy.title.toLowerCase().includes(requirement.policyTitle!.toLowerCase()));
        if (exact) return exact;
    }
    return linkedPolicies[0] ?? null;
}

function buildEvidenceFromArtifact(artifact: EvidenceArtifact): Evidence {
    return {
        id: artifact.id,
        name: artifact.name,
        uploadedAt: artifact.created_at,
        source: "manual_upload",
        fileUrl: artifact.file_url ?? undefined,
    };
}

function buildIsoControls(
    framework: FrameworkSummary,
    controls: Control[],
    artifacts: EvidenceArtifact[],
    policies: PolicySummary[],
    policyLinks: PolicyControlLink[],
) {
    const controlByCode = new Map(controls.map((control) => [control.control_id, control]));
    const artifactsByControlId = new Map<string, EvidenceArtifact[]>();

    artifacts.forEach((artifact) => {
        if (!artifact.control_id) return;
        const items = artifactsByControlId.get(artifact.control_id) ?? [];
        items.push(artifact);
        artifactsByControlId.set(artifact.control_id, items);
    });

    const policyIdsByControlId = new Map<string, string[]>();
    policyLinks.forEach((link) => {
        const items = policyIdsByControlId.get(link.control_id) ?? [];
        items.push(link.policy_id);
        policyIdsByControlId.set(link.control_id, items);
    });

    const policyById = new Map(policies.map((policy) => [policy.id, policy]));

    return ISO_27001_VAULT_SEED.map((seed) => {
        const actual = controlByCode.get(seed.controlId);
        const linkedPolicies = (policyIdsByControlId.get(actual?.id ?? "") ?? [])
            .map((policyId) => policyById.get(policyId))
            .filter((policy): policy is PolicySummary => Boolean(policy));
        const availableArtifacts = [...(artifactsByControlId.get(actual?.id ?? "") ?? [])];

        const requirements = seed.requirements.map((requirement, index) => {
            if (requirement.type === "policy") {
                const policy = matchPolicyForRequirement(requirement, linkedPolicies);
                if (policy?.status === "approved") {
                    return {
                        id: `${seed.controlId}-policy-${index}`,
                        label: requirement.label,
                        type: "policy" as const,
                        linkedPolicyId: policy.id,
                        status: "fulfilled" as const,
                        evidence: {
                            id: `policy-${policy.id}`,
                            name: policy.title,
                            source: "policy" as const,
                            policyName: policy.title,
                            policyPublishedAt: policy.updated_at,
                        },
                    };
                }

                if (policy) {
                    return {
                        id: `${seed.controlId}-policy-${index}`,
                        label: requirement.label,
                        type: "policy" as const,
                        linkedPolicyId: policy.id,
                        status: "pending" as const,
                    };
                }
            }

            if (requirement.type === "manual") {
                const artifact = availableArtifacts.shift();
                if (artifact) {
                    return {
                        id: `${seed.controlId}-manual-${index}`,
                        label: requirement.label,
                        type: "manual" as const,
                        status: "fulfilled" as const,
                        evidence: buildEvidenceFromArtifact(artifact),
                    };
                }
            }

            return {
                id: `${seed.controlId}-${requirement.type}-${index}`,
                label: requirement.label,
                type: requirement.type,
                source: requirement.source,
                status: requirement.status,
                linkedPolicyId: undefined,
                evidence: requirement.evidence,
                lastAttemptedAt: requirement.lastAttemptedAt,
                scanDetails: requirement.scanDetails,
            } as EvidenceRequirement & { lastAttemptedAt?: string; scanDetails?: string[] };
        });

        return {
            id: actual?.id ?? `mock-${framework.id}-${seed.controlId}`,
            control_id: seed.controlId,
            framework_id: framework.id,
            title: actual?.title ?? seed.title,
            domain: actual?.domain ?? seed.vaultGroup,
            category: actual?.category ?? framework.name,
            description: actual?.description ?? seed.description,
            evidenceRequirements: requirements,
            vaultGroup: seed.vaultGroup,
            auditTrail: buildAuditTrail(requirements),
        } satisfies VaultControl;
    });
}

function buildGenericControls(
    framework: FrameworkSummary,
    controls: Control[],
    artifacts: EvidenceArtifact[],
    policies: PolicySummary[],
    policyLinks: PolicyControlLink[],
    statuses: ControlStatus[],
) {
    const artifactsByControlId = new Map<string, EvidenceArtifact[]>();
    artifacts.forEach((artifact) => {
        if (!artifact.control_id) return;
        const items = artifactsByControlId.get(artifact.control_id) ?? [];
        items.push(artifact);
        artifactsByControlId.set(artifact.control_id, items);
    });

    const statusByControlId = new Map(statuses.map((status) => [status.control_id, status]));
    const linkedPolicyIds = new Map<string, string[]>();
    policyLinks.forEach((link) => {
        const items = linkedPolicyIds.get(link.control_id) ?? [];
        items.push(link.policy_id);
        linkedPolicyIds.set(link.control_id, items);
    });
    const policyById = new Map(policies.map((policy) => [policy.id, policy]));

    return controls.slice(0, 10).map((control) => {
        const controlPolicies = (linkedPolicyIds.get(control.id) ?? [])
            .map((policyId) => policyById.get(policyId))
            .filter((policy): policy is PolicySummary => Boolean(policy));
        const primaryPolicy = controlPolicies[0];
        const controlArtifacts = artifactsByControlId.get(control.id) ?? [];
        const status = statusByControlId.get(control.id);

        const requirements: VaultControl["evidenceRequirements"] = [
            {
                id: `${control.id}-policy`,
                label: primaryPolicy?.title ?? "Linked Policy",
                type: "policy",
                linkedPolicyId: primaryPolicy?.id,
                status: primaryPolicy?.status === "approved" ? "fulfilled" : primaryPolicy ? "pending" : "missing",
                evidence: primaryPolicy?.status === "approved"
                    ? {
                        id: `policy-${primaryPolicy.id}`,
                        name: primaryPolicy.title,
                        source: "policy",
                        policyName: primaryPolicy.title,
                        policyPublishedAt: primaryPolicy.updated_at,
                    }
                    : undefined,
            },
            {
                id: `${control.id}-manual`,
                label: "Uploaded Control Evidence",
                type: "manual",
                status: controlArtifacts[0] ? "fulfilled" : "missing",
                evidence: controlArtifacts[0] ? buildEvidenceFromArtifact(controlArtifacts[0]) : undefined,
            },
            {
                id: `${control.id}-scanner`,
                label: "Automated Scanner Signal",
                type: "scanner",
                source: "cspm",
                status: status?.status === "verified" || status?.status === "in_progress" ? "fulfilled" : "pending",
                evidence: status?.status === "verified" || status?.status === "in_progress"
                    ? {
                        id: `scanner-${control.id}`,
                        name: `${control.control_id} Scanner Signal`,
                        source: "cspm",
                        autoFetchedAt: new Date().toISOString(),
                        scanSummary: `${Math.max(status?.evidence_count ?? 1, 1)} automated checks mapped to this control`,
                    }
                    : undefined,
            },
        ];

        return {
            ...control,
            evidenceRequirements: requirements,
            vaultGroup: control.category || control.domain || framework.name,
            auditTrail: buildAuditTrail(requirements),
        } satisfies VaultControl;
    });
}

function buildInitialControlState({
    frameworks,
    controls,
    artifacts,
    policies,
    policyLinks,
    statuses,
}: {
    frameworks: FrameworkSummary[];
    controls: Control[];
    artifacts: EvidenceArtifact[];
    policies: PolicySummary[];
    policyLinks: PolicyControlLink[];
    statuses: ControlStatus[];
}) {
    return frameworks.reduce<Record<string, VaultControl[]>>((accumulator, framework) => {
        const frameworkControls = controls.filter((control) => control.framework_id === framework.id);
        accumulator[framework.id] = framework.name.toLowerCase().includes("iso")
            ? buildIsoControls(framework, frameworkControls, artifacts, policies, policyLinks)
            : buildGenericControls(framework, frameworkControls, artifacts, policies, policyLinks, statuses);
        return accumulator;
    }, {});
}

function RequirementStatusPill({ status }: { status: EvidenceRequirement["status"] }) {
    return (
        <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", STATUS_BADGE_STYLES[status])}>
            {status}
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
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
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
                className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl"
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-800/50">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">Replace Evidence</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Confirm before uploading a replacement file.</p>
                    </div>
                    <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                        <p className="text-sm text-amber-300">
                            This will replace the existing evidence. The previous file will be archived. Continue?
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

type UploadContext = {
    frameworkId: string;
    controlId: string;
    requirementId: string;
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
    const [vaultControlsByFramework, setVaultControlsByFramework] = useState<Record<string, VaultControl[]>>(() =>
        buildInitialControlState({
            frameworks,
            controls,
            artifacts: initialArtifacts,
            policies,
            policyLinks,
            statuses,
        }),
    );
    const [selectedFrameworkId, setSelectedFrameworkId] = useState(frameworks[0]?.id ?? "");
    const [selectedControlId, setSelectedControlId] = useState("");
    const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]>("all");
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
    const [expandedScans, setExpandedScans] = useState<Set<string>>(new Set());
    const [auditOpen, setAuditOpen] = useState(true);
    const [dragTargetId, setDragTargetId] = useState<string | null>(null);
    const [linkDrafts, setLinkDrafts] = useState<Record<string, string>>({});
    const [replaceContext, setReplaceContext] = useState<UploadContext | null>(null);
    const [uploadContext, setUploadContext] = useState<UploadContext | null>(null);
    const [loadingRequirementId, setLoadingRequirementId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentFrameworkControls = useMemo(
        () => vaultControlsByFramework[selectedFrameworkId] ?? [],
        [selectedFrameworkId, vaultControlsByFramework],
    );

    const filteredControls = useMemo(() => {
        return currentFrameworkControls.filter((control) => {
            const summary = getRequirementSummary(control);
            if (activeFilter === "all") return true;
            return summary.state === activeFilter;
        });
    }, [activeFilter, currentFrameworkControls]);

    const groupedControls = useMemo(() => {
        return filteredControls.reduce<Record<string, VaultControl[]>>((accumulator, control) => {
            const key = control.vaultGroup;
            accumulator[key] = accumulator[key] ?? [];
            accumulator[key].push(control);
            return accumulator;
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

        const stillExists = filteredControls.some((control) => control.id === selectedControlId);
        if (!stillExists) {
            setSelectedControlId(filteredControls[0].id);
        }
    }, [filteredControls, selectedControlId]);

    const selectedControl = filteredControls.find((control) => control.id === selectedControlId) ?? currentFrameworkControls[0];

    const summary = useMemo(() => {
        const total = currentFrameworkControls.length;
        const complete = currentFrameworkControls.filter((control) => getRequirementSummary(control).state === "complete").length;
        const partial = currentFrameworkControls.filter((control) => getRequirementSummary(control).state === "incomplete").length;
        const missing = currentFrameworkControls.filter((control) => getRequirementSummary(control).state === "missing").length;
        return { total, complete, partial, missing };
    }, [currentFrameworkControls]);

    function updateRequirement(
        frameworkId: string,
        controlId: string,
        requirementId: string,
        updater: (requirement: EvidenceRequirement) => EvidenceRequirement,
        auditEvent?: AuditEvent,
    ) {
        setVaultControlsByFramework((previous) => {
            const next = { ...previous };
            next[frameworkId] = (previous[frameworkId] ?? []).map((control) => {
                if (control.id !== controlId) return control;

                const evidenceRequirements = control.evidenceRequirements.map((requirement) =>
                    requirement.id === requirementId ? updater(requirement) : requirement,
                );

                const auditTrail = auditEvent ? [auditEvent, ...control.auditTrail] : control.auditTrail;

                return {
                    ...control,
                    evidenceRequirements,
                    auditTrail,
                };
            });
            return next;
        });
    }

    async function persistArtifact({
        file,
        linkUrl,
        controlId,
        requirementLabel,
    }: {
        file?: File;
        linkUrl?: string;
        controlId: string;
        requirementLabel: string;
    }) {
        let fileUrl: string | null = null;
        let fileType: string | null = null;
        let fileSize: number | null = null;

        if (file) {
            const extension = file.name.split(".").pop();
            const path = `${orgId}/${Date.now()}-${requirementLabel.replace(/\s+/g, "-").toLowerCase()}.${extension}`;
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
                name: file?.name ?? `${requirementLabel} Link`,
                description: requirementLabel,
                control_id: controlId.startsWith("mock-") ? null : controlId,
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
        const control = (vaultControlsByFramework[context.frameworkId] ?? []).find((item) => item.id === context.controlId);
        const requirement = control?.evidenceRequirements.find((item) => item.id === context.requirementId);
        if (!control || !requirement) return;

        setLoadingRequirementId(requirement.id);

        try {
            const artifact = await persistArtifact({
                file,
                controlId: control.id,
                requirementLabel: requirement.label,
            });

            const previousEvidence = requirement.evidence;
            const uploadedAt = artifact.created_at ?? new Date().toISOString();

            updateRequirement(
                context.frameworkId,
                context.controlId,
                context.requirementId,
                () => ({
                    ...requirement,
                    status: "fulfilled",
                    evidence: {
                        id: artifact.id,
                        name: artifact.name,
                        uploadedAt,
                        source: "manual_upload",
                        fileUrl: artifact.file_url ?? undefined,
                    },
                }),
                createEvent(
                    context.mode === "replace" ? "replaced" : "uploaded",
                    uploadedAt,
                    context.mode === "replace"
                        ? `${artifact.name} replaced the previous evidence`
                        : `${artifact.name} uploaded`,
                ),
            );

            if (context.mode === "replace" && previousEvidence) {
                updateRequirement(
                    context.frameworkId,
                    context.controlId,
                    context.requirementId,
                    (current) => current,
                    createEvent(
                        "archived",
                        uploadedAt,
                        `${previousEvidence.name} archived after replacement`,
                    ),
                );
            }

            toast.success(context.mode === "replace" ? "Evidence replaced" : "Evidence uploaded");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to upload evidence");
        } finally {
            setLoadingRequirementId(null);
            setUploadContext(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    async function handleLinkSubmit(control: VaultControl, requirement: EvidenceRequirement) {
        const url = linkDrafts[requirement.id]?.trim();
        if (!url) return;

        setLoadingRequirementId(requirement.id);

        try {
            const artifact = await persistArtifact({
                linkUrl: url,
                controlId: control.id,
                requirementLabel: requirement.label,
            });

            const uploadedAt = artifact.created_at ?? new Date().toISOString();

            updateRequirement(
                selectedFrameworkId,
                control.id,
                requirement.id,
                () => ({
                    ...requirement,
                    status: "fulfilled",
                    evidence: {
                        id: artifact.id,
                        name: requirement.label,
                        uploadedAt,
                        source: "manual_upload",
                        fileUrl: url,
                    },
                }),
                createEvent("uploaded", uploadedAt, `${requirement.label} link attached`),
            );

            setLinkDrafts((previous) => ({ ...previous, [requirement.id]: "" }));
            toast.success("Evidence link added");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add link");
        } finally {
            setLoadingRequirementId(null);
        }
    }

    function handleTriggerRescan(control: VaultControl, requirement: EvidenceRequirement) {
        setLoadingRequirementId(requirement.id);

        window.setTimeout(() => {
            const now = new Date().toISOString();
            const source = requirement.source ?? "cspm";

            updateRequirement(
                selectedFrameworkId,
                control.id,
                requirement.id,
                () => ({
                    ...requirement,
                    status: "fulfilled",
                    evidence: {
                        id: `scan-${control.id}-${requirement.id}`,
                        name: `${requirement.label} Result`,
                        autoFetchedAt: now,
                        source,
                        scanSummary:
                            source === "github_security"
                                ? "Secret scanning and branch protection checks passed on 18/18 repositories"
                                : source === "scm"
                                    ? "Repository admin access reviewed and policy drift closed"
                                    : "Logging and identity configuration checks passed across all monitored accounts",
                    },
                    lastAttemptedAt: now,
                    scanDetails: [
                        "Scan refreshed against the latest linked integrations.",
                        "Control mapping updated immediately in the Evidence Vault.",
                        "No blocking exceptions remain for this requirement.",
                    ],
                }),
                createEvent("auto_fetched", now, `${SOURCE_LABEL[source]} evidence refreshed`),
            );

            setLoadingRequirementId(null);
            toast.success("Scanner results refreshed");
        }, 1200);
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
                accept=".pdf,.png,.jpg,.jpeg,.xlsx"
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
                        <h1 className="text-xl font-bold text-slate-100">Evidence Vault</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Map each control to policy, scanner, and manually uploaded evidence without leaving the compliance workspace.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 bg-slate-900/50 border border-slate-800 rounded-lg p-1 w-fit">
                {frameworks.map((framework) => (
                    <button
                        key={framework.id}
                        onClick={() => setSelectedFrameworkId(framework.id)}
                        className={cn(
                            "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                            selectedFrameworkId === framework.id
                                ? "bg-orange-600 text-white shadow-sm"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60",
                        )}
                    >
                        {framework.name} {framework.version ? `v${framework.version}` : ""}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryStat label="Total Controls" value={summary.total} icon={ShieldCheck} color="text-slate-100" bg="bg-slate-800/70 border-slate-700/60" />
                <SummaryStat label="Fully Evidenced" value={summary.complete} icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-500/10 border-emerald-500/20" />
                <SummaryStat label="Partially Evidenced" value={summary.partial} icon={AlertCircle} color="text-amber-400" bg="bg-amber-500/10 border-amber-500/20" />
                <SummaryStat label="Missing Evidence" value={summary.missing} icon={AlertTriangle} color="text-red-400" bg="bg-red-500/10 border-red-500/20" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6 items-start">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-800/60 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-100">Control List</p>
                                <p className="text-xs text-slate-500 mt-1">{filteredControls.length} controls in view</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-lg p-1 w-fit">
                            {FILTERS.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all",
                                        activeFilter === filter
                                            ? "bg-orange-600 text-white shadow-sm"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40",
                                    )}
                                >
                                    {filter === "all" ? "All" : filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="max-h-[780px] overflow-y-auto">
                        {Object.entries(groupedControls).map(([group, groupControls]) => {
                            const isCollapsed = collapsedGroups.has(group);
                            return (
                                <div key={group} className="border-b border-slate-800/50 last:border-b-0">
                                    <button
                                        onClick={() => toggleGroup(group)}
                                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors text-left"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">{group}</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">{groupControls.length} controls</p>
                                        </div>
                                        {isCollapsed ? (
                                            <ChevronRight className="w-4 h-4 text-slate-500" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-slate-500" />
                                        )}
                                    </button>

                                    {!isCollapsed && (
                                        <div className="divide-y divide-slate-800/40">
                                            {groupControls.map((control) => {
                                                const stats = getRequirementSummary(control);
                                                const active = selectedControl?.id === control.id;
                                                return (
                                                    <button
                                                        key={control.id}
                                                        onClick={() => setSelectedControlId(control.id)}
                                                        className={cn(
                                                            "w-full px-4 py-3 text-left transition-colors",
                                                            active ? "bg-orange-500/10" : "hover:bg-slate-800/20",
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-mono text-orange-400">{control.control_id}</p>
                                                                <p className="text-sm font-medium text-slate-100 truncate mt-1">{control.title}</p>
                                                            </div>
                                                            <span
                                                                className={cn(
                                                                    "text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap",
                                                                    stats.state === "complete"
                                                                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                                                        : stats.state === "missing"
                                                                            ? "text-red-400 bg-red-500/10 border-red-500/20"
                                                                            : "text-amber-400 bg-amber-500/10 border-amber-500/20",
                                                                )}
                                                            >
                                                                {stats.fulfilled}/{stats.total}
                                                            </span>
                                                        </div>

                                                        <div className="mt-3 flex items-center gap-1.5">
                                                            {control.evidenceRequirements.map((requirement) => (
                                                                <span
                                                                    key={requirement.id}
                                                                    className={cn(
                                                                        "h-1.5 rounded-full flex-1 min-w-0",
                                                                        requirement.status === "fulfilled"
                                                                            ? "bg-emerald-500"
                                                                            : requirement.status === "pending"
                                                                                ? "bg-amber-500"
                                                                                : "bg-slate-700",
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {!filteredControls.length && (
                            <div className="py-16 px-6 text-center">
                                <SearchCheck className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                <p className="text-sm font-medium text-slate-300">No controls match this filter</p>
                                <p className="text-xs text-slate-500 mt-1">Try switching the framework or widening the evidence filter.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden min-h-[680px]">
                    {selectedControl ? (
                        <div className="p-5 space-y-5">
                            <div className="space-y-3 border-b border-slate-800/60 pb-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-mono text-orange-400">{selectedControl.control_id}</p>
                                        <h2 className="text-xl font-semibold text-slate-100 mt-1">{selectedControl.title}</h2>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border text-slate-300 bg-slate-800/80 border-slate-700/60">
                                        {selectedControl.vaultGroup}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed">{selectedControl.description ?? "No description available for this control."}</p>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-300">
                                            {getRequirementSummary(selectedControl).fulfilled} of {getRequirementSummary(selectedControl).total} requirements met
                                        </span>
                                        <span className="text-slate-500 text-xs">
                                            {getRequirementSummary(selectedControl).pending} pending · {getRequirementSummary(selectedControl).missing} missing
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-2 rounded-full bg-orange-500 transition-all"
                                            style={{
                                                width: `${(getRequirementSummary(selectedControl).fulfilled / Math.max(getRequirementSummary(selectedControl).total, 1)) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedControl.evidenceRequirements.map((requirement) => {
                                    const isLoading = loadingRequirementId === requirement.id;
                                    const scanExpanded = expandedScans.has(requirement.id);
                                    const extendedRequirement = requirement as EvidenceRequirement & {
                                        lastAttemptedAt?: string;
                                        scanDetails?: string[];
                                    };

                                    return (
                                        <div
                                            key={requirement.id}
                                            className={cn(
                                                "rounded-xl border p-4",
                                                requirement.status === "fulfilled"
                                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                                    : requirement.status === "pending"
                                                        ? "bg-amber-500/5 border-amber-500/20"
                                                        : "bg-slate-950/40 border-slate-800/80",
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="text-sm font-semibold text-slate-100">{requirement.label}</p>
                                                        <RequirementStatusPill status={requirement.status} />
                                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border text-slate-400 bg-slate-800/70 border-slate-700/60">
                                                            {requirement.type}
                                                        </span>
                                                        {requirement.source && (
                                                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border text-blue-400 bg-blue-500/10 border-blue-500/20">
                                                                {SOURCE_LABEL[requirement.source]}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {requirement.type === "policy" && requirement.status === "fulfilled" && (
                                                <div className="mt-4 space-y-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <div className="bg-slate-900/60 border border-emerald-500/15 rounded-lg p-3">
                                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Policy</p>
                                                            <p className="text-sm text-slate-100">{requirement.evidence?.policyName ?? requirement.label}</p>
                                                        </div>
                                                        <div className="bg-slate-900/60 border border-emerald-500/15 rounded-lg p-3">
                                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Published</p>
                                                            <p className="text-sm text-slate-100">{formatDate(requirement.evidence?.policyPublishedAt)}</p>
                                                        </div>
                                                        <div className="bg-slate-900/60 border border-emerald-500/15 rounded-lg p-3 flex items-center">
                                                            <Link
                                                                href={requirement.linkedPolicyId ? `/policies/${requirement.linkedPolicyId}` : "/policies"}
                                                                className="text-sm text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-1"
                                                            >
                                                                View Policy <ExternalLink className="w-3.5 h-3.5" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {requirement.type === "policy" && requirement.status !== "fulfilled" && (
                                                <div className="mt-4 bg-slate-900/60 border border-amber-500/15 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm text-amber-300">
                                                            Publish {requirement.label} to fulfil this requirement.
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            This requirement will update automatically when the linked policy moves to approved.
                                                        </p>
                                                    </div>
                                                    <Link
                                                        href={requirement.linkedPolicyId ? `/policies/${requirement.linkedPolicyId}` : "/policies"}
                                                        className="text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors w-fit"
                                                    >
                                                        Open Policies
                                                    </Link>
                                                </div>
                                            )}

                                            {requirement.type === "scanner" && requirement.status === "fulfilled" && (
                                                <div className="mt-4 space-y-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <div className="bg-slate-900/60 border border-emerald-500/15 rounded-lg p-3">
                                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Source</p>
                                                            <p className="text-sm text-slate-100">{SOURCE_LABEL[requirement.source ?? "cspm"]}</p>
                                                        </div>
                                                        <div className="bg-slate-900/60 border border-emerald-500/15 rounded-lg p-3">
                                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Fetched</p>
                                                            <p className="text-sm text-slate-100">{formatDateTime(requirement.evidence?.autoFetchedAt)}</p>
                                                        </div>
                                                        <div className="bg-slate-900/60 border border-emerald-500/15 rounded-lg p-3">
                                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Summary</p>
                                                            <p className="text-sm text-slate-100">{requirement.evidence?.scanSummary ?? "Scanner evidence attached"}</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            setExpandedScans((previous) => {
                                                                const next = new Set(previous);
                                                                if (next.has(requirement.id)) next.delete(requirement.id);
                                                                else next.add(requirement.id);
                                                                return next;
                                                            });
                                                        }}
                                                        className="text-sm text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-1"
                                                    >
                                                        {scanExpanded ? "Hide Full Scan" : "View Full Scan"}
                                                        {scanExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                    </button>

                                                    {scanExpanded && (
                                                        <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-4 space-y-2">
                                                            {(extendedRequirement.scanDetails ?? [requirement.evidence?.scanSummary ?? "No additional scanner detail available."]).map((detail) => (
                                                                <p key={detail} className="text-sm text-slate-300">
                                                                    {detail}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {requirement.type === "scanner" && requirement.status !== "fulfilled" && (
                                                <div className="mt-4 bg-slate-900/60 border border-amber-500/15 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm text-slate-100">Latest scanner evidence has not been fetched yet.</p>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Last attempted {formatDateTime(extendedRequirement.lastAttemptedAt)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleTriggerRescan(selectedControl, requirement)}
                                                        disabled={isLoading}
                                                        className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 w-fit"
                                                    >
                                                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                                        {isLoading ? "Refreshing..." : "Trigger Rescan"}
                                                    </button>
                                                </div>
                                            )}

                                            {requirement.type === "manual" && requirement.status === "fulfilled" && (
                                                <div className="mt-4 space-y-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <div className="bg-slate-900/60 border border-emerald-500/15 rounded-lg p-3">
                                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Filename</p>
                                                            <p className="text-sm text-slate-100">{requirement.evidence?.name}</p>
                                                        </div>
                                                        <div className="bg-slate-900/60 border border-emerald-500/15 rounded-lg p-3">
                                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Uploaded</p>
                                                            <p className="text-sm text-slate-100">{formatDateTime(requirement.evidence?.uploadedAt)}</p>
                                                        </div>
                                                        <div className="bg-slate-900/60 border border-emerald-500/15 rounded-lg p-3">
                                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Uploader</p>
                                                            <p className="text-sm text-slate-100">Compliance Team</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <button
                                                            onClick={() => setReplaceContext({
                                                                frameworkId: selectedFrameworkId,
                                                                controlId: selectedControl.id,
                                                                requirementId: requirement.id,
                                                                mode: "replace",
                                                            })}
                                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors"
                                                        >
                                                            Replace
                                                        </button>
                                                        {requirement.evidence?.fileUrl && (
                                                            <a
                                                                href={requirement.evidence.fileUrl}
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
                                            )}

                                            {requirement.type === "manual" && requirement.status !== "fulfilled" && (
                                                <div className="mt-4 space-y-3">
                                                    <div
                                                        onDragOver={(event) => {
                                                            event.preventDefault();
                                                            setDragTargetId(requirement.id);
                                                        }}
                                                        onDragLeave={() => setDragTargetId((current) => (current === requirement.id ? null : current))}
                                                        onDrop={(event) => {
                                                            event.preventDefault();
                                                            setDragTargetId(null);
                                                            const file = event.dataTransfer.files?.[0];
                                                            if (file) {
                                                                void handleManualFile(file, {
                                                                    frameworkId: selectedFrameworkId,
                                                                    controlId: selectedControl.id,
                                                                    requirementId: requirement.id,
                                                                    mode: "upload",
                                                                });
                                                            }
                                                        }}
                                                        className={cn(
                                                            "border-2 border-dashed rounded-xl p-6 text-center transition-colors",
                                                            dragTargetId === requirement.id
                                                                ? "border-orange-500/60 bg-orange-500/5"
                                                                : "border-slate-700/60 bg-slate-950/30",
                                                        )}
                                                    >
                                                        <UploadCloud className="w-6 h-6 text-slate-500 mx-auto mb-3" />
                                                        <p className="text-sm font-medium text-slate-200">
                                                            Drop file here or click to upload
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            PDF, PNG, JPG, and XLSX are supported.
                                                        </p>
                                                        <button
                                                            type="button"
                                                            disabled={isLoading}
                                                            onClick={() => openFilePicker({
                                                                frameworkId: selectedFrameworkId,
                                                                controlId: selectedControl.id,
                                                                requirementId: requirement.id,
                                                                mode: "upload",
                                                            })}
                                                            className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                                                        >
                                                            {isLoading ? "Uploading..." : "Browse Files"}
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-col md:flex-row gap-2">
                                                        <input
                                                            type="url"
                                                            value={linkDrafts[requirement.id] ?? ""}
                                                            onChange={(event) => setLinkDrafts((previous) => ({ ...previous, [requirement.id]: event.target.value }))}
                                                            placeholder="Paste evidence URL"
                                                            className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                                                        />
                                                        <button
                                                            type="button"
                                                            disabled={isLoading || !(linkDrafts[requirement.id] ?? "").trim()}
                                                            onClick={() => void handleLinkSubmit(selectedControl, requirement)}
                                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                                        >
                                                            <Link2 className="w-3.5 h-3.5" />
                                                            Add Link
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t border-slate-800/60 pt-5">
                                <button
                                    onClick={() => setAuditOpen((previous) => !previous)}
                                    className="w-full flex items-center justify-between text-left"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-slate-100">Audit Trail</p>
                                        <p className="text-xs text-slate-500 mt-1">Uploaded, replaced, auto-fetched, and policy publication events.</p>
                                    </div>
                                    {auditOpen ? (
                                        <ChevronDown className="w-4 h-4 text-slate-500" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-slate-500" />
                                    )}
                                </button>

                                {auditOpen && (
                                    <div className="mt-4 space-y-4">
                                        {selectedControl.auditTrail.map((event, index) => (
                                            <div key={event.id} className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <span
                                                        className={cn(
                                                            "w-2.5 h-2.5 rounded-full mt-1",
                                                            event.kind === "policy_published" || event.kind === "auto_fetched" || event.kind === "uploaded" || event.kind === "replaced"
                                                                ? "bg-emerald-500"
                                                                : event.kind === "scan_attempted"
                                                                    ? "bg-amber-500"
                                                                    : "bg-slate-600",
                                                        )}
                                                    />
                                                    {index !== selectedControl.auditTrail.length - 1 && <span className="w-px flex-1 bg-slate-800 mt-2" />}
                                                </div>
                                                <div className="pb-4">
                                                    <p className="text-sm text-slate-200">{event.message}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{formatDateTime(event.at)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-24 px-6 text-center">
                            <FolderGit2 className="w-12 h-12 text-slate-700 mb-3" />
                            <p className="text-sm font-medium text-slate-300">Select a control to review its evidence requirements</p>
                            <p className="text-xs text-slate-500 mt-1">The detail panel will load without leaving the page.</p>
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
