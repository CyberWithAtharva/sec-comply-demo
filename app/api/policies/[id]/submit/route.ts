import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: policy } = await supabase
        .from("policies")
        .select("id, org_id, status, version, content")
        .eq("id", id)
        .single();
    if (!policy) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Move policy to in_review
    const { error: pErr } = await supabase
        .from("policies")
        .update({ status: "in_review", updated_at: new Date().toISOString() })
        .eq("id", id);
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

    // Promote any matching draft version row to in_review, otherwise create one.
    const { data: draft } = await supabase
        .from("policy_versions")
        .select("id")
        .eq("policy_id", id)
        .eq("version", policy.version)
        .maybeSingle();
    if (draft) {
        await supabase.from("policy_versions").update({ status: "in_review" }).eq("id", draft.id);
    } else {
        await supabase.from("policy_versions").insert({
            policy_id: id, version: policy.version, status: "in_review",
            content: policy.content, created_by: user.id,
        });
    }

    return NextResponse.json({ ok: true });
}
