import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AssetsClient } from "@/components/assets/AssetsClient";

export default async function AssetsPage() {
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

    const { data: assets } = await supabase
        .from("assets")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

    return <AssetsClient initialAssets={(assets ?? []) as unknown as import("@/components/assets/AssetsClient").Asset[]} orgId={orgId} />;
}
