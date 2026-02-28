import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CSPMClient } from "@/components/cspm/CSPMClient";

export default async function CSPMPage() {
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

    // Fetch connected AWS accounts
    const { data: awsAccounts } = await supabase
        .from("aws_accounts")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

    // Fetch AWS findings (most recent 200)
    const accountIds = (awsAccounts ?? []).map(a => a.id);
    const { data: findings } = accountIds.length > 0
        ? await supabase
            .from("aws_findings")
            .select("*")
            .in("aws_account_id", accountIds)
            .order("last_seen", { ascending: false })
            .limit(200)
        : { data: [] };

    return (
        <CSPMClient
            initialAccounts={awsAccounts ?? []}
            initialFindings={(findings ?? []) as unknown as import("@/components/cspm/CSPMClient").AWSFinding[]}
            orgId={orgId}
        />
    );
}
