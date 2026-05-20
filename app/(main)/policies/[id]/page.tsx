import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PolicyDetailClient } from "@/components/policies/PolicyDetailClient";

export default async function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .single();
    if (!membership) redirect("/login");

    const { data: policy } = await supabase
        .from("policies")
        .select("id, code, title, category, description, content, version, status, frameworks_list, updated_at, author_id, reviewer_id, approver_id, owner:profiles!policies_owner_id_fkey(full_name), author:profiles!policies_author_id_fkey(id, full_name), reviewer:profiles!policies_reviewer_id_fkey(id, full_name), approver:profiles!policies_approver_id_fkey(id, full_name)")
        .eq("id", id)
        .eq("org_id", membership.org_id)
        .single();

    if (!policy) notFound();

    // Versions
    const { data: versions } = await supabase
        .from("policy_versions")
        .select("id, version, status, classification, summary, created_at, approved_at, reviewed_at, reviewer_decision, reviewer_comment, created_by:profiles!policy_versions_created_by_fkey(full_name), approved_by:profiles!policy_versions_approved_by_fkey(full_name), reviewer:profiles!policy_versions_reviewer_id_fkey(full_name)")
        .eq("policy_id", id)
        .order("created_at", { ascending: false });

    // Framework controls
    const { data: controls } = await supabase
        .from("policy_framework_controls")
        .select("framework, control_code, description")
        .eq("policy_id", id)
        .order("framework", { ascending: true });

    // Recipients (current/active version)
    const { data: recipients } = await supabase
        .from("policy_ack_recipients")
        .select("id, email, name, status, submitted_name, match_status, acknowledged_at, ip_address")
        .eq("policy_id", id)
        .order("created_at", { ascending: false });

    // Variables for this org
    const { data: varRows } = await supabase
        .from("org_policy_variables")
        .select("var_key, value")
        .eq("org_id", membership.org_id);
    const variables: Record<string, string> = {};
    for (const v of varRows ?? []) variables[v.var_key] = v.value ?? "";

    // Org members for the role pickers
    const { data: memberRows } = await supabase
        .from("organization_members")
        .select("user_id, role, profiles(id, full_name)")
        .eq("org_id", membership.org_id);
    const members = (memberRows ?? []).map(m => {
        const p = m.profiles as unknown as { id: string; full_name: string | null } | null;
        return p ? { id: p.id, name: p.full_name ?? "Unknown", role: m.role } : null;
    }).filter(Boolean) as { id: string; name: string; role: string }[];

    const ownerName = (policy.owner as unknown as { full_name: string | null } | null)?.full_name ?? null;
    const authorAssign = policy.author as unknown as { id: string; full_name: string | null } | null;
    const reviewerAssign = policy.reviewer as unknown as { id: string; full_name: string | null } | null;
    const approverAssign = policy.approver as unknown as { id: string; full_name: string | null } | null;

    return (
        <PolicyDetailClient
            policy={{
                id: policy.id,
                code: policy.code,
                title: policy.title,
                category: policy.category,
                description: policy.description,
                content: policy.content ?? "",
                version: policy.version,
                status: policy.status,
                frameworks_list: policy.frameworks_list ?? [],
                updated_at: policy.updated_at,
                owner_name: ownerName,
                updated_by_name: ownerName,
                author: authorAssign ? { id: authorAssign.id, name: authorAssign.full_name ?? "Unknown" } : null,
                reviewer: reviewerAssign ? { id: reviewerAssign.id, name: reviewerAssign.full_name ?? "Unknown" } : null,
                approver: approverAssign ? { id: approverAssign.id, name: approverAssign.full_name ?? "Unknown" } : null,
            }}
            versions={(versions ?? []).map(v => ({
                id: v.id,
                version: v.version,
                status: v.status as "draft" | "in_review" | "awaiting_approval" | "active" | "superseded",
                classification: v.classification as "auto" | "minor" | "major" | null,
                summary: v.summary,
                created_at: v.created_at,
                approved_at: v.approved_at,
                created_by_name: (v.created_by as unknown as { full_name: string | null } | null)?.full_name ?? null,
                approved_by_name: (v.approved_by as unknown as { full_name: string | null } | null)?.full_name ?? null,
                reviewer_name: (v.reviewer as unknown as { full_name: string | null } | null)?.full_name ?? null,
                reviewed_at: v.reviewed_at,
                reviewer_decision: v.reviewer_decision as "approved" | "changes_requested" | null,
                reviewer_comment: v.reviewer_comment,
            }))}
            controls={controls ?? []}
            recipients={(recipients ?? []) as never}
            variables={variables}
            members={members}
            currentUserId={user.id}
            isOwner={membership.role === "owner"}
        />
    );
}
