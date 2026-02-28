"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Mail, ChevronRight, Fingerprint, Activity, Server, FileLock2, AlertTriangle } from "lucide-react";
import { signIn } from "@/lib/auth/actions";

export function LoginUX() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await signIn(formData);

        // signIn redirects on success; only reaches here on error
        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative bg-[#020617] overflow-hidden selection:bg-blue-500/30">

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-900/5 blur-[150px] mix-blend-screen" />
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-blue-800/10 blur-[100px] mix-blend-screen" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(to right, #475569 1px, transparent 1px), linear-gradient(to bottom, #475569 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 80%)'
                    }}
                />
            </div>

            <div className="w-full max-w-[1200px] mx-auto px-4 z-10 flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24 relative">

                {/* Branding Side */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="hidden md:flex flex-col w-full max-w-md"
                >
                    <div className="flex items-center space-x-3 mb-12">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/40 relative">
                            <ShieldCheck className="w-6 h-6 text-white" />
                            <div className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
                        </div>
                        <span className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">SecComply</span>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-100 leading-tight mb-6">
                        Intelligent <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Compliance</span> <br />
                        Engine
                    </h1>

                    <p className="text-slate-400 text-lg mb-10 max-w-sm leading-relaxed">
                        Unify your security posture, automate evidence collection, and achieve continuous compliance across SOC2, ISO27001, and more.
                    </p>

                    <div className="flex flex-col space-y-4">
                        {[
                            { icon: Activity, text: "Real-time Posture Analysis" },
                            { icon: FileLock2, text: "Automated Evidence Collection" },
                            { icon: Server, text: "Multi-Cloud Infrastructure Scanning" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
                                className="flex items-center space-x-3 text-slate-300"
                            >
                                <div className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center border border-blue-800/40">
                                    <item.icon className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-sm font-medium">{item.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Login Form Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[440px] relative group"
                >
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-500/20 to-emerald-500/0 rounded-3xl blur-md opacity-50 group-hover:opacity-100 transition duration-1000" />

                    <div className="relative backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 p-8 sm:p-10 rounded-3xl shadow-2xl flex flex-col">

                        <div className="md:hidden flex items-center justify-center space-x-2 mb-8">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-100">SecComply</span>
                        </div>

                        <div className="mb-8 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-slate-100 mb-2 tracking-tight">Welcome back</h2>
                            <p className="text-sm text-slate-400">Securely sign in to your dashboard</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-400 text-sm"
                            >
                                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleLogin} className="flex flex-col space-y-5 flex-1">

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-400 ml-1 uppercase tracking-wider">Work Email</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        autoComplete="email"
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
                                </div>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium tracking-widest"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full relative group/btn overflow-hidden rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 px-4 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-80 disabled:cursor-not-allowed border border-blue-500 hover:border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                                    <div className="flex items-center justify-center space-x-2 relative z-10 transition-transform duration-300 group-active/btn:scale-[0.98]">
                                        {isLoading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                        ) : (
                                            <>
                                                <span>Secure Sign In</span>
                                                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </div>
                                </button>
                            </div>

                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-800/50">
                            <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-500 font-medium">
                                <Fingerprint className="w-3.5 h-3.5" />
                                <span>Protected by SOC2 Type II Certified Infrastructure</span>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </div>

        </div>
    );
}
