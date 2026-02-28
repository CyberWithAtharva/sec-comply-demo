import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: controlId } = await params;
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
        const orgId = membership.org_id;

        const { status, notes } = await req.json();
        if (!status) return NextResponse.json({ error: "status required" }, { status: 400 });

        const validStatuses = ["verified", "in_progress", "not_started", "not_applicable"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
        }

        const updatePayload: Record<string, unknown> = {
            status,
            last_updated: new Date().toISOString(),
            updated_by: user.id,
        };
        if (notes !== undefined) updatePayload.notes = notes;

        const { data, error } = await supabase
            .from("control_status")
            .upsert({
                org_id: orgId,
                control_id: controlId,
                ...updatePayload,
            }, { onConflict: "org_id, control_id" })
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // When a control is verified, auto-close any gap-sourced risks linked to it
        if (status === "verified") {
            await supabase
                .from("risks")
                .update({ status: "closed", updated_at: new Date().toISOString() })
                .eq("org_id", orgId)
                .eq("control_id", controlId)
                .eq("source", "gap")
                .not("status", "in", '("closed","accepted")');
        }

        return NextResponse.json({ controlStatus: data });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Update failed";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
