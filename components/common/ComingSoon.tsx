"use client";

import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ComingSoonProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
}

export default function ComingSoon({
    title,
    description = "We're working hard to bring you this feature. Stay tuned!",
    icon
}: ComingSoonProps) {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="card p-12 text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl mb-6">
                    {icon || <Sparkles className="w-10 h-10 text-primary" />}
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-text-primary mb-3">
                    {title}
                </h1>

                {/* Coming Soon Badge */}
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-full text-sm font-semibold mb-6">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Coming Soon
                </div>

                {/* Description */}
                <p className="text-text-secondary max-w-md mx-auto mb-8">
                    {description}
                </p>

                {/* Features Preview */}
                <div className="bg-card-bg rounded-xl p-6 mb-8">
                    <p className="text-sm text-text-secondary mb-4">What to expect:</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <span className="px-3 py-1 bg-white rounded-full text-xs text-text-primary border border-border">
                            AI-Powered
                        </span>
                        <span className="px-3 py-1 bg-white rounded-full text-xs text-text-primary border border-border">
                            LinkedIn Optimized
                        </span>
                        <span className="px-3 py-1 bg-white rounded-full text-xs text-text-primary border border-border">
                            Analytics Dashboard
                        </span>
                    </div>
                </div>

                {/* Back Button */}
                <Link
                    href="/"
                    className="btn-primary inline-flex items-center space-x-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Generator</span>
                </Link>
            </div>

            {/* Newsletter signup hint */}
            <p className="text-center text-sm text-text-secondary mt-6">
                Want early access? Stay tuned for updates on Repost Ai
            </p>
        </div>
    );
}
