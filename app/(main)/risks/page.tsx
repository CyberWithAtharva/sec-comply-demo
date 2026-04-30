import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RiskManagementClient } from "@/components/risks/RiskManagementClient";

export default async function RisksPage() {
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

    const [{ data: risks }, { data: members }, { data: history }] = await Promise.all([
        supabase
            .from("risks")
            .select("*, profiles(id, full_name, avatar_url)")
            .eq("org_id", orgId)
            .order("risk_score", { ascending: false })
            .limit(500),
        supabase
            .from("organization_members")
            .select("user_id, profiles(id, full_name)")
            .eq("org_id", orgId),
        // Recent history is scoped via RLS — selecting all visible rows is fine.
        supabase
            .from("risk_status_history")
            .select("*, profiles:changed_by(id, full_name)")
            .order("changed_at", { ascending: false })
            .limit(100),
    ]);

    const owners = (members ?? [])
        .map(m => {
            const p = m.profiles as { id: string; full_name: string | null } | null;
            return p ? { id: p.id, name: p.full_name ?? "Unknown" } : null;
        })
        .filter(Boolean) as { id: string; name: string }[];

    // Server component: Date.now() evaluated per-request and passed to the client
    // so client renders stay pure (react/purity lint rule).
    // eslint-disable-next-line react-hooks/purity
    const serverNowMs = Date.now();

    return (
        <RiskManagementClient
            initialRisks={risks ?? []}
            initialHistory={history ?? []}
            orgId={orgId}
            owners={owners}
            serverNowMs={serverNowMs}
        />
    );
}
