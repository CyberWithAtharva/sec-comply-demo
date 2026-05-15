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
                <ClipboardList className="w-16 h-16 text-muted-foreground/70 mb-4" />
                <h2 className="text-xl font-semibold text-muted-foreground mb-2">No Organization Assigned</h2>
                <p className="text-muted-foreground text-sm max-w-md">Contact your admin to link you to an organization.</p>
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
                <ClipboardList className="w-16 h-16 text-muted-foreground/70 mb-4" />
                <h2 className="text-xl font-semibold text-muted-foreground mb-2">No Frameworks Assigned</h2>
                <p className="text-muted-foreground text-sm max-w-md">Ask your admin to assign compliance frameworks before viewing control requirements.</p>
            </div>
        );
    }

    const frameworkIds = orgFrameworks.map(f => f.framework_id);

    const [{ data: controls }, { data: controlStatuses }] = await Promise.all([
        supabase
            .from("controls")
            .select("id, framework_id, control_id, title, domain, category, description, sort_order")
            .in("framework_id", frameworkIds)
            .order("sort_order", { ascending: true })
            .order("control_id", { ascending: true }),
        supabase
            .from("control_status")
            .select("control_id, status, evidence_count, notes, last_updated")
            .eq("org_id", orgId),
    ]);

    const statusMap = new Map(
        (controlStatuses ?? []).map(s => [s.control_id, s])
    );

    const frameworkList = orgFrameworks.map(of => {
        const fw = of.frameworks as { id: string; name: string; version: string; controls_count: number } | null;
        return { id: of.framework_id, name: fw?.name ?? "Unknown", version: fw?.version ?? "" };
    });

    const frameworkStats = frameworkList.map((framework) => {
        const frameworkControls = (controls ?? []).filter((control) => control.framework_id === framework.id);
        const domainMap = new Map<string, { total: number; fulfilled: number; label: string }>();
        let totalControls = 0;
        let fulfilledControls = 0;
        let autoFulfilled = 0;
        let criticalPending = 0;
        let notStarted = 0;
        let evidencePending = 0;

        for (const control of frameworkControls) {
            const cs = statusMap.get(control.id);
            const domain = control.domain ?? "General";
            if (!domainMap.has(domain)) domainMap.set(domain, { total: 0, fulfilled: 0, label: domain });
            const domainEntry = domainMap.get(domain)!;
            domainEntry.total++;
            totalControls++;

            if (cs?.status === "verified" || cs?.status === "not_applicable") {
                fulfilledControls++;
                domainEntry.fulfilled++;
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

        return {
            frameworkId: framework.id,
            totalControls,
            fulfilledControls,
            overallScore: totalControls > 0 ? Math.round((fulfilledControls / totalControls) * 100) : 0,
            autoFulfilled,
            criticalPending,
            notStarted,
            evidencePending,
            domainSections: Array.from(domainMap.values()).sort((a, b) => b.total - a.total),
        };
    });

    const controlList = (controls ?? []).map(c => ({
        id: c.id,
        frameworkId: c.framework_id,
        code: c.control_id,
        title: c.title,
        description: c.description ?? null,
        domain: c.domain ?? "General",
        category: c.category ?? "",
        sortOrder: c.sort_order ?? 0,
    }));

    const controlStatusList = (controlStatuses ?? []).map(s => ({
        controlId: s.control_id,
        status: s.status,
        evidenceCount: s.evidence_count ?? 0,
        notes: s.notes ?? null,
        lastUpdated: s.last_updated ?? null,
    }));

    return (
        <ControlRequirementsClient
            orgId={orgId}
            frameworks={frameworkList}
            frameworkStats={frameworkStats}
            controls={controlList}
            controlStatuses={controlStatusList}
        />
    );
}
