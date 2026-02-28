import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        optimizePackageImports: ["lucide-react", "recharts", "framer-motion", "@radix-ui/react-icons"],
        // Cache page renders in the client router for 30s.
        // Navigating back to a recently visited page skips the server round-trip entirely.
        staleTimes: {
            dynamic: 30,
        },
    },
};

export default nextConfig;
