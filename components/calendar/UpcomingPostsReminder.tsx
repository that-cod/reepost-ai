"use client";

import { useState, useEffect } from "react";
import { Bell, X, Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ScheduledPost {
  id: string;
  content: string;
  scheduledFor: string;
}

export default function UpcomingPostsReminder() {
  const router = useRouter();
  const [upcomingPosts, setUpcomingPosts] = useState<ScheduledPost[]>([]);
  const [showReminder, setShowReminder] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchUpcomingPosts();

    // Check every 5 minutes for upcoming posts
    const interval = setInterval(() => {
      fetchUpcomingPosts();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchUpcomingPosts = async () => {
    try {
      const response = await fetch('/api/calendar/upcoming');
      const data = await response.json();

      if (response.ok && data.success) {
        setUpcomingPosts(data.posts);

        // Show reminder if there are posts scheduled in the next 24 hours
        if (data.posts.length > 0 && !dismissed) {
          setShowReminder(true);
        }
      }
    } catch (error) {
      console.error("Error fetching upcoming posts:", error);
    }
  };

  const handleDismiss = () => {
    setShowReminder(false);
    setDismissed(true);
  };

  const handleViewCalendar = () => {
    router.push('/calendar');
    setShowReminder(false);
  };

  const formatTimeUntil = (scheduledFor: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledFor);
    const diffMs = scheduled.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours < 1) {
      return `in ${diffMinutes} minutes`;
    } else if (diffHours < 24) {
      return `in ${diffHours} hours`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  };

  if (!showReminder || upcomingPosts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-slide-up">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-primary p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Upcoming Posts</h3>
              <p className="text-sm text-gray-600">
                You have {upcomingPosts.length} post{upcomingPosts.length > 1 ? 's' : ''} scheduled
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 mb-3">
          {upcomingPosts.slice(0, 2).map(post => (
            <div
              key={post.id}
              className="bg-gradient-to-r from-light-green to-pastel-green rounded-xl p-3 border border-primary"
            >
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  {formatTimeUntil(post.scheduledFor)}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">
                  {new Date(post.scheduledFor).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>
            </div>
          ))}
          {upcomingPosts.length > 2 && (
            <p className="text-xs text-gray-600 text-center">
              +{upcomingPosts.length - 2} more scheduled posts
            </p>
          )}
        </div>

        <button
          onClick={handleViewCalendar}
          className="w-full px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:from-primary-dark hover:to-primary transition-all flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          View Calendar
        </button>
      </div>
    </div>
  );
}
