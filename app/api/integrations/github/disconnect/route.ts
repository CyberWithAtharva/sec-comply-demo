import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { installation_id } = await req.json();
        if (!installation_id) {
            return NextResponse.json({ error: "installation_id required" }, { status: 400 });
        }

        // Resolve org membership
        const { data: membership } = await supabase
            .from("organization_members")
            .select("org_id")
            .eq("user_id", user.id)
            .limit(1)
            .single();

        if (!membership) return NextResponse.json({ error: "No org" }, { status: 403 });

        // Delete — scoped to org so users can't delete other orgs' installations
        const { error } = await supabase
            .from("github_installations")
            .delete()
            .eq("id", installation_id)
            .eq("org_id", membership.org_id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Disconnect failed";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
