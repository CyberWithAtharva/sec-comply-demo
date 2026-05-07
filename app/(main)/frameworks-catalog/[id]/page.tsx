import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ListChecks, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FrameworkBrowserClient } from "@/components/frameworks-catalog/FrameworkBrowserClient";

export default async function FrameworkBrowserPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const [{ data: framework }, { data: controls }] = await Promise.all([
        supabase
            .from("frameworks")
            .select("id, slug, name, version, description, category, color, status")
            .eq("id", id)
            .maybeSingle(),
        supabase
            .from("controls")
            .select("id, control_id, title, description, domain, sort_order")
            .eq("framework_id", id)
            .order("sort_order", { ascending: true })
            .order("control_id", { ascending: true }),
    ]);

    if (!framework || framework.status !== "active") notFound();

    const accent = framework.color ?? "#64748b";
    const list = (controls ?? []).map(c => ({
        id: c.id,
        code: c.control_id,
        name: c.title,
        description: c.description,
        domain: c.domain,
        sort_order: c.sort_order ?? 0,
    }));

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href="/frameworks-catalog"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-3"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Frameworks Catalog
                </Link>
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: accent + "20", border: `1px solid ${accent}40` }}
                    >
                        <ShieldCheck className="w-5 h-5" style={{ color: accent }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">
                            {framework.name}
                            {framework.version && <span className="ml-2 text-sm text-slate-500">v{framework.version}</span>}
                        </h1>
                        {framework.description && (
                            <p className="text-sm text-slate-400 mt-1 max-w-3xl">{framework.description}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/60">
                        {framework.slug}
                    </span>
                    {framework.category && (
                        <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/60 uppercase tracking-wider">
                            {framework.category.replace(/_/g, " ")}
                        </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-400 tabular-nums">
                        <ListChecks className="w-3 h-3" />
                        {list.length} control{list.length === 1 ? "" : "s"}
                    </span>
                </div>
            </div>

            <FrameworkBrowserClient controls={list} />
        </div>
    );
}
