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

    // Fetch artifacts and org frameworks in parallel (both only need orgId)
    const [{ data: artifacts }, { data: orgFrameworks }] = await Promise.all([
        supabase
            .from("evidence_artifacts")
            .select("*, profiles(id, full_name)")
            .eq("org_id", orgId)
            .order("created_at", { ascending: false }),
        supabase
            .from("org_frameworks")
            .select("framework_id")
            .eq("org_id", orgId),
    ]);

    const frameworkIds = (orgFrameworks ?? []).map(f => f.framework_id);

    const { data: controls } = frameworkIds.length > 0
        ? await supabase
            .from("controls")
            .select("id, control_id, title, domain, framework_id")
            .in("framework_id", frameworkIds)
            .order("control_id")
        : { data: [] };

    return (
        <EvidenceVaultClient
            initialArtifacts={(artifacts ?? []).map(a => ({
                ...a,
                uploader: (a.profiles as unknown as { id: string; full_name: string | null } | null),
            }))}
            controls={controls ?? []}
            orgId={orgId}
            currentUserId={user.id}
        />
    );
}
