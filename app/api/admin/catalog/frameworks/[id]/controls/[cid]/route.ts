import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string; cid: string }> }) {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;
    const { supabase } = guard;

    const { id: frameworkId, cid } = await ctx.params;

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (typeof body.code === "string") {
        const code = body.code.trim();
        if (!code) return NextResponse.json({ error: "code cannot be empty" }, { status: 400 });
        updates.control_id = code;
    }
    if (typeof body.name === "string") {
        const name = body.name.trim();
        if (!name) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
        updates.title = name;
    }
    if (typeof body.description === "string") updates.description = body.description.trim() || null;
    if (typeof body.domain === "string") updates.domain = body.domain.trim() || null;
    if (typeof body.sort_order === "number" && Number.isFinite(body.sort_order)) {
        updates.sort_order = Math.trunc(body.sort_order);
    }

    const { data: existing } = await supabase
        .from("controls")
        .select("id")
        .eq("id", cid)
        .eq("framework_id", frameworkId)
        .maybeSingle();
    if (!existing) return NextResponse.json({ error: "Control not found" }, { status: 404 });

    const { data, error } = await supabase
        .from("controls")
        .update(updates)
        .eq("id", cid)
        .eq("framework_id", frameworkId)
        .select("*")
        .single();

    if (error) {
        if (error.code === "23505") {
            return NextResponse.json({ error: `A control with that code already exists in this framework` }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string; cid: string }> }) {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;
    const { supabase } = guard;

    const { id: frameworkId, cid } = await ctx.params;

    const { error } = await supabase
        .from("controls")
        .delete()
        .eq("id", cid)
        .eq("framework_id", frameworkId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return new NextResponse(null, { status: 204 });
}
