import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InternalAuditClient } from "@/components/audit/InternalAuditClient";

export default async function InternalAuditPage() {
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

    return <InternalAuditClient orgId={membership.org_id} />;
}
