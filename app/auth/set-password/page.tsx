"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ShieldAlert, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
            setError(updateError.message);
            setLoading(false);
            return;
        }

        // After setting password, check role and redirect
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();
            router.push(profile?.role === "admin" ? "/admin" : "/");
        } else {
            router.push("/login");
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center mb-8 space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <ShieldAlert className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">OmniGuard</span>
                </div>

                <div className="bg-card/60 border border-border rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
                    <div className="mb-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-xl font-semibold text-foreground">Set your password</h1>
                        <p className="text-sm text-muted-foreground mt-1">Choose a password to activate your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                New password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-secondary/50 border border-border rounded-xl py-2.5 px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all"
                                    placeholder="Min. 8 characters"
                                />
                                <Button variant="plain"
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors h-auto"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                Confirm password
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                required
                                className="w-full bg-secondary/50 border border-border rounded-xl py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all"
                                placeholder="Repeat password"
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-4 py-2.5">
                                {error}
                            </div>
                        )}

                        <Button variant="plain"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-2 h-auto"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Activating account…" : "Set password & continue"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
