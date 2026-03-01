import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { ProgramsClient } from "@/components/programs/ProgramsClient";

export default async function ProgramsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Get user's org membership
    const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <ShieldCheck className="w-16 h-16 text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-300 mb-2">No Organization Assigned</h2>
                <p className="text-slate-500 text-sm max-w-md">
                    Your account hasn&apos;t been linked to an organization yet. Contact your SecComply admin.
                </p>
            </div>
        );
    }

    const orgId = membership.org_id;

    // Fetch org frameworks with framework details
    const { data: orgFrameworks } = await supabase
        .from("org_frameworks")
        .select("id, framework_id, status, frameworks(id, name, version, controls_count)")
        .eq("org_id", orgId);

    if (!orgFrameworks || orgFrameworks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <ShieldCheck className="w-16 h-16 text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-300 mb-2">No Frameworks Assigned</h2>
                <p className="text-slate-500 text-sm max-w-md">
                    No compliance frameworks have been assigned to your organization yet.
                    Contact your SecComply admin to get started.
                </p>
            </div>
        );
    }

    const frameworkIds = orgFrameworks.map(f => f.framework_id);

    // Fetch controls, policies, open risks, and integration account IDs in parallel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const risksQuery = (supabase.from("risks") as any)
        .select("id, title, severity, status, source, category, created_at")
        .eq("org_id", orgId)
        .not("status", "in", "(closed,accepted)")
        .order("created_at", { ascending: false })
        .limit(15);

    type RiskShape = { id: string; title: string; severity: string; status: string; source: string; category: string; created_at: string };

    const [{ data: controls }, { data: approvedPolicies }, { data: openRisksRaw }, { data: awsAccounts }, { data: githubInstalls }, { data: vaptVulnsRaw }] = await Promise.all([
        supabase
            .from("controls")
            .select("id, framework_id, control_id, title, domain, category")
            .in("framework_id", frameworkIds),
        supabase
            .from("policies")
            .select("id, title, status, framework_id, owner_id, next_review, version, updated_at")
            .eq("org_id", orgId)
            .in("status", ["approved", "under_review", "draft"])
            .order("updated_at", { ascending: false }),
        risksQuery as Promise<{ data: RiskShape[] | null }>,
        supabase.from("aws_accounts").select("id").eq("org_id", orgId).eq("status", "active"),
        supabase.from("github_installations").select("id").eq("org_id", orgId).eq("status", "active"),
        supabase.from("vulnerabilities").select("id, title, severity, status").eq("org_id", orgId).not("status", "in", "(resolved,fixed)").limit(10),
    ]);

    const controlIds = (controls ?? []).map(c => c.id);

    const awsAccountIds = (awsAccounts ?? []).map(a => a.id);
    const githubInstallIds = (githubInstalls ?? []).map(i => i.id);

    // Fetch control statuses + integration findings in parallel
    const [{ data: controlStatuses }, awsFindingsResult, githubFindingsResult] = await Promise.all([
        controlIds.length > 0
            ? supabase.from("control_status").select("control_id, status, evidence_count").eq("org_id", orgId).in("control_id", controlIds)
            : Promise.resolve({ data: [] as { control_id: string; status: string; evidence_count: number }[] }),
        awsAccountIds.length > 0
            ? supabase.from("aws_findings").select("id, title, severity").in("aws_account_id", awsAccountIds).eq("status", "ACTIVE").limit(10)
            : Promise.resolve({ data: [] as { id: string; title: string; severity: string }[] }),
        githubInstallIds.length > 0
            ? supabase.from("github_findings").select("id, title, severity").in("installation_id", githubInstallIds).eq("state", "open").limit(10)
            : Promise.resolve({ data: [] as { id: string; title: string; severity: string }[] }),
    ]);

    const awsFindings = awsFindingsResult.data ?? [];
    const githubFindings = githubFindingsResult.data ?? [];

    // Build a map of control_id -> status
    const statusMap = new Map(
        (controlStatuses ?? []).map(s => [s.control_id, s])
    );

    // Group controls by framework
    const controlsByFramework = new Map<string, NonNullable<typeof controls>>();
    for (const control of (controls ?? [])) {
        const existing = controlsByFramework.get(control.framework_id) ?? [];
        existing.push(control);
        controlsByFramework.set(control.framework_id, existing);
    }

    // Build framework data with real stats
    const frameworkData = orgFrameworks.map(of => {
        const fw = of.frameworks as { id: string; name: string; version: string; controls_count: number } | null;
        const fwControls = controlsByFramework.get(of.framework_id) ?? [];

        let verified = 0, inProgress = 0, notStarted = 0;
        let totalEvidence = 0;

        for (const control of fwControls) {
            const cs = statusMap.get(control.id);
            if (!cs) {
                notStarted++;
            } else if (cs.status === "verified" || cs.status === "not_applicable") {
                verified++;
                totalEvidence += cs.evidence_count ?? 0;
            } else if (cs.status === "in_progress") {
                inProgress++;
            } else {
                notStarted++;
            }
        }

        const total = fw?.controls_count ?? fwControls.length;
        const pct = total > 0 ? Math.round((verified / total) * 100) : 0;

        return {
            id: of.id,
            frameworkId: of.framework_id,
            name: fw?.name ?? "Unknown Framework",
            version: fw?.version ?? "",
            totalControls: total,
            verifiedControls: verified,
            inProgressControls: inProgress,
            notStartedControls: notStarted,
            evidenceCount: totalEvidence,
            percentage: pct,
            status: (pct >= 80 ? "Good" : pct >= 40 ? "Warning" : "Critical") as "Good" | "Warning" | "Critical",
        };
    });

    // Build controls with status for tabular display
    const controlsWithStatus = (controls ?? []).map(c => ({
        id: c.id,
        frameworkId: c.framework_id,
        controlId: c.control_id,
        title: c.title,
        domain: c.domain ?? "",
        category: c.category ?? "",
        status: statusMap.get(c.id)?.status ?? "not_started",
    }));

    // Gap counts per framework (controls not verified or N/A)
    const gapCounts: Record<string, number> = {};
    for (const of_ of orgFrameworks) {
        const fwControls = controlsByFramework.get(of_.framework_id) ?? [];
        const gaps = fwControls.filter(c => {
            const s = statusMap.get(c.id)?.status;
            return !s || (s !== "verified" && s !== "not_applicable");
        }).length;
        gapCounts[of_.framework_id] = gaps;
    }

    const policiesByFramework: Record<string, typeof approvedPolicies> = {};
    for (const p of approvedPolicies ?? []) {
        if (!p.framework_id) continue;
        if (!policiesByFramework[p.framework_id]) policiesByFramework[p.framework_id] = [];
        policiesByFramework[p.framework_id]!.push(p);
    }

    // Merge: risks table + raw integration findings
    const now = new Date().toISOString();
    const openRisksData: RiskShape[] = [
        ...((openRisksRaw as RiskShape[] | null) ?? []),
        ...(awsFindings as { id: string; title: string; severity: string }[]).map(f => ({
            id: `aws-${f.id}`, title: f.title,
            severity: f.severity.toLowerCase(),
            status: "identified", source: "aws", category: "technical", created_at: now,
        })),
        ...(githubFindings as { id: string; title: string; severity: string }[]).map(f => ({
            id: `gh-${f.id}`, title: f.title,
            severity: f.severity ?? "medium",
            status: "identified", source: "github", category: "technical", created_at: now,
        })),
        ...((vaptVulnsRaw as { id: string; title: string; severity: string; status: string }[] | null) ?? []).map(f => ({
            id: `vapt-${f.id}`, title: f.title,
            severity: f.severity ?? "medium",
            status: f.status, source: "vapt", category: "technical", created_at: now,
        })),
    ];

    return (
        <ProgramsClient
            frameworks={frameworkData}
            controls={controlsWithStatus}
            gapCounts={gapCounts}
            policiesByFramework={policiesByFramework}
            openRisks={openRisksData}
            allPolicies={approvedPolicies ?? []}
        />
    );
}
