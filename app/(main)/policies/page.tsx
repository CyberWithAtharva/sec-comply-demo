import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PoliciesClient } from "@/components/policies/PoliciesClient";

export default async function PoliciesPage() {
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

    // Fetch policies with owner profile
    const { data: policies } = await supabase
        .from("policies")
        .select("*, profiles(id, full_name)")
        .eq("org_id", orgId)
        .order("updated_at", { ascending: false });

    // Fetch acknowledgements for all policies in this org
    const policyIds = (policies ?? []).map(p => p.id);
    const { data: acknowledgements } = policyIds.length > 0
        ? await supabase
            .from("policy_acknowledgements")
            .select("id, policy_id, user_id, acknowledged_at")
            .in("policy_id", policyIds)
        : { data: [] };

    // Fetch exceptions
    const { data: exceptions } = policyIds.length > 0
        ? await supabase
            .from("policy_exceptions")
            .select("*")
            .in("policy_id", policyIds)
            .order("created_at", { ascending: false })
        : { data: [] };

    // Fetch org members (for owner assignment + acknowledgement tracking)
    const { data: members } = await supabase
        .from("organization_members")
        .select("user_id, profiles(id, full_name)")
        .eq("org_id", orgId);

    const owners = (members ?? [])
        .map(m => {
            const p = m.profiles as { id: string; full_name: string | null } | null;
            return p ? { id: p.id, name: p.full_name ?? "Unknown" } : null;
        })
        .filter(Boolean) as { id: string; name: string }[];

    // Count acknowledgements per policy
    const ackCountMap = new Map<string, number>();
    for (const ack of (acknowledgements ?? [])) {
        ackCountMap.set(ack.policy_id, (ackCountMap.get(ack.policy_id) ?? 0) + 1);
    }

    const policiesWithAck = (policies ?? []).map(p => ({
        ...p,
        owner: (p.profiles as unknown as { id: string; full_name: string | null } | null),
        ackCount: ackCountMap.get(p.id) ?? 0,
        totalMembers: owners.length,
    }));

    return (
        <PoliciesClient
            initialPolicies={policiesWithAck}
            initialExceptions={exceptions ?? []}
            orgId={orgId}
            currentUserId={user.id}
            owners={owners}
        />
    );
}
