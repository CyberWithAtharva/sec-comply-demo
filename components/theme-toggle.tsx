"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
] as const;

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    // Avoid SSR/client markup mismatch: theme is only known after mount.
    React.useEffect(() => setMounted(true), []);

    React.useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open]);

    if (!mounted) {
        return (
            <div
                className="p-1.5 rounded-lg text-muted-foreground"
                aria-hidden
            >
                <Sun className="w-4.5 h-4.5" />
            </div>
        );
    }

    const Active = resolvedTheme === "dark" ? Moon : Sun;

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                title="Toggle theme"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <Active className="w-4.5 h-4.5" />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 mt-2 w-36 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg overflow-hidden z-50"
                >
                    {OPTIONS.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            type="button"
                            role="menuitemradio"
                            aria-checked={theme === value}
                            onClick={() => {
                                setTheme(value);
                                setOpen(false);
                            }}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-secondary/70",
                                theme === value
                                    ? "text-foreground font-medium"
                                    : "text-muted-foreground"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="flex-1 text-left">{label}</span>
                            {theme === value && <Check className="w-3.5 h-3.5" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
