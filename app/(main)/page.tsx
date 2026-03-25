import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { ExecutiveDashboard } from "@/components/programs/ExecutiveDashboard";

export default async function DashboardPage() {
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
                <ShieldCheck className="w-16 h-16 text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-300 mb-2">No Organization Assigned</h2>
                <p className="text-slate-500 text-sm max-w-md">
                    Your account hasn&apos;t been linked to an organization yet. Contact your Overwatch admin.
                </p>
            </div>
        );
    }

    const orgId = membership.org_id;

    // Fetch org frameworks
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
                    Contact your Overwatch admin to get started.
                </p>
            </div>
        );
    }

    const frameworkIds = orgFrameworks.map(f => f.framework_id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const risksQuery = (supabase.from("risks") as any)
        .select("id, severity, status")
        .eq("org_id", orgId)
        .not("status", "in", "(closed,accepted)");

    const [
        { data: controls },
        { data: openRisksRaw },
        { data: awsAccounts },
        { data: githubInstalls },
        { data: vaptVulnsRaw },
    ] = await Promise.all([
        supabase.from("controls").select("id, framework_id").in("framework_id", frameworkIds),
        risksQuery as Promise<{ data: { id: string; severity: string; status: string }[] | null }>,
        supabase.from("aws_accounts").select("id").eq("org_id", orgId).eq("status", "active"),
        supabase.from("github_installations").select("id").eq("org_id", orgId).eq("status", "active"),
        supabase.from("vulnerabilities").select("id, severity, status").eq("org_id", orgId).not("status", "in", "(resolved,fixed)"),
    ]);

    const controlIds = (controls ?? []).map(c => c.id);
    const awsAccountIds = (awsAccounts ?? []).map(a => a.id);
    const githubInstallIds = (githubInstalls ?? []).map(i => i.id);

    const [{ data: controlStatuses }, awsFindingsResult, githubFindingsResult] = await Promise.all([
        controlIds.length > 0
            ? supabase.from("control_status").select("control_id, status").eq("org_id", orgId).in("control_id", controlIds)
            : Promise.resolve({ data: [] as { control_id: string; status: string }[] }),
        awsAccountIds.length > 0
            ? supabase.from("aws_findings").select("id, severity").in("aws_account_id", awsAccountIds).eq("status", "ACTIVE")
            : Promise.resolve({ data: [] as { id: string; severity: string }[] }),
        githubInstallIds.length > 0
            ? supabase.from("github_findings").select("id, severity").in("installation_id", githubInstallIds).eq("state", "open")
            : Promise.resolve({ data: [] as { id: string; severity: string }[] }),
    ]);

    // ── Compute executive stats ──────────────────────────────────────────────

    const totalControls = controlIds.length;
    const verifiedControls = (controlStatuses ?? []).filter(
        s => s.status === "verified" || s.status === "not_applicable"
    ).length;
    const complianceScore = totalControls > 0 ? Math.round((verifiedControls / totalControls) * 100) : 0;
    const questionsRemaining = totalControls - verifiedControls;

    const activePrograms = orgFrameworks.length;
    const completedPrograms = orgFrameworks.filter(f => f.status === "completed").length;

    // Aggregate findings
    const normSev = (s: string) => s?.toLowerCase();
    const allFindings: { severity: string }[] = [
        ...(openRisksRaw ?? []).map(r => ({ severity: normSev(r.severity) })),
        ...(awsFindingsResult.data ?? []).map(f => ({ severity: normSev(f.severity) })),
        ...(githubFindingsResult.data ?? []).map(f => ({ severity: normSev(f.severity) })),
        ...(vaptVulnsRaw ?? []).map(f => ({ severity: normSev((f as { severity: string }).severity) })),
    ];

    const findingsBySeverity = {
        critical: allFindings.filter(f => f.severity === "critical").length,
        high:     allFindings.filter(f => f.severity === "high").length,
        medium:   allFindings.filter(f => f.severity === "medium").length,
        low:      allFindings.filter(f => f.severity === "low").length,
        remediated: 0,
    };
    const openFindings = allFindings.length;
    const criticalFindings = findingsBySeverity.critical;

    // Framework names for active programs
    const frameworkNames = orgFrameworks.map(of => {
        const fw = of.frameworks as { name: string; version: string } | null;
        return fw?.name ?? "Unknown";
    });

    return (
        <ExecutiveDashboard
            complianceScore={complianceScore}
            activePrograms={activePrograms}
            completedPrograms={completedPrograms}
            openFindings={openFindings}
            criticalFindings={criticalFindings}
            controlsCoverage={complianceScore}
            verifiedControls={verifiedControls}
            totalControls={totalControls}
            questionsRemaining={questionsRemaining}
            findingsBySeverity={findingsBySeverity}
            frameworkNames={frameworkNames}
        />
    );
}
