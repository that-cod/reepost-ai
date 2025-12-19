'use client';

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden min-h-screen flex flex-col items-center justify-center">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-emerald-900/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="container px-4 mx-auto text-center relative z-10">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-emerald-400 mb-8 backdrop-blur-sm"
                >
                    <Sparkles className="size-4" />
                    <span>New: AI Viral Hooks Database</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto"
                >
                    Write LinkedIn Posts Like the
                    <span className="text-primary block mt-2">Top 1% In Seconds</span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl text-gray-400 max-w-2xl mx-auto mb-10"
                >
                    Stop staring at a blank screen. RepostAI turns your ideas into high-engagement LinkedIn content using data-backed frameworks.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                >
                    <Link href="/auth/signin">
                        <Button variant="glow" size="lg" className="h-14 px-8 text-lg">
                            Get Started for Free <ArrowRight className="ml-2 size-5" />
                        </Button>
                    </Link>
                    <Link href="/generate">
                        <Button variant="glass" size="lg" className="h-14 px-8 text-lg">
                            Watch Demo
                        </Button>
                    </Link>
                </motion.div>

                {/* Browser Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="relative max-w-5xl mx-auto"
                >
                    <div className="glass-card rounded-xl border border-white/10 overflow-hidden shadow-2xl ring-1 ring-white/10">
                        {/* Browser Header */}
                        <div className="h-10 bg-black/40 border-b border-white/5 flex items-center px-4 gap-2">
                            <div className="flex gap-2">
                                <div className="size-3 rounded-full bg-red-500/50" />
                                <div className="size-3 rounded-full bg-yellow-500/50" />
                                <div className="size-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="flex-1 text-center text-xs text-gray-500 font-mono">repostai.io/editor</div>
                        </div>

                        {/* App Interface Mockup */}
                        <div className="grid md:grid-cols-[250px_1fr_300px] h-[600px] bg-black/40 text-left">
                            {/* Sidebar */}
                            <div className="border-r border-white/5 p-4 hidden md:block">
                                <div className="space-y-4">
                                    <div className="h-8 w-32 bg-white/5 rounded mx-auto" />
                                    <div className="space-y-2 mt-8">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-8 w-full bg-white/5 rounded-lg opacity-40 hover:opacity-100 transition-opacity" />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Editor */}
                            <div className="p-8">
                                <div className="bg-white/5 rounded-xl border border-white/10 h-full p-6 relative">
                                    <div className="absolute top-4 right-4 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded">Score: 94</div>
                                    <div className="h-8 w-2/3 bg-white/10 rounded mb-6" />
                                    <div className="space-y-3">
                                        <div className="h-4 w-full bg-white/5 rounded" />
                                        <div className="h-4 w-full bg-white/5 rounded" />
                                        <div className="h-4 w-5/6 bg-white/5 rounded" />
                                        <div className="h-4 w-4/6 bg-white/5 rounded" />
                                    </div>

                                    {/* AI Suggestion */}
                                    <div className="mt-8 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="size-4 text-emerald-400" />
                                            <span className="text-sm font-medium text-emerald-400">AI Suggestion</span>
                                        </div>
                                        <p className="text-sm text-gray-300">Try rephrasing the hook to trigger curiosity. "7 things I learned..." performs 12% better.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Settings */}
                            <div className="border-l border-white/5 p-4 hidden md:block bg-black/20">
                                <div className="space-y-4">
                                    <div className="h-32 bg-white/5 rounded-lg border border-white/10" />
                                    <div className="h-40 bg-white/5 rounded-lg border border-white/10" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reflection Glow from below */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-2xl -z-10 opacity-50" />
                </motion.div>
            </div>
        </section>
    );
}
