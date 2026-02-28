export default function Loading() {
    return (
        <div className="w-full space-y-6 animate-pulse">
            {/* Page title bar */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-7 w-48 bg-slate-800 rounded-lg" />
                    <div className="h-4 w-72 bg-slate-800/60 rounded-md" />
                </div>
                <div className="h-9 w-32 bg-slate-800 rounded-lg" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
                        <div className="h-4 w-24 bg-slate-800 rounded" />
                        <div className="h-8 w-16 bg-slate-800 rounded-lg" />
                        <div className="h-3 w-20 bg-slate-800/60 rounded" />
                    </div>
                ))}
            </div>

            {/* Main content area */}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
                    <div className="h-5 w-36 bg-slate-800 rounded" />
                    <div className="space-y-2 pt-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-4 w-4 rounded bg-slate-800 flex-shrink-0" />
                                <div className="h-4 flex-1 bg-slate-800/70 rounded" style={{ width: `${65 + (i % 3) * 10}%` }} />
                                <div className="h-5 w-16 bg-slate-800 rounded-full flex-shrink-0" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
                    <div className="h-5 w-28 bg-slate-800 rounded" />
                    <div className="h-40 bg-slate-800/40 rounded-lg mt-2" />
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="h-3 w-20 bg-slate-800 rounded" />
                                <div className="h-3 w-8 bg-slate-800/60 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
