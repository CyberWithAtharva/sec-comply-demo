import Link from "next/link";
import { ShieldCheck, ListChecks, Library } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function FrameworksCatalogPage() {
    const supabase = await createClient();

    const { data: frameworks } = await supabase
        .from("frameworks")
        .select("id, slug, name, version, description, category, color, status, controls_count")
        .eq("status", "active")
        .order("name", { ascending: true });

    const list = frameworks ?? [];

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Library className="w-5 h-5 text-orange-400" />
                    <h1 className="text-2xl font-bold text-slate-100">Frameworks Catalog</h1>
                </div>
                <p className="text-sm text-slate-500">
                    Browse the library of compliance frameworks SecComply tracks. Ask your admin to assign one to your organization.
                </p>
            </div>

            {list.length === 0 ? (
                <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-16 text-center">
                    <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No frameworks in the catalog yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {list.map(fw => {
                        const accent = fw.color ?? "#64748b";
                        return (
                            <Link
                                key={fw.id}
                                href={`/frameworks-catalog/${fw.id}`}
                                className="group rounded-2xl border border-slate-800/60 bg-slate-900/30 hover:bg-slate-800/40 hover:border-slate-700/60 transition-all backdrop-blur-sm overflow-hidden"
                                style={{ borderLeft: `3px solid ${accent}` }}
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: accent + "20", border: `1px solid ${accent}40` }}
                                        >
                                            <ShieldCheck className="w-5 h-5" style={{ color: accent }} />
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-200 mb-0.5">
                                        {fw.name}
                                        {fw.version && <span className="ml-2 text-xs text-slate-500">v{fw.version}</span>}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-mono mb-3 truncate">{fw.slug}</p>
                                    {fw.description && (
                                        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{fw.description}</p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        {fw.category ? (
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-400 border border-slate-700/60 uppercase tracking-wider">
                                                {fw.category.replace(/_/g, " ")}
                                            </span>
                                        ) : <span />}
                                        <span className="flex items-center gap-1 text-xs text-slate-400 tabular-nums">
                                            <ListChecks className="w-3 h-3" />
                                            {fw.controls_count ?? 0}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
