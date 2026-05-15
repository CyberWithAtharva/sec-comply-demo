"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

/**
 * Toaster wired to the active next-themes theme so toasts adapt to
 * light/dark. Styling uses theme tokens instead of hardcoded dark glass.
 */
export function ThemedToaster() {
    const { resolvedTheme } = useTheme();

    return (
        <Toaster
            theme={(resolvedTheme as "light" | "dark") ?? "dark"}
            position="bottom-right"
            toastOptions={{
                style: {
                    background: "color-mix(in srgb, var(--popover) 95%, transparent)",
                    border: "1px solid var(--border)",
                    color: "var(--popover-foreground)",
                    backdropFilter: "blur(12px)",
                },
            }}
        />
    );
}
