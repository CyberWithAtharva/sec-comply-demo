import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { OrgDetailClient } from "@/components/admin/OrgDetailClient";

export default async function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const [{ data: org }, { data: members }, { data: orgFrameworks }, { data: frameworks }] = await Promise.all([
        supabase.from("organizations").select("*").eq("id", id).single(),
        supabase.from("organization_members").select("*, profiles(id, full_name, avatar_url, role)").eq("org_id", id),
        supabase.from("org_frameworks").select("*, frameworks(id, name, version, controls_count)").eq("org_id", id),
        supabase.from("frameworks").select("id, name, version"),
    ]);

    if (!org) notFound();

    return <OrgDetailClient org={org} members={members ?? []} orgFrameworks={orgFrameworks ?? []} allFrameworks={frameworks ?? []} />;
}
