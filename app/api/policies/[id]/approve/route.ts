import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nextVersion } from "@/components/policies/policy-shared";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const decision = body.decision === "reject" ? "reject" : "approve";
    const classification = body.classification === "major" ? "major" : "minor";
    const summary = typeof body.summary === "string" ? body.summary : "";

    const { data: policy } = await supabase
        .from("policies")
        .select("id, status, version, content")
        .eq("id", id)
        .single();
    if (!policy) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (decision === "reject") {
        await supabase.from("policies").update({ status: "draft", updated_at: new Date().toISOString() }).eq("id", id);
        // The in-flight version row goes back to draft + records the rejection comment.
        await supabase.from("policy_versions")
            .update({ status: "draft", summary: summary || "Returned to draft" })
            .eq("policy_id", id)
            .in("status", ["in_review", "awaiting_approval"]);
        return NextResponse.json({ ok: true, decision: "reject" });
    }

    // Approve path — compute next version
    const newVer = nextVersion(policy.version, classification);

    // Mark any previously-active version as superseded.
    await supabase.from("policy_versions")
        .update({ status: "superseded" })
        .eq("policy_id", id)
        .eq("status", "active");

    // Promote the in-flight row (in_review OR awaiting_approval) to active.
    const { data: inFlight } = await supabase
        .from("policy_versions")
        .select("id")
        .eq("policy_id", id)
        .in("status", ["awaiting_approval", "in_review"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (inFlight) {
        await supabase.from("policy_versions").update({
            status: "active",
            version: newVer,
            classification,
            summary: summary || `Approved as ${newVer}`,
            approved_by: user.id,
            approved_at: new Date().toISOString(),
        }).eq("id", inFlight.id);
    } else {
        await supabase.from("policy_versions").insert({
            policy_id: id, version: newVer, status: "active",
            content: policy.content, classification,
            summary: summary || `Approved as ${newVer}`,
            created_by: user.id, approved_by: user.id,
            approved_at: new Date().toISOString(),
        });
    }

    await supabase.from("policies").update({
        status: "active", version: newVer, updated_at: new Date().toISOString(),
    }).eq("id", id);

    return NextResponse.json({ ok: true, decision: "approve", version: newVer });
}
