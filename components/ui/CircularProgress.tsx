"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "./Card";

interface CircularProgressProps {
    value: number; // 0 to 100
    title: string;
    subtitle: string;
    status?: "Critical" | "Warning" | "Good" | "Not Started";
    colorClass?: string;
    isActive?: boolean;
    onClick?: () => void;
    className?: string;
}

export function CircularProgress({
    value,
    title,
    subtitle,
    status = "Not Started",
    colorClass = "text-blue-500", // Tailwind color class for the stroke
    isActive = false,
    onClick,
    className,
}: CircularProgressProps) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "flex items-center space-x-6 p-6 rounded-2xl cursor-pointer transition-all duration-300 relative group overflow-hidden",
                isActive
                    ? "glass-panel border-blue-500/30 shadow-glow"
                    : "glass-panel hover:border-slate-700",
                className
            )}
        >
            {/* Active Indicator Glow inside the card */}
            {isActive && (
                <div className="absolute inset-0 bg-blue-500/5 blur-xl pointer-events-none" />
            )}

            {/* Circular SVG */}
            <div className="relative flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                        className="text-slate-800"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="48"
                        cy="48"
                    />
                    <motion.circle
                        className={cn(colorClass, "drop-shadow-lg")}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="48"
                        cy="48"
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className={cn("text-2xl font-bold tracking-tighter text-glow", colorClass)}>
                        {value}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">%</span>
                </div>
            </div>

            {/* Info Content */}
            <div className="flex flex-col flex-1 z-10">
                <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-xl font-semibold text-slate-100 tracking-tight">{title}</h2>
                    {status && (
                        <span
                            className={cn(
                                "px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full border",
                                {
                                    "bg-red-500/10 text-red-400 border-red-500/20": status === "Critical",
                                    "bg-amber-500/10 text-amber-400 border-amber-500/20": status === "Warning",
                                    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20": status === "Good",
                                    "bg-slate-500/10 text-slate-400 border-slate-500/20": status === "Not Started",
                                }
                            )}
                        >
                            {status}
                        </span>
                    )}
                </div>
                <p className="text-sm text-slate-400 line-clamp-2">{subtitle}</p>
            </div>
        </motion.div>
    );
}
