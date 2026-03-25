import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PolicyEditorClient } from "@/components/policies/PolicyEditorClient";

export default async function PolicyEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) redirect("/login");

    const { data: policy } = await supabase
        .from("policies")
        .select("*, profiles(id, full_name)")
        .eq("id", id)
        .eq("org_id", membership.org_id)
        .single();

    if (!policy) notFound();

    // Acknowledgement stats
    const { count: ackCount } = await supabase
        .from("policy_acknowledgements")
        .select("id", { count: "exact", head: true })
        .eq("policy_id", id);

    const { count: memberCount } = await supabase
        .from("organization_members")
        .select("id", { count: "exact", head: true })
        .eq("org_id", membership.org_id);

    return (
        <PolicyEditorClient
            policy={{
                ...policy,
                owner: policy.profiles as { id: string; full_name: string | null } | null,
                ackCount: ackCount ?? 0,
                totalMembers: memberCount ?? 0,
            }}
            currentUserId={user.id}
            isAdmin={membership.role === "owner"}
        />
    );
}
