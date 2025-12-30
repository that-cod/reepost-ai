"use client";

import { FileText, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
    id: string;
    type: "post_generated" | "post_scheduled" | "engagement" | "achievement";
    title: string;
    description: string;
    timestamp: Date;
}

const iconMap = {
    post_generated: FileText,
    post_scheduled: Calendar,
    engagement: TrendingUp,
    achievement: CheckCircle,
};

const colorMap = {
    post_generated: "text-blue-600 bg-blue-100",
    post_scheduled: "text-purple-600 bg-purple-100",
    engagement: "text-green-600 bg-green-100",
    achievement: "text-yellow-600 bg-yellow-100",
};

interface ActivityFeedProps {
    activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <div className="card p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">
                Recent Activity
            </h2>
            <div className="space-y-4">
                {activities.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-text-secondary mx-auto mb-3 opacity-50" />
                        <p className="text-text-secondary">No recent activity</p>
                    </div>
                ) : (
                    activities.map((activity) => {
                        const Icon = iconMap[activity.type];
                        const colorClass = colorMap[activity.type];

                        return (
                            <div
                                key={activity.id}
                                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-card-bg transition-colors"
                            >
                                <div className={`p-2 rounded-lg ${colorClass}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary">
                                        {activity.title}
                                    </p>
                                    <p className="text-xs text-text-secondary mt-1">
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-text-secondary mt-1">
                                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
