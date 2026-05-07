import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FrameworkControlsClient } from "@/components/admin/catalog/FrameworkControlsClient";

export default async function AdminFrameworkDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const [{ data: framework }, { data: controls }] = await Promise.all([
        supabase
            .from("frameworks")
            .select("id, slug, name, version, description, category, icon_name, color, status, controls_count")
            .eq("id", id)
            .maybeSingle(),
        supabase
            .from("controls")
            .select("id, framework_id, control_id, title, description, domain, sort_order")
            .eq("framework_id", id)
            .order("sort_order", { ascending: true })
            .order("control_id", { ascending: true }),
    ]);

    if (!framework) notFound();

    const mappedControls = (controls ?? []).map(c => ({
        id: c.id,
        framework_id: c.framework_id,
        code: c.control_id,
        name: c.title,
        description: c.description,
        domain: c.domain,
        sort_order: c.sort_order ?? 0,
    }));

    return (
        <FrameworkControlsClient
            framework={{
                id: framework.id,
                slug: framework.slug,
                name: framework.name,
                version: framework.version,
                description: framework.description,
                category: framework.category,
                icon_name: framework.icon_name,
                color: framework.color,
                status: (framework.status ?? "active") as "active" | "archived",
                controls_count: framework.controls_count ?? 0,
            }}
            controls={mappedControls}
        />
    );
}
