import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: membership } = await supabase
            .from("organization_members")
            .select("org_id")
            .eq("user_id", user.id)
            .limit(1)
            .single();

        if (!membership) return NextResponse.json({ error: "No org" }, { status: 403 });
        const orgId = membership.org_id;

        const body = await req.json().catch(() => ({}));
        const { control_ids: requestedControlIds } = body as { control_ids?: string[] };

        // Get all frameworks assigned to this org
        const { data: orgFrameworks } = await supabase
            .from("org_frameworks")
            .select("framework_id")
            .eq("org_id", orgId);

        if (!orgFrameworks || orgFrameworks.length === 0) {
            return NextResponse.json({ created: 0, skipped: 0 });
        }

        const frameworkIds = orgFrameworks.map(f => f.framework_id);

        // Get all controls for org's frameworks
        const controlQuery = supabase
            .from("controls")
            .select("id, control_id, title, domain, category")
            .in("framework_id", frameworkIds);

        if (requestedControlIds && requestedControlIds.length > 0) {
            controlQuery.in("id", requestedControlIds);
        }

        const { data: controls } = await controlQuery;
        if (!controls || controls.length === 0) {
            return NextResponse.json({ created: 0, skipped: 0 });
        }

        const controlIds = controls.map(c => c.id);

        // Get control statuses — only process controls that are not verified/N/A
        const { data: statuses } = await supabase
            .from("control_status")
            .select("control_id, status, evidence_count")
            .eq("org_id", orgId)
            .in("control_id", controlIds)
            .not("status", "in", '("verified","not_applicable")');

        const gapControlIds = new Set((statuses ?? []).map(s => s.control_id));

        // Also include controls with NO status row (entirely not_started)
        const { data: existingStatuses } = await supabase
            .from("control_status")
            .select("control_id")
            .eq("org_id", orgId)
            .in("control_id", controlIds);

        const allWithStatus = new Set((existingStatuses ?? []).map(s => s.control_id));
        for (const c of controls) {
            if (!allWithStatus.has(c.id)) gapControlIds.add(c.id);
        }

        if (gapControlIds.size === 0) {
            return NextResponse.json({ created: 0, skipped: 0, message: "No gaps found" });
        }

        // Get existing gap risks to deduplicate
        const { data: existingRisks } = await supabase
            .from("risks")
            .select("control_id")
            .eq("org_id", orgId)
            .eq("source", "gap")
            .in("control_id", Array.from(gapControlIds));

        const alreadyHasRisk = new Set((existingRisks ?? []).map(r => r.control_id));

        // Get evidence counts for severity weighting
        const evidenceMap = new Map((statuses ?? []).map(s => [s.control_id, s.evidence_count ?? 0]));

        let created = 0;
        let skipped = 0;

        for (const control of controls) {
            if (!gapControlIds.has(control.id)) continue;

            if (alreadyHasRisk.has(control.id)) {
                skipped++;
                continue;
            }

            const hasEvidence = (evidenceMap.get(control.id) ?? 0) > 0;
            // Higher likelihood/impact if no evidence at all
            const likelihood = hasEvidence ? 2 : 3;
            const impact = 3;

            const { error } = await supabase
                .from("risks")
                .insert({
                    org_id: orgId,
                    title: `Compliance Gap: ${control.title}`,
                    category: "compliance",
                    description: `Control ${control.control_id} (${control.domain}) has not been verified. This gap may indicate a missing policy, evidence, or remediation action.`,
                    likelihood,
                    impact,
                    status: "identified",
                    source: "gap",
                    source_ref: control.id,
                    control_id: control.id,
                });

            if (error) {
                console.error("Failed to create gap risk:", control.title, error.message);
            } else {
                created++;
            }
        }

        return NextResponse.json({ created, skipped });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Sync failed";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
