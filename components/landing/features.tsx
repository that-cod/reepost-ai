'use client';

import { motion } from "framer-motion";
import { PenTool, Share2, Calendar, Zap, LayoutTemplate, Sparkles } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const features = [
    {
        title: "AI Writing Styles",
        description: "Mimic your favorite creators or define your own unique voice.",
        icon: PenTool,
        colSpan: "md:col-span-2",
        bg: "bg-purple-500/10"
    },
    {
        title: "Viral Hooks Database",
        description: "Access 500+ proven hooks that stop the scroll.",
        icon: Zap,
        colSpan: "md:col-span-1",
        bg: "bg-yellow-500/10"
    },
    {
        title: "One-Click Scheduling",
        description: "Sync directly to LinkedIn without leaving the app.",
        icon: Calendar,
        colSpan: "md:col-span-1",
        bg: "bg-blue-500/10"
    },
    {
        title: "Smart Formatting",
        description: "Auto-add line breaks, bold text, and lists for readability.",
        icon: LayoutTemplate,
        colSpan: "md:col-span-2",
        bg: "bg-emerald-500/10"
    }
];

const logos = [
    { name: "Company 1", src: "/logos/logo1.svg" }, // Placeholders
    { name: "Company 2", src: "/logos/logo2.svg" },
    { name: "Company 3", src: "/logos/logo3.svg" },
    { name: "Company 4", src: "/logos/logo4.svg" },
    { name: "Company 5", src: "/logos/logo5.svg" },
];

export function Features() {
    const [activeTab, setActiveTab] = useState("after");

    return (
        <section className="py-24 relative" id="features">
            <div className="container px-4 mx-auto">

                {/* Social Proof */}
                <div className="text-center mb-20">
                    <p className="text-sm text-gray-500 mb-6 uppercase tracking-wider">Trusted by 5000+ Creators</p>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Using text placeholders since we don't have actual logo assets yet */}
                        {["Adobe", "Spotify", "Netflix", "Google", "Microsoft"].map((brand) => (
                            <span key={brand} className="text-xl font-bold text-white/40 hover:text-white transition-colors cursor-default">{brand}</span>
                        ))}
                    </div>
                </div>

                {/* Bento Grid */}
                <div className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to <span className="text-primary">go viral</span></h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Powerful tools designed to help you create, format, and schedule LinkedIn content 10x faster.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`glass-card p-8 rounded-2xl ${feature.colSpan} group hover:border-white/30 transition-colors`}
                            >
                                <div className={`p-3 rounded-xl w-fit mb-6 ${feature.bg}`}>
                                    <feature.icon className="size-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Before & After Interactive */}
                <div className="bg-white/5 rounded-3xl p-8 md:p-12 border border-white/10">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-3xl font-bold mb-4">Transform boring text into engagement magnets</h3>
                            <p className="text-gray-400 mb-8">See the difference proper formatting and hook optimization makes.</p>

                            <div className="flex gap-4 mb-8">
                                <button
                                    onClick={() => setActiveTab("before")}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'before' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Before RepostAI
                                </button>
                                <button
                                    onClick={() => setActiveTab("after")}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'after' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    After RepostAI
                                </button>
                            </div>
                        </div>

                        <div className="relative h-[400px] w-full">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className={`absolute inset-0 rounded-xl p-6 border ${activeTab === 'after' ? 'border-primary/30 bg-primary/5' : 'border-white/10 bg-white/5'} overflow-y-auto`}
                            >
                                {activeTab === 'before' ? (
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        I wanted to share verify effective marketing strategies. First, you need to understand your audience. Then, create good content. Finally, distribute it well. This works for me.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-white font-bold text-lg">3 Dead-Simple Marketing Strategies (That Actually Work) 🚀</p>
                                        <p className="text-gray-300 text-sm">Most people overcomplicate marketing.</p>
                                        <p className="text-gray-300 text-sm">Here's the simple framework I used to grow to 50k followers:</p>
                                        <ul className="space-y-2 text-sm text-gray-300">
                                            <li className="flex gap-2"><span>1️⃣</span> <span><strong>Know Your Audience:</strong> Don't guess. Talk to them.</span></li>
                                            <li className="flex gap-2"><span>2️⃣</span> <span><strong>Create Value:</strong> Solve specific problems.</span></li>
                                            <li className="flex gap-2"><span>3️⃣</span> <span><strong>Distribute Smartly:</strong> Go where they hang out.</span></li>
                                        </ul>
                                        <p className="text-sm text-emerald-400">#marketing #growth #strategy</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
