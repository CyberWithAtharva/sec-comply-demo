import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VendorsClient } from "@/components/vendors/VendorsClient";

export default async function VendorsPage() {
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

    // Fetch vendors and org members in parallel (both only need orgId)
    const [{ data: vendors }, { data: members }] = await Promise.all([
        supabase
            .from("vendors")
            .select("*")
            .eq("org_id", orgId)
            .order("created_at", { ascending: false }),
        supabase
            .from("organization_members")
            .select("user_id, profiles(id, full_name)")
            .eq("org_id", orgId),
    ]);

    // Fetch assessments for all vendors (needs vendorIds)
    const vendorIds = (vendors ?? []).map(v => v.id);
    const { data: assessments } = vendorIds.length > 0
        ? await supabase
            .from("vendor_assessments")
            .select("*")
            .in("vendor_id", vendorIds)
            .order("created_at", { ascending: false })
        : { data: [] };

    const owners = (members ?? [])
        .map(m => {
            const p = m.profiles as { id: string; full_name: string | null } | null;
            return p ? { id: p.id, name: p.full_name ?? "Unknown" } : null;
        })
        .filter(Boolean) as { id: string; name: string }[];

    return (
        <VendorsClient
            initialVendors={(vendors ?? []) as unknown as import("@/components/vendors/VendorsClient").Vendor[]}
            initialAssessments={assessments ?? []}
            orgId={orgId}
            owners={owners}
        />
    );
}
