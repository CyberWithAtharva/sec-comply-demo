import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { POLICY_TEMPLATES } from "@/lib/policies/templates";

export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Get the user's org
        const { data: membership } = await supabase
            .from("organization_members")
            .select("org_id")
            .eq("user_id", user.id)
            .limit(1)
            .single();

        if (!membership) return NextResponse.json({ error: "No org found" }, { status: 403 });
        const orgId = membership.org_id;

        // Get assigned frameworks
        const { data: orgFrameworks } = await supabase
            .from("org_frameworks")
            .select("framework_id, frameworks(id, name)")
            .eq("org_id", orgId);

        if (!orgFrameworks || orgFrameworks.length === 0) {
            return NextResponse.json({ error: "No frameworks assigned to this org" }, { status: 400 });
        }

        // Get already generated policies to avoid duplicates
        const { data: existingGenerated } = await supabase
            .from("policies")
            .select("title, framework_id")
            .eq("org_id", orgId)
            .eq("is_generated", true);

        const existingKeys = new Set(
            (existingGenerated ?? []).map(p => `${p.title}::${p.framework_id}`)
        );

        let generated = 0;
        let skipped = 0;
        const createdPolicies: unknown[] = [];

        for (const orgFw of orgFrameworks) {
            const fw = orgFw.frameworks as { id: string; name: string } | null;
            if (!fw) continue;

            // Find templates that apply to this framework
            const matching = POLICY_TEMPLATES.filter(t =>
                t.applicableFrameworks.includes(fw.name)
            );

            for (const template of matching) {
                const key = `${template.title}::${orgFw.framework_id}`;
                if (existingKeys.has(key)) {
                    skipped++;
                    continue;
                }

                // Create the policy
                const { data: policy, error: policyErr } = await supabase
                    .from("policies")
                    .insert({
                        org_id: orgId,
                        title: template.title,
                        version: "1.0",
                        status: "draft",
                        content: template.content,
                        is_generated: true,
                        framework_id: orgFw.framework_id,
                        next_review: new Date(
                            Date.now() + template.nextReviewMonths * 30 * 24 * 60 * 60 * 1000
                        ).toISOString().split("T")[0],
                    })
                    .select("id")
                    .single();

                if (policyErr || !policy) {
                    console.error("Failed to create policy:", template.title, policyErr);
                    continue;
                }

                // Find control UUIDs matching the template's controlIds
                const { data: controls } = await supabase
                    .from("controls")
                    .select("id, control_id")
                    .eq("framework_id", orgFw.framework_id)
                    .in("control_id", template.controlIds);

                if (controls && controls.length > 0) {
                    const junctionRows = controls.map(c => ({
                        policy_id: policy.id,
                        control_id: c.id,
                    }));

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabase.from("policy_controls") as any).insert(junctionRows);
                }

                existingKeys.add(key);
                generated++;
                createdPolicies.push({ id: policy.id, title: template.title });
            }
        }

        return NextResponse.json({ generated, skipped, policies: createdPolicies });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Policy generation failed";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
