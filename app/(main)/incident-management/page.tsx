import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IncidentManagementClient } from "@/components/incidents/IncidentManagementClient";

export default async function IncidentManagementPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) redirect("/login");

    return <IncidentManagementClient orgId={membership.org_id} />;
}
