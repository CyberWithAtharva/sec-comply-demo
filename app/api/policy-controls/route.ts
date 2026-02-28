import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { policy_id, control_id } = await req.json();
        if (!policy_id || !control_id) {
            return NextResponse.json({ error: "policy_id and control_id required" }, { status: 400 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from("policy_controls") as any)
            .insert({ policy_id, control_id })
            .select()
            .single();

        if (error) {
            if (error.code === "23505") {
                return NextResponse.json({ message: "Already linked", alreadyLinked: true });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ policyControl: data });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to link";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { policy_id, control_id } = await req.json();
        if (!policy_id || !control_id) {
            return NextResponse.json({ error: "policy_id and control_id required" }, { status: 400 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("policy_controls") as any)
            .delete()
            .eq("policy_id", policy_id)
            .eq("control_id", control_id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to unlink";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
