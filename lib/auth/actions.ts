"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return { error: error.message };
    }

    // Determine redirect based on role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Authentication failed." };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    redirect(profile?.role === "admin" ? "/admin" : "/");
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}

export async function getSession() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function getProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("*, organizations(*)")
        .eq("id", user.id)
        .single();

    return profile;
}

export async function inviteUser(email: string, orgId: string, role: 'owner' | 'member' | 'viewer' = 'member') {
    const supabase = await createClient();

    // Check the invoker is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: inviter } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (inviter?.role !== "admin") return { error: "Only admins can invite users." };

    // Send Supabase invite email
    const { createServiceClient } = await import("@/lib/supabase/server");
    const serviceClient = await createServiceClient();

    const { data, error } = await serviceClient.auth.admin.inviteUserByEmail(email, {
        data: { invited_org_id: orgId, invited_role: role },
    });

    if (error) return { error: error.message };
    return { success: true, user: data.user };
}
