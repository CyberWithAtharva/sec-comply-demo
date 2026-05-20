import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const update: Record<string, string | null> = {};
    for (const role of ["author_id", "reviewer_id", "approver_id"] as const) {
        if (role in body) update[role] = body[role] || null;
    }
    if (Object.keys(update).length === 0) return NextResponse.json({ error: "No assignments provided" }, { status: 400 });

    const { error } = await supabase
        .from("policies")
        .update({ ...update, updated_at: new Date().toISOString() })
        .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
