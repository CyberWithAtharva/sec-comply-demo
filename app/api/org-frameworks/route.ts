import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { org_id, framework_id } = await req.json();
        if (!org_id || !framework_id) {
            return NextResponse.json({ error: "org_id and framework_id required" }, { status: 400 });
        }

        // Insert — the DB trigger fn_init_control_status fires automatically,
        // creating control_status rows for every control in this framework.
        const { data, error } = await supabase
            .from("org_frameworks")
            .insert({ org_id, framework_id })
            .select("*, frameworks(id, name, version, controls_count)")
            .single();

        if (error) {
            // Duplicate assignment → gracefully return existing record
            if (error.code === "23505") {
                const { data: existing } = await supabase
                    .from("org_frameworks")
                    .select("*, frameworks(id, name, version, controls_count)")
                    .eq("org_id", org_id)
                    .eq("framework_id", framework_id)
                    .single();
                return NextResponse.json({ orgFramework: existing, already_assigned: true });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Count how many control_status rows were initialized (for feedback)
        const { count } = await supabase
            .from("control_status")
            .select("id", { count: "exact", head: true })
            .eq("org_id", org_id);

        return NextResponse.json({ orgFramework: data, controls_initialized: count ?? 0 });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to assign framework";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { org_framework_id } = await req.json();
        if (!org_framework_id) {
            return NextResponse.json({ error: "org_framework_id required" }, { status: 400 });
        }

        const { error } = await supabase
            .from("org_frameworks")
            .delete()
            .eq("id", org_framework_id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to remove framework";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
