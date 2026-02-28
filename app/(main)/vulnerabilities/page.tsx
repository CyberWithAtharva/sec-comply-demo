import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VaptClient } from "@/components/vapt/VaptClient";

export default async function VaptPage() {
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

    // Fetch VAPT reports for this org
    const { data: reports } = await supabase
        .from("vapt_reports")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

    // Fetch vulnerabilities with assignee profile
    const { data: findings } = await supabase
        .from("vulnerabilities")
        .select("*, profiles(id, full_name)")
        .eq("org_id", orgId)
        .in("source", ["vapt", "manual"])
        .order("created_at", { ascending: false });

    // Fetch org members for assignee dropdown
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

    return (
        <VaptClient
            initialReports={reports ?? []}
            initialFindings={(findings ?? []).map(f => ({
                ...f,
                assignee: f.profiles as { id: string; full_name: string | null } | null,
            }))}
            orgId={orgId}
            owners={owners}
        />
    );
}
