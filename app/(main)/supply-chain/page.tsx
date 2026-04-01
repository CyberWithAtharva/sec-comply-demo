import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SupplyChainClient } from "@/components/supply-chain/SupplyChainClient";
import type { GitHubInstallation, GitHubFinding } from "@/components/github/GitHubClient";

export default async function SupplyChainPage() {
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

    const { data: installations } = await supabase
        .from("github_installations")
        .select("id, org_id, installation_id, github_org, status, last_sync, error_message, org_settings, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

    const installationIds = (installations ?? []).map(i => i.id);

    // Only fetch dependabot findings for supply chain
    const { data: findings } = installationIds.length > 0
        ? await supabase
            .from("github_findings")
            .select("*")
            .in("installation_id", installationIds)
            .eq("type", "dependabot")
            .order("updated_at", { ascending: false })
            .limit(500)
        : { data: [] };

    return (
        <SupplyChainClient
            initialInstallations={(installations ?? []) as unknown as GitHubInstallation[]}
            initialFindings={(findings ?? []) as unknown as GitHubFinding[]}
            orgId={orgId}
        />
    );
}
