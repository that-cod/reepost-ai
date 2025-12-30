"use client";

import Link from "next/link";
import { Sparkles, Calendar, TrendingUp, BarChart3, LucideIcon } from "lucide-react";

interface QuickAction {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    colorClass: string;
}

const quickActions: QuickAction[] = [
    {
        title: "Generate Post",
        description: "Create new content with AI",
        icon: Sparkles,
        href: "/generate",
        colorClass: "from-blue-500 to-purple-600",
    },
    {
        title: "Schedule Post",
        description: "Plan your content calendar",
        icon: Calendar,
        href: "/calendar",
        colorClass: "from-primary to-accent",
    },
    {
        title: "Browse Trending",
        description: "Discover viral content",
        icon: TrendingUp,
        href: "/trending",
        colorClass: "from-green-500 to-teal-600",
    },
    {
        title: "View Analytics",
        description: "Track your performance",
        icon: BarChart3,
        href: "/engagement",
        colorClass: "from-orange-500 to-red-600",
    },
];

export default function QuickActions() {
    return (
        <div className="card p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="group p-4 rounded-xl border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-md"
                        >
                            <div className="flex items-start space-x-3">
                                <div
                                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.colorClass} flex items-center justify-center group-hover:scale-110 transition-transform`}
                                >
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                                        {action.title}
                                    </h3>
                                    <p className="text-xs text-text-secondary mt-1">
                                        {action.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
