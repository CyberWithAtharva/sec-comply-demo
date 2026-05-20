// Shared types and helpers for the Policy Management v2 module.

export type PolicyStatusV2 = "draft" | "in_review" | "awaiting_approval" | "active" | "superseded";
export type PolicyStatusLegacy = "draft" | "under_review" | "approved" | "archived";
export type PolicyStatus = PolicyStatusV2 | PolicyStatusLegacy;

/** Normalise legacy enum values so the v2 UI can speak a single vocabulary. */
export function normaliseStatus(s: string): PolicyStatusV2 {
    switch (s) {
        case "under_review": return "in_review";
        case "approved": return "active";
        case "archived": return "superseded";
        default: return (["draft", "in_review", "awaiting_approval", "active", "superseded"].includes(s) ? s : "draft") as PolicyStatusV2;
    }
}

export const STATUS_LABEL: Record<PolicyStatusV2, string> = {
    draft: "Draft",
    in_review: "In Review",
    awaiting_approval: "Awaiting Approval",
    active: "Active",
    superseded: "Superseded",
};

export const STATUS_CLASSES: Record<PolicyStatusV2, string> = {
    draft: "bg-secondary/60 text-muted-foreground border-border",
    in_review: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    awaiting_approval: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    superseded: "bg-secondary/40 text-muted-foreground/70 border-border/60",
};

export const FRAMEWORKS = [
    { id: "iso", label: "ISO 27001", short: "ISO" },
    { id: "soc2", label: "SOC 2", short: "SOC2" },
    { id: "hipaa", label: "HIPAA", short: "HIPAA" },
    { id: "gdpr", label: "GDPR", short: "GDPR" },
    { id: "dpdp", label: "DPDP", short: "DPDP" },
] as const;

export const FRAMEWORK_CLASSES: Record<string, string> = {
    iso: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    soc2: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    hipaa: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    gdpr: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    dpdp: "bg-pink-500/10 text-pink-400 border-pink-500/30",
};

export const CATEGORIES = [
    "Governance", "Access Control", "Operations",
    "Incident & BCP", "Data", "HR", "Vendor", "Physical", "Privacy",
] as const;

/** Replace [Variable_Name] occurrences with their org values. Unknown keys are left intact. */
export function substituteVariables(content: string, vars: Record<string, string>): string {
    return content.replace(/\[([A-Za-z0-9_]+)\]/g, (m, key) => {
        const v = vars[`[${key}]`];
        return v != null && v !== "" ? v : m;
    });
}

/** Compute next version from a current version string + classification. */
export function nextVersion(current: string, classification: "minor" | "major"): string {
    const m = current.match(/v?(\d+)\.(\d+)/);
    if (!m) return classification === "major" ? "v2.0" : "v1.1";
    const [, majS, minS] = m;
    const maj = Number(majS);
    const min = Number(minS);
    if (classification === "major") return `v${maj + 1}.0`;
    return `v${maj}.${min + 1}`;
}

export interface PolicyListItem {
    id: string;
    code: string | null;
    title: string;
    category: string | null;
    frameworks_list: string[];
    status: string;
    version: string;
    updated_at: string;
    description: string | null;
    updatedBy: string | null;
    ackDone: number;
    ackTotal: number;
}
