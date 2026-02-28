import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { GapAssessmentClient, type GapItem } from "@/components/gap-assessment/GapAssessmentClient";
import { RULE_CONTROL_MAP } from "@/lib/aws/controlMapping";

export default async function GapAssessmentPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <AlertTriangle className="w-16 h-16 text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-300 mb-2">No Organization Assigned</h2>
                <p className="text-slate-500 text-sm max-w-md">Contact your SecComply admin to link you to an organization.</p>
            </div>
        );
    }

    const orgId = membership.org_id;

    // 1. Org's frameworks
    const { data: orgFrameworks } = await supabase
        .from("org_frameworks")
        .select("framework_id, frameworks(id, name, version)")
        .eq("org_id", orgId);

    if (!orgFrameworks || orgFrameworks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <AlertTriangle className="w-16 h-16 text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-300 mb-2">No Frameworks Assigned</h2>
                <p className="text-slate-500 text-sm max-w-md">Ask your admin to assign compliance frameworks before viewing the gap assessment.</p>
            </div>
        );
    }

    const frameworkIds = orgFrameworks.map(f => f.framework_id);

    // Build framework name lookup
    const fwNameMap = new Map<string, string>();
    for (const of_ of orgFrameworks) {
        const fw = of_.frameworks as { id: string; name: string; version: string } | null;
        if (fw) fwNameMap.set(of_.framework_id, `${fw.name} ${fw.version}`);
    }

    // 2. All controls for org's frameworks
    const { data: controls } = await supabase
        .from("controls")
        .select("id, control_id, domain, category, title, framework_id")
        .in("framework_id", frameworkIds);

    if (!controls || controls.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <AlertTriangle className="w-16 h-16 text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-300 mb-2">No Controls Found</h2>
                <p className="text-slate-500 text-sm">No controls are seeded for the assigned frameworks.</p>
            </div>
        );
    }

    const controlIds = controls.map(c => c.id);

    // 3. Control statuses for this org
    const { data: controlStatuses } = await supabase
        .from("control_status")
        .select("control_id, status, evidence_count")
        .eq("org_id", orgId)
        .in("control_id", controlIds);

    const statusMap = new Map((controlStatuses ?? []).map(s => [s.control_id, s]));

    // 4. Approved policies with their linked control UUIDs
    const { data: approvedPolicies } = await supabase
        .from("policies")
        .select("id, title, framework_id, policy_controls(control_id)")
        .eq("org_id", orgId)
        .eq("status", "approved");

    // Build set of control UUIDs that have at least one approved policy
    const controlsWithPolicy = new Set<string>();
    for (const policy of approvedPolicies ?? []) {
        const links = policy.policy_controls as { control_id: string }[] | null;
        for (const lk of links ?? []) {
            controlsWithPolicy.add(lk.control_id);
        }
    }

    // 5. Active AWS findings — map rule_ids to control_id texts
    // Build a set of control_id texts that have active findings
    const { data: awsAccounts } = await supabase
        .from("aws_accounts")
        .select("id")
        .eq("org_id", orgId);

    const controlTextsWithFindings = new Map<string, { source: string; severity: string }[]>();

    if (awsAccounts && awsAccounts.length > 0) {
        const accountIds = awsAccounts.map(a => a.id);
        const { data: activeFindings } = await supabase
            .from("aws_findings")
            .select("rule_id, severity")
            .in("aws_account_id", accountIds)
            .eq("status", "ACTIVE");

        for (const finding of activeFindings ?? []) {
            const affectedControlTexts = RULE_CONTROL_MAP[finding.rule_id] ?? [];
            for (const ct of affectedControlTexts) {
                const existing = controlTextsWithFindings.get(ct) ?? [];
                existing.push({ source: "aws", severity: finding.severity.toLowerCase() });
                controlTextsWithFindings.set(ct, existing);
            }
        }
    }

    // 6. Build GapItem[] — every control that is NOT verified or not_applicable
    const gaps: GapItem[] = [];

    for (const control of controls) {
        const cs = statusMap.get(control.id);
        const currentStatus = cs?.status ?? "not_started";

        // Skip verified and N/A controls — they are not gaps
        if (currentStatus === "verified" || currentStatus === "not_applicable") continue;

        const evidenceCount = cs?.evidence_count ?? 0;
        const hasApprovedPolicy = controlsWithPolicy.has(control.id);
        const activeFindings = controlTextsWithFindings.get(control.control_id) ?? [];

        const gapTypes: GapItem["gapTypes"] = [];
        if (currentStatus === "not_started") gapTypes.push("not_started");
        if (evidenceCount === 0) gapTypes.push("no_evidence");
        if (!hasApprovedPolicy) gapTypes.push("no_policy");
        if (activeFindings.length > 0) gapTypes.push("has_finding");

        gaps.push({
            controlId: control.id,
            controlRef: control.control_id,
            title: control.title,
            domain: control.domain,
            category: control.category,
            frameworkId: control.framework_id,
            frameworkName: fwNameMap.get(control.framework_id) ?? "Unknown Framework",
            status: currentStatus,
            evidenceCount,
            hasApprovedPolicy,
            activeFindings,
            gapTypes,
        });
    }

    // Sort: most urgent first (has_finding > no_evidence > no_policy > not_started)
    const urgencyScore = (g: GapItem) =>
        (g.gapTypes.includes("has_finding") ? 8 : 0) +
        (g.gapTypes.includes("no_evidence") ? 4 : 0) +
        (g.gapTypes.includes("no_policy") ? 2 : 0) +
        (g.gapTypes.includes("not_started") ? 1 : 0);

    gaps.sort((a, b) => urgencyScore(b) - urgencyScore(a));

    const totalControls = controls.length;
    const verifiedControls = controls.filter(c => {
        const s = statusMap.get(c.id)?.status;
        return s === "verified";
    }).length;
    const complianceScore = totalControls > 0 ? Math.round((verifiedControls / totalControls) * 100) : 0;

    return (
        <GapAssessmentClient
            gaps={gaps}
            orgId={orgId}
            totalControls={totalControls}
            verifiedControls={verifiedControls}
            complianceScore={complianceScore}
        />
    );
}
