import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();
    if (!membership) return NextResponse.json({ error: "No org" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const values: Record<string, string> = body.values && typeof body.values === "object" ? body.values : {};

    const rows = Object.entries(values).map(([var_key, value]) => ({
        org_id: membership.org_id,
        var_key,
        value: typeof value === "string" ? value : String(value ?? ""),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
    }));
    if (rows.length === 0) return NextResponse.json({ ok: true, count: 0 });

    const { error } = await supabase
        .from("org_policy_variables")
        .upsert(rows, { onConflict: "org_id,var_key" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, count: rows.length });
}
