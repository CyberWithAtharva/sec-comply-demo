import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;
    const { supabase } = guard;

    const { id: frameworkId } = await ctx.params;

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const code = typeof body.code === "string" ? body.code.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!code) return NextResponse.json({ error: "code is required" }, { status: 400 });
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const sortOrderRaw = body.sort_order;
    const sortOrder =
        typeof sortOrderRaw === "number" && Number.isFinite(sortOrderRaw) ? Math.trunc(sortOrderRaw) : 0;

    const { data: fw } = await supabase.from("frameworks").select("id").eq("id", frameworkId).maybeSingle();
    if (!fw) return NextResponse.json({ error: "Framework not found" }, { status: 404 });

    const payload = {
        framework_id: frameworkId,
        control_id: code,
        title: name,
        description: typeof body.description === "string" && body.description.trim() ? body.description.trim() : null,
        domain: typeof body.domain === "string" && body.domain.trim() ? body.domain.trim() : null,
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("controls").insert(payload).select("*").single();
    if (error) {
        if (error.code === "23505") {
            return NextResponse.json({ error: `A control with code "${code}" already exists in this framework` }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data }, { status: 201 });
}
