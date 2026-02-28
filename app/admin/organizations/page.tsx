import { createClient } from "@/lib/supabase/server";
import { OrganizationsClient } from "@/components/admin/OrganizationsClient";

export default async function OrganizationsPage() {
    const supabase = await createClient();

    const [{ data: orgs }, { data: frameworks }] = await Promise.all([
        supabase
            .from("organizations")
            .select("*, organization_members(count)")
            .order("created_at", { ascending: false }),
        supabase.from("frameworks").select("id, name, version"),
    ]);

    return <OrganizationsClient orgs={orgs ?? []} frameworks={frameworks ?? []} />;
}
