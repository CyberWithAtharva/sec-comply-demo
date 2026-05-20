import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VariablesClient } from "@/components/policies/VariablesClient";

export default async function VariablesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id, organizations(name)")
        .eq("user_id", user.id)
        .limit(1)
        .single();
    if (!membership) redirect("/");

    const [{ data: defs }, { data: rows }] = await Promise.all([
        supabase.from("policy_variable_definitions").select("*").order("group_id").order("sort_order"),
        supabase.from("org_policy_variables").select("var_key, value").eq("org_id", membership.org_id),
    ]);

    const values: Record<string, string> = {};
    for (const r of rows ?? []) values[r.var_key] = r.value ?? "";
    // Backfill any unset from defaults
    for (const d of defs ?? []) if (values[d.id] === undefined) values[d.id] = d.default_value ?? "";

    const orgName = (membership.organizations as unknown as { name: string } | null)?.name ?? "Your organisation";

    return <VariablesClient definitions={(defs ?? []) as never} values={values} orgName={orgName} />;
}
