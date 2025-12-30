"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    FileText,
    TrendingUp,
    Users,
    Target,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import EngagementChart from "@/components/dashboard/EngagementChart";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPosts: 0,
        engagement: 0,
        followers: 0,
        postsThisWeek: 0,
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (status === "authenticated") {
            loadDashboardData();
        }
    }, [status, router]);

    const loadDashboardData = async () => {
        try {
            // TODO: Replace with actual API call
            // Simulating data load
            setTimeout(() => {
                setStats({
                    totalPosts: 47,
                    engagement: 12.5,
                    followers: 2847,
                    postsThisWeek: 5,
                });
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            setIsLoading(false);
        }
    };

    // Sample data for charts and activity feed
    const engagementData = [
        { label: "Monday", value: 234 },
        { label: "Tuesday", value: 312 },
        { label: "Wednesday", value: 289 },
        { label: "Thursday", value: 401 },
        { label: "Friday", value: 378 },
        { label: "Saturday", value: 156 },
        { label: "Sunday", value: 189 },
    ];

    const activities = [
        {
            id: "1",
            type: "post_generated" as const,
            title: "New Post Generated",
            description: "Created post about AI in marketing",
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        },
        {
            id: "2",
            type: "engagement" as const,
            title: "High Engagement Alert",
            description: "Your post got 50+ likes in the first hour",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        },
        {
            id: "3",
            type: "post_scheduled" as const,
            title: "Post Scheduled",
            description: "Post scheduled for tomorrow at 10 AM",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        },
    ];

    if (status === "loading" || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2">
                    Welcome back, {session?.user?.name || "User"}! 👋
                </h1>
                <p className="text-text-secondary">
                    Here's what's happening with your LinkedIn content today
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Posts"
                    value={stats.totalPosts}
                    change={15.3}
                    icon={FileText}
                    colorClass="from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Avg. Engagement"
                    value={`${stats.engagement}%`}
                    change={8.2}
                    icon={TrendingUp}
                    colorClass="from-green-500 to-green-600"
                />
                <StatCard
                    title="Followers"
                    value={stats.followers.toLocaleString()}
                    change={12.7}
                    icon={Users}
                    colorClass="from-purple-500 to-purple-600"
                />
                <StatCard
                    title="This Week"
                    value={stats.postsThisWeek}
                    change={25.0}
                    icon={Target}
                    colorClass="from-orange-500 to-orange-600"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Engagement Chart + Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <EngagementChart data={engagementData} />
                    <QuickActions />
                </div>

                {/* Right Column - Activity Feed */}
                <div className="lg:col-span-1">
                    <ActivityFeed activities={activities} />
                </div>
            </div>
        </div>
    );
}
