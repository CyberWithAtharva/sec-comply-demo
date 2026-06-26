import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
    WorkflowClient,
    type ProcessRow,
    type LogEntry,
} from "@/components/workflow/WorkflowClient";

export default async function WorkflowPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) redirect("/");
    const orgId = membership.org_id;

    const [{ data: processes }, { data: entries }, { count: totalEntries }, { data: evidence }] = await Promise.all([
        supabase
            .from("qms_processes")
            .select("id, key, name, description, owner_role, clause, control_id, schema, sort_order")
            .order("sort_order", { ascending: true }),
        supabase
            .from("qms_log_entries")
            .select("*, qms_processes(id, key, name, clause), profiles:logged_by(id, full_name, avatar_url)")
            .eq("org_id", orgId)
            .order("occurred_at", { ascending: false })
            .limit(300),
        supabase
            .from("qms_log_entries")
            .select("id", { count: "exact", head: true })
            .eq("org_id", orgId),
        supabase
            .from("evidence_artifacts")
            .select("source")
            .eq("org_id", orgId),
    ]);

    // % of the org's evidence that is auto-collected (workflow logs / integrations).
    const evRows = evidence ?? [];
    const autoCount = evRows.filter((e) => (e.source ?? "manual") !== "manual").length;
    const autoPct = evRows.length > 0 ? Math.round((autoCount / evRows.length) * 100) : 0;

    return (
        <WorkflowClient
            orgId={orgId}
            processes={(processes ?? []) as unknown as ProcessRow[]}
            initialEntries={(entries ?? []) as unknown as LogEntry[]}
            totalEntries={totalEntries ?? (entries?.length ?? 0)}
            autoPct={autoPct}
        />
    );
}
