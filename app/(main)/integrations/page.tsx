import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IntegrationsClient } from "@/components/integrations/IntegrationsClient";
import type { AWSAccount } from "@/components/cspm/CSPMClient";
import type { GitHubInstallation } from "@/components/github/GitHubClient";

export default async function IntegrationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) redirect("/login");
    const orgId = membership.org_id;

    const [{ data: awsAccounts }, { data: githubInstalls }] = await Promise.all([
        supabase.from("aws_accounts").select("*").eq("org_id", orgId).order("created_at"),
        supabase.from("github_installations").select("*").eq("org_id", orgId).order("created_at"),
    ]);

    return (
        <IntegrationsClient
            orgId={orgId}
            awsAccounts={(awsAccounts ?? []) as AWSAccount[]}
            githubInstalls={(githubInstalls ?? []) as GitHubInstallation[]}
        />
    );
}
