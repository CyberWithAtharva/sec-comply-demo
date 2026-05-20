import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { MagicLinkClient } from "@/components/policies/MagicLinkClient";

export const dynamic = "force-dynamic";

export default async function AckPortal({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const supabase = await createClient();

    const { data: recipient } = await supabase
        .from("policy_ack_recipients")
        .select("id, policy_id, policy_version_label, status, expires_at, name, acknowledged_at")
        .eq("token", token)
        .maybeSingle();
    if (!recipient) notFound();

    const { data: policy } = await supabase
        .from("policies")
        .select("id, org_id, title, content, organizations(name)")
        .eq("id", recipient.policy_id)
        .single();
    if (!policy) notFound();

    const { data: varRows } = await supabase
        .from("org_policy_variables")
        .select("var_key, value")
        .eq("org_id", policy.org_id);
    const variables: Record<string, string> = {};
    for (const v of varRows ?? []) variables[v.var_key] = v.value ?? "";

    const orgName = (policy.organizations as unknown as { name: string } | null)?.name ?? "Your organisation";

    return (
        <MagicLinkClient
            token={token}
            policyTitle={policy.title}
            version={recipient.policy_version_label ?? "v1.0"}
            orgName={orgName}
            content={policy.content ?? ""}
            variables={variables}
            alreadyAcked={recipient.status === "acknowledged"}
        />
    );
}
