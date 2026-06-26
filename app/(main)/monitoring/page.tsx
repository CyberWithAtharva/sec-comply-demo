import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
    MonitoringDashboard,
    type MonitoringEntry,
} from "@/components/monitoring/MonitoringDashboard";

export default async function MonitoringPage() {
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

    const { data: entries } = await supabase
        .from("qms_log_entries")
        .select("id, process_id, payload, result, occurred_at, qms_processes(key, name, clause)")
        .eq("org_id", orgId)
        .order("occurred_at", { ascending: false })
        .limit(2000);

    // Server-evaluated timestamp keeps client renders pure (overdue calc).
    // eslint-disable-next-line react-hooks/purity
    const serverNowMs = Date.now();

    return (
        <MonitoringDashboard
            entries={(entries ?? []) as unknown as MonitoringEntry[]}
            serverNowMs={serverNowMs}
        />
    );
}
