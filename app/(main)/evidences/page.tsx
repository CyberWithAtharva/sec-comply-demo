import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EvidenceVaultClient } from "@/components/evidences/EvidenceVaultClient";

export default async function EvidencesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) redirect("/");

    const orgId = membership.org_id;

    const [{ data: artifacts }, { data: orgFrameworks }, { data: policies }, { data: controlStatuses }] = await Promise.all([
        supabase
            .from("evidence_artifacts")
            .select("*, profiles(id, full_name)")
            .eq("org_id", orgId)
            .order("created_at", { ascending: false }),
        supabase
            .from("org_frameworks")
            .select("framework_id, frameworks(id, name, version, controls_count)")
            .eq("org_id", orgId),
        supabase
            .from("policies")
            .select("id, title, status, updated_at")
            .eq("org_id", orgId)
            .order("updated_at", { ascending: false }),
        supabase
            .from("control_status")
            .select("control_id, status, evidence_count")
            .eq("org_id", orgId),
    ]);

    const frameworkIds = (orgFrameworks ?? []).map(f => f.framework_id);

    const { data: controls } = frameworkIds.length > 0
        ? await supabase
            .from("controls")
            .select("id, control_id, title, domain, category, framework_id, description")
            .in("framework_id", frameworkIds)
            .order("control_id")
        : { data: [] };

    const controlIds = (controls ?? []).map((control) => control.id);

    const { data: policyLinks } = controlIds.length > 0
        ? await supabase
            .from("policy_controls")
            .select("policy_id, control_id")
            .in("control_id", controlIds)
        : { data: [] };

    return (
        <EvidenceVaultClient
            initialArtifacts={(artifacts ?? []).map(a => ({
                ...a,
                uploader: (a.profiles as unknown as { id: string; full_name: string | null } | null),
            }))}
            controls={controls ?? []}
            statuses={controlStatuses ?? []}
            frameworks={(orgFrameworks ?? []).map((item) => {
                const framework = item.frameworks as { id: string; name: string; version: string; controls_count: number } | null;
                return {
                    id: item.framework_id,
                    name: framework?.name ?? "Framework",
                    version: framework?.version ?? "",
                    controls_count: framework?.controls_count ?? 0,
                };
            })}
            policies={policies ?? []}
            policyLinks={policyLinks ?? []}
            orgId={orgId}
        />
    );
}
