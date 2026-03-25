import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { ControlRequirementsClient } from "@/components/gap-assessment/ControlRequirementsClient";

export default async function ControlRequirementsPage() {
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
                <ClipboardList className="w-16 h-16 text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-300 mb-2">No Organization Assigned</h2>
                <p className="text-slate-500 text-sm max-w-md">Contact your admin to link you to an organization.</p>
            </div>
        );
    }

    const orgId = membership.org_id;

    const { data: orgFrameworks } = await supabase
        .from("org_frameworks")
        .select("framework_id, frameworks(id, name, version, controls_count)")
        .eq("org_id", orgId);

    if (!orgFrameworks || orgFrameworks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <ClipboardList className="w-16 h-16 text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-300 mb-2">No Frameworks Assigned</h2>
                <p className="text-slate-500 text-sm max-w-md">Ask your admin to assign compliance frameworks before viewing control requirements.</p>
            </div>
        );
    }

    const frameworkIds = orgFrameworks.map(f => f.framework_id);

    const [{ data: controls }, { data: controlStatuses }] = await Promise.all([
        supabase
            .from("controls")
            .select("id, framework_id, control_id, title, domain, category")
            .in("framework_id", frameworkIds),
        supabase
            .from("control_status")
            .select("control_id, status, evidence_count")
            .eq("org_id", orgId),
    ]);

    const statusMap = new Map(
        (controlStatuses ?? []).map(s => [s.control_id, s])
    );

    // Build per-domain stats
    const domainMap = new Map<string, { total: number; fulfilled: number; label: string }>();
    let totalControls = 0;
    let fulfilledControls = 0;
    let autoFulfilled = 0;
    let criticalPending = 0;
    let notStarted = 0;
    let evidencePending = 0;

    for (const control of controls ?? []) {
        const cs = statusMap.get(control.id);
        const domain = control.domain ?? "General";
        if (!domainMap.has(domain)) domainMap.set(domain, { total: 0, fulfilled: 0, label: domain });
        const d = domainMap.get(domain)!;
        d.total++;
        totalControls++;

        if (cs?.status === "verified" || cs?.status === "not_applicable") {
            fulfilledControls++;
            d.fulfilled++;
            if (cs.status === "not_applicable") autoFulfilled++;
        } else if (!cs || cs.status === "not_started") {
            notStarted++;
        } else if (cs.status === "in_progress") {
            if ((cs.evidence_count ?? 0) === 0) evidencePending++;
            else criticalPending++;
        } else {
            criticalPending++;
        }
    }

    const overallScore = totalControls > 0 ? Math.round((fulfilledControls / totalControls) * 100) : 0;

    const frameworkList = orgFrameworks.map(of => {
        const fw = of.frameworks as { id: string; name: string; version: string; controls_count: number } | null;
        return { id: of.framework_id, name: fw?.name ?? "Unknown", version: fw?.version ?? "" };
    });

    const domainSections = Array.from(domainMap.values()).sort((a, b) => b.total - a.total);

    return (
        <ControlRequirementsClient
            orgId={orgId}
            totalControls={totalControls}
            fulfilledControls={fulfilledControls}
            overallScore={overallScore}
            autoFulfilled={autoFulfilled}
            criticalPending={criticalPending}
            notStarted={notStarted}
            evidencePending={evidencePending}
            frameworks={frameworkList}
            domainSections={domainSections}
        />
    );
}
