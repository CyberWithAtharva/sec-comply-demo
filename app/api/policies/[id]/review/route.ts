import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Reviewer action on an in_review policy.
 * Body: { decision: 'approve' | 'request_changes', comment?: string }
 *  - approve         → policies.status = awaiting_approval, reviewer fields stamped on the in-flight version row
 *  - request_changes → policies.status = draft, reviewer fields + comment recorded
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const decision: "approve" | "request_changes" = body.decision === "request_changes" ? "request_changes" : "approve";
    const comment: string = String(body.comment ?? "").trim();

    const { data: policy } = await supabase
        .from("policies")
        .select("id, status, version")
        .eq("id", id)
        .single();
    if (!policy) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (policy.status !== "in_review" && policy.status !== "under_review") {
        return NextResponse.json({ error: "Policy is not in review" }, { status: 400 });
    }

    const reviewer_decision: "approved" | "changes_requested" = decision === "approve" ? "approved" : "changes_requested";
    const newStatus: "awaiting_approval" | "draft" = decision === "approve" ? "awaiting_approval" : "draft";

    // Update the in-flight version row's reviewer fields (or create one if missing).
    const { data: existingVer } = await supabase
        .from("policy_versions")
        .select("id")
        .eq("policy_id", id)
        .in("status", ["in_review", "draft"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    const reviewerPatch = {
        reviewer_id: user.id,
        reviewed_at: new Date().toISOString(),
        reviewer_decision,
        reviewer_comment: comment || null,
        status: decision === "approve" ? "awaiting_approval" as const : "draft" as const,
    };

    if (existingVer) {
        await supabase.from("policy_versions").update(reviewerPatch).eq("id", existingVer.id);
    } else {
        await supabase.from("policy_versions").insert({
            policy_id: id,
            version: policy.version,
            created_by: user.id,
            ...reviewerPatch,
        });
    }

    await supabase.from("policies").update({
        status: newStatus,
        updated_at: new Date().toISOString(),
    }).eq("id", id);

    return NextResponse.json({ ok: true, decision });
}
