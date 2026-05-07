import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";
import { normalizeHexColor } from "@/lib/admin/catalog";

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;
    const { supabase, userId } = guard;

    const { id } = await ctx.params;

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // slug cannot be edited (frozen on the form when editing)
    if (body.slug !== undefined) delete body.slug;

    const updates: Record<string, unknown> = {
        updated_by: userId,
        updated_at: new Date().toISOString(),
    };

    if (typeof body.name === "string") {
        const name = body.name.trim();
        if (!name) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
        updates.name = name;
    }
    if (typeof body.version === "string") updates.version = body.version.trim() || null;
    if (typeof body.description === "string") updates.description = body.description.trim() || null;
    if (typeof body.category === "string") updates.category = body.category.trim() || null;
    if (typeof body.icon_name === "string") updates.icon_name = body.icon_name.trim() || null;
    if (typeof body.color === "string" && body.color.trim()) {
        const color = normalizeHexColor(body.color);
        if (!color) return NextResponse.json({ error: "color must be a valid hex value" }, { status: 400 });
        updates.color = color;
    } else if (body.color === null || body.color === "") {
        updates.color = null;
    }
    if (typeof body.status === "string") {
        if (body.status !== "active" && body.status !== "archived") {
            return NextResponse.json({ error: "status must be 'active' or 'archived'" }, { status: 400 });
        }
        updates.status = body.status;
    }

    // 404 first
    const { data: existing } = await supabase.from("frameworks").select("id").eq("id", id).maybeSingle();
    if (!existing) return NextResponse.json({ error: "Framework not found" }, { status: 404 });

    const { data, error } = await supabase
        .from("frameworks")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;
    const { supabase } = guard;

    const { id } = await ctx.params;

    const { data: existing } = await supabase.from("frameworks").select("id").eq("id", id).maybeSingle();
    if (!existing) return NextResponse.json({ error: "Framework not found" }, { status: 404 });

    const { error } = await supabase.from("frameworks").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return new NextResponse(null, { status: 204 });
}
