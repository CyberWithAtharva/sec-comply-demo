import { createClient } from "@/lib/supabase/server";
import { FrameworkCatalogClient } from "@/components/admin/catalog/FrameworkCatalogClient";

export default async function AdminFrameworksPage() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("frameworks")
        .select("id, slug, name, version, description, category, icon_name, color, status, controls_count")
        .order("name", { ascending: true });

    if (error) {
        return (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300">
                Failed to load frameworks: {error.message}
            </div>
        );
    }

    type Row = {
        id: string;
        slug: string;
        name: string;
        version: string | null;
        description: string | null;
        category: string | null;
        icon_name: string | null;
        color: string | null;
        status: "active" | "archived";
        controls_count: number;
    };

    const frameworks: Row[] = (data ?? []).map(r => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        version: r.version,
        description: r.description,
        category: r.category,
        icon_name: r.icon_name,
        color: r.color,
        status: (r.status ?? "active") as "active" | "archived",
        controls_count: r.controls_count ?? 0,
    }));

    return <FrameworkCatalogClient frameworks={frameworks} />;
}
