import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { ActionItemsClient } from "@/components/action-items/ActionItemsClient";

export default async function ActionItemsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <AlertTriangle className="w-16 h-16 text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-300 mb-2">No Organization Assigned</h2>
                <p className="text-slate-500 text-sm max-w-md">Contact your SecComply admin to link you to an organization.</p>
            </div>
        );
    }

    const orgId = membership.org_id;

    // Fetch org's frameworks
    const { data: orgFrameworks } = await supabase
        .from("org_frameworks")
        .select("framework_id, frameworks(id, name, version)")
        .eq("org_id", orgId);

    if (!orgFrameworks || orgFrameworks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <AlertTriangle className="w-16 h-16 text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-300 mb-2">No Frameworks Assigned</h2>
                <p className="text-slate-500 text-sm max-w-md">Ask your admin to assign compliance frameworks before viewing action items.</p>
            </div>
        );
    }

    const frameworkIds = orgFrameworks.map(f => f.framework_id);

    // Build framework list
    const frameworks = orgFrameworks.map(f => {
        const fw = f.frameworks as { id: string; name: string; version: string } | null;
        return fw ? { id: fw.id, name: `${fw.name} ${fw.version}` } : null;
    }).filter((fw): fw is { id: string; name: string } => fw !== null);

    // Fetch all controls for org's frameworks
    const { data: controlsRaw } = await supabase
        .from("controls")
        .select("id, control_id, domain, category, title, framework_id")
        .in("framework_id", frameworkIds);

    const controls = (controlsRaw ?? []).map(c => ({
        id: c.id,
        control_id: c.control_id,
        title: c.title,
        domain: c.domain,
        category: c.category,
        framework_id: c.framework_id,
    }));

    if (controls.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <AlertTriangle className="w-16 h-16 text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-300 mb-2">No Controls Found</h2>
                <p className="text-slate-500 text-sm">No controls are seeded for the assigned frameworks.</p>
            </div>
        );
    }

    const controlIds = controls.map(c => c.id);

    // Fetch control statuses
    const { data: statusesRaw } = await supabase
        .from("control_status")
        .select("control_id, status, evidence_count")
        .eq("org_id", orgId)
        .in("control_id", controlIds);

    const statuses = (statusesRaw ?? []).map(s => ({
        control_id: s.control_id,
        status: s.status,
        evidence_count: s.evidence_count,
    }));

    return (
        <ActionItemsClient
            controls={controls}
            statuses={statuses}
            frameworks={frameworks}
            orgId={orgId}
        />
    );
}
