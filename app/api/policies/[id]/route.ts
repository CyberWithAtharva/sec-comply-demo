import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { title, content, status, owner_id, next_review, version } = body;

        // Fetch the existing policy to get org_id and current status
        const { data: existing, error: fetchErr } = await supabase
            .from("policies")
            .select("id, org_id, status")
            .eq("id", id)
            .single();

        if (fetchErr || !existing) {
            return NextResponse.json({ error: "Policy not found" }, { status: 404 });
        }

        const updatePayload: Record<string, unknown> = {};
        if (title !== undefined) updatePayload.title = title;
        if (content !== undefined) updatePayload.content = content;
        if (status !== undefined) updatePayload.status = status;
        if (owner_id !== undefined) updatePayload.owner_id = owner_id;
        if (next_review !== undefined) updatePayload.next_review = next_review;
        if (version !== undefined) updatePayload.version = version;
        updatePayload.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from("policies")
            .update(updatePayload)
            .eq("id", id)
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // If policy was just approved, bump linked controls from not_started → in_progress
        if (status === "approved" && existing.status !== "approved") {
            // Get all controls linked to this policy
            const { data: linkedControls } = await supabase
                .from("policy_controls")
                .select("control_id")
                .eq("policy_id", id);

            if (linkedControls && linkedControls.length > 0) {
                const controlIds = linkedControls.map(lc => lc.control_id);

                // Update only controls currently at not_started
                await supabase
                    .from("control_status")
                    .update({ status: "in_progress", last_updated: new Date().toISOString() })
                    .eq("org_id", existing.org_id)
                    .in("control_id", controlIds)
                    .eq("status", "not_started");
            }
        }

        return NextResponse.json({ policy: data });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Update failed";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { error } = await supabase
            .from("policies")
            .delete()
            .eq("id", id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Delete failed";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
