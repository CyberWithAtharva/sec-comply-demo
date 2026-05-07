import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type AdminGuardSuccess = {
    ok: true;
    supabase: SupabaseClient<Database>;
    userId: string;
};
export type AdminGuardFailure = { ok: false; response: NextResponse };
export type AdminGuardResult = AdminGuardSuccess | AdminGuardFailure;

export async function requireAdmin(): Promise<AdminGuardResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
        return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { ok: true, supabase, userId: user.id };
}
