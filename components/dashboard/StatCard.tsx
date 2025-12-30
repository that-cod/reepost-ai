"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: LucideIcon;
    colorClass?: string;
}

export default function StatCard({
    title,
    value,
    change,
    icon: Icon,
    colorClass = "from-primary to-purple-600",
}: StatCardProps) {
    const isPositive = change && change > 0;

    return (
        <div className="card p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-text-secondary mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-text-primary mb-2">{value}</h3>
                    {change !== undefined && (
                        <div className="flex items-center space-x-1">
                            <span
                                className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"
                                    }`}
                            >
                                {isPositive ? "+" : ""}
                                {change}%
                            </span>
                            <span className="text-xs text-text-secondary">vs last week</span>
                        </div>
                    )}
                </div>
                <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center`}
                >
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}
