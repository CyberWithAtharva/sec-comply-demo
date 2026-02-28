import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GitHubClient, GitHubInstallation, GitHubRepo, GitHubFinding } from "@/components/github/GitHubClient";

export default async function GitHubPage() {
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

    // Fetch GitHub installations for this org
    const { data: installations } = await supabase
        .from("github_installations")
        .select("id, org_id, installation_id, github_org, status, last_sync, error_message, org_settings, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

    const installationIds = (installations ?? []).map(i => i.id);

    // Fetch repos and findings for all installations
    const [{ data: repos }, { data: findings }] = await Promise.all([
        installationIds.length > 0
            ? supabase
                .from("github_repos")
                .select("*")
                .in("installation_id", installationIds)
                .order("updated_at", { ascending: false })
            : Promise.resolve({ data: [] }),
        installationIds.length > 0
            ? supabase
                .from("github_findings")
                .select("*")
                .in("installation_id", installationIds)
                .order("updated_at", { ascending: false })
                .limit(300)
            : Promise.resolve({ data: [] }),
    ]);

    return (
        <GitHubClient
            initialInstallations={(installations ?? []) as unknown as GitHubInstallation[]}
            initialRepos={(repos ?? []) as unknown as GitHubRepo[]}
            initialFindings={(findings ?? []) as unknown as GitHubFinding[]}
            orgId={orgId}
        />
    );
}
