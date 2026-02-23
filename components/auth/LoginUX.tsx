"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Mail, ChevronRight, Fingerprint, Activity, Server, FileLock2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/components/ui/Card";

export function LoginUX() {
    const [email, setEmail] = useState("customer1@seccomply.net");
    const [password, setPassword] = useState("hello123");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate authentication delay
        setTimeout(() => {
            setIsLoading(false);
            router.push("/");
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative bg-[#020617] overflow-hidden selection:bg-blue-500/30">

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-900/5 blur-[150px] mix-blend-screen" />
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-blue-800/10 blur-[100px] mix-blend-screen" />

                {/* Subtle Cyber Grid */}
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

                {/* Branding & Value Prop Side */}
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
                    {/* Subtle Outer Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-500/20 to-emerald-500/0 rounded-3xl blur-md opacity-50 group-hover:opacity-100 transition duration-1000"></div>

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

                        <form onSubmit={handleLogin} className="flex flex-col space-y-5 flex-1">

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-400 ml-1 uppercase tracking-wider">Work Email</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
                                    <a href="#" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">Forgot?</a>
                                </div>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
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
                            <div className="flex items-center justify-center space-x-2 text-slate-500 mb-6">
                                <div className="h-px w-full bg-slate-800/50" />
                                <span className="text-xs font-semibold uppercase tracking-wider px-2 whitespace-nowrap">Or continue with</span>
                                <div className="h-px w-full bg-slate-800/50" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex items-center justify-center space-x-2 bg-slate-950/40 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-lg py-2.5 text-sm font-medium text-slate-300 transition-colors">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                    <span>Google</span>
                                </button>
                                <button className="flex items-center justify-center space-x-2 bg-slate-950/40 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-lg py-2.5 text-sm font-medium text-slate-300 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" /></svg>
                                    <span>GitHub</span>
                                </button>
                            </div>

                            <div className="mt-8 flex items-center justify-center space-x-1.5 text-xs text-slate-500 font-medium">
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
