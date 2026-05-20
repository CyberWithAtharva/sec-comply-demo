import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PolicyLibraryClient } from "@/components/policies/PolicyLibraryClient";
import { normaliseStatus, type PolicyListItem } from "@/components/policies/policy-shared";

export default async function PoliciesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id, organizations(id, name)")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) redirect("/");

    const orgId = membership.org_id;
    const orgName = (membership.organizations as unknown as { name: string } | null)?.name ?? "Your organisation";

    // Pull policies + the latest updater for each (single round-trip via profiles join)
    const { data: policies } = await supabase
        .from("policies")
        .select("id, code, title, category, frameworks_list, status, version, updated_at, description, profiles:owner_id(full_name)")
        .eq("org_id", orgId)
        .order("category", { ascending: true })
        .order("code", { ascending: true });

    // Ack roll-up from policy_ack_recipients
    const ids = (policies ?? []).map(p => p.id);
    const ackMap = new Map<string, { done: number; total: number }>();
    if (ids.length > 0) {
        const { data: acks } = await supabase
            .from("policy_ack_recipients")
            .select("policy_id, status")
            .in("policy_id", ids);
        for (const a of acks ?? []) {
            const m = ackMap.get(a.policy_id) ?? { done: 0, total: 0 };
            m.total++;
            if (a.status === "acknowledged") m.done++;
            ackMap.set(a.policy_id, m);
        }
    }

    const items: PolicyListItem[] = (policies ?? []).map(p => {
        const owner = p.profiles as unknown as { full_name: string | null } | null;
        const ack = ackMap.get(p.id) ?? { done: 0, total: 0 };
        return {
            id: p.id,
            code: p.code,
            title: p.title,
            category: p.category,
            frameworks_list: p.frameworks_list ?? [],
            status: normaliseStatus(p.status),
            version: p.version,
            updated_at: p.updated_at,
            description: p.description,
            updatedBy: owner?.full_name ?? null,
            ackDone: ack.done,
            ackTotal: ack.total,
        };
    });

    return <PolicyLibraryClient policies={items} orgName={orgName} />;
}
