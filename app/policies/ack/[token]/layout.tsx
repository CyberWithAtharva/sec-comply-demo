// Full-bleed layout for the magic-link acknowledgement portal.
// Public route — bypasses the sidebar/topbar in app/(main)/layout.tsx.

export default function AckLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
