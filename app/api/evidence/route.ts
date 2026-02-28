import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { org_id, name, description, control_id, file_url, file_type, file_size, expires_at } = body;

        if (!org_id || !name) {
            return NextResponse.json({ error: "org_id and name are required" }, { status: 400 });
        }

        // Insert the evidence artifact
        const { data: artifact, error: insertErr } = await supabase
            .from("evidence_artifacts")
            .insert({
                org_id,
                name: name.trim(),
                description: description?.trim() || null,
                control_id: control_id || null,
                file_url: file_url || null,
                file_type: file_type || null,
                file_size: file_size || null,
                uploaded_by: user.id,
                expires_at: expires_at || null,
                status: "active",
            })
            .select("*, profiles(id, full_name)")
            .single();

        if (insertErr || !artifact) {
            return NextResponse.json({ error: insertErr?.message ?? "Insert failed" }, { status: 500 });
        }

        // If linked to a control, bump evidence_count and transition status
        if (control_id) {
            // Upsert control_status: increment evidence_count and transition not_started → in_progress
            const { data: existing } = await supabase
                .from("control_status")
                .select("id, status, evidence_count")
                .eq("org_id", org_id)
                .eq("control_id", control_id)
                .maybeSingle();

            if (existing) {
                const newCount = (existing.evidence_count ?? 0) + 1;
                const newStatus = existing.status === "not_started" ? "in_progress" : existing.status;
                await supabase
                    .from("control_status")
                    .update({
                        evidence_count: newCount,
                        status: newStatus,
                        last_updated: new Date().toISOString(),
                    })
                    .eq("id", existing.id);
            } else {
                // First evidence for this control — create the status row
                await supabase
                    .from("control_status")
                    .upsert({
                        org_id,
                        control_id,
                        status: "in_progress",
                        evidence_count: 1,
                        last_updated: new Date().toISOString(),
                        updated_by: user.id,
                    }, { onConflict: "org_id, control_id" });
            }
        }

        return NextResponse.json({ artifact });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

        // Get the artifact to find control_id before deletion
        const { data: artifact } = await supabase
            .from("evidence_artifacts")
            .select("id, org_id, control_id")
            .eq("id", id)
            .maybeSingle();

        const { error } = await supabase
            .from("evidence_artifacts")
            .delete()
            .eq("id", id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Decrement evidence_count if linked to a control
        if (artifact?.control_id) {
            const { data: cs } = await supabase
                .from("control_status")
                .select("id, evidence_count")
                .eq("org_id", artifact.org_id)
                .eq("control_id", artifact.control_id)
                .maybeSingle();

            if (cs && cs.evidence_count > 0) {
                await supabase
                    .from("control_status")
                    .update({ evidence_count: cs.evidence_count - 1 })
                    .eq("id", cs.id);
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Delete failed";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
