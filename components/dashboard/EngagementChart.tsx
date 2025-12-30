"use client";

import { TrendingUp } from "lucide-react";

interface ChartData {
    label: string;
    value: number;
}

interface EngagementChartProps {
    data: ChartData[];
}

export default function EngagementChart({ data }: EngagementChartProps) {
    const maxValue = Math.max(...data.map((d) => d.value));

    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-text-primary">Engagement Overview</h2>
                    <p className="text-sm text-text-secondary mt-1">Last 7 days</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                </div>
            </div>

            <div className="space-y-4">
                {data.map((item, index) => {
                    const percentage = (item.value / maxValue) * 100;
                    return (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-secondary">{item.label}</span>
                                <span className="font-semibold text-text-primary">{item.value}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-primary to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-text-secondary">Total Engagement</p>
                        <p className="text-2xl font-bold text-text-primary mt-1">
                            {data.reduce((sum, item) => sum + item.value, 0)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-text-secondary">Average</p>
                        <p className="text-2xl font-bold text-text-primary mt-1">
                            {Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
