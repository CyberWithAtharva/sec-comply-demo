import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RiskRegisterClient } from "@/components/risks/RiskRegisterClient";

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

    // Fetch risks and org members in parallel (both only need orgId)
    const [{ data: risks }, { data: members }] = await Promise.all([
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
    ]);

    const owners = (members ?? [])
        .map(m => {
            const p = m.profiles as { id: string; full_name: string | null } | null;
            return p ? { id: p.id, name: p.full_name ?? "Unknown" } : null;
        })
        .filter(Boolean) as { id: string; name: string }[];

    return (
        <RiskRegisterClient
            initialRisks={risks ?? []}
            orgId={orgId}
            owners={owners}
        />
    );
}
