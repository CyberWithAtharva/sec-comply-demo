import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";
import { isValidSlug, normalizeHexColor } from "@/lib/admin/catalog";

export async function POST(req: NextRequest) {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;
    const { supabase, userId } = guard;

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });
    if (!isValidSlug(slug)) {
        return NextResponse.json(
            { error: "slug must be lowercase alphanumeric with single hyphens (e.g. iso-27001-2022)" },
            { status: 400 }
        );
    }
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const colorInput = typeof body.color === "string" ? body.color : null;
    const color = colorInput ? normalizeHexColor(colorInput) : null;
    if (colorInput && !color) {
        return NextResponse.json({ error: "color must be a valid hex value (e.g. #10b981)" }, { status: 400 });
    }

    const payload = {
        slug,
        name,
        version: typeof body.version === "string" && body.version.trim() ? body.version.trim() : null,
        description: typeof body.description === "string" && body.description.trim() ? body.description.trim() : null,
        category: typeof body.category === "string" && body.category.trim() ? body.category.trim() : null,
        icon_name: typeof body.icon_name === "string" && body.icon_name.trim() ? body.icon_name.trim() : null,
        color,
        status: "active" as const,
        created_by: userId,
        updated_by: userId,
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from("frameworks")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        if (error.code === "23505") {
            return NextResponse.json({ error: `A framework with slug "${slug}" already exists` }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data }, { status: 201 });
}
