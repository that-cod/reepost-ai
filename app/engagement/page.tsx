"use client";

import { useState, useEffect } from "react";
import { MapPin, Briefcase, MoreVertical } from "lucide-react";
import toast from "react-hot-toast";

interface Creator {
  id: string;
  name: string;
  username?: string | null;
  headline?: string | null;
  image?: string | null;
  linkedinUrl?: string | null;
  followerCount: number;
  postCount: number;
  location?: string | null;
  occupation?: string | null;
  industry?: string | null;
}

export default function EngagementPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowedCreators();
  }, []);

  const fetchFollowedCreators = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/creators?limit=100");
      const data = await response.json();

      if (response.ok && data.success) {
        // Filter to only show followed creators
        const followedCreators = data.creators.filter((c: any) => c.isFollowing);
        setCreators(followedCreators);
      } else {
        toast.error("Failed to load creators");
      }
    } catch (error) {
      console.error("Error fetching creators:", error);
      toast.error("Failed to load creators");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActivity = (linkedinUrl: string | null) => {
    if (linkedinUrl) {
      // Add /recent-activity/all/ to the LinkedIn profile URL
      const activityUrl = `${linkedinUrl}/recent-activity/all/`;
      window.open(activityUrl, '_blank');
    } else {
      toast.error("LinkedIn profile not available");
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Favorite Creators
          </h1>
          <p className="text-lg text-gray-600">
            Checkout their recent activity and engage in their post to support them. Want to modify who shows up in this list?{" "}
            <a href="/creators" className="text-primary hover:text-primary-dark font-medium hover:underline">
              View Profiles
            </a>
          </p>
        </div>

        {/* Following Count Badge */}
        <div className="mb-6 flex items-center gap-2 text-gray-600">
          <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
          <span className="font-medium">{creators.length} Following</span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No favorite creators yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start following creators to see their recent activity here
            </p>
            <a
              href="/creators"
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:from-primary-dark hover:to-primary transition-all"
            >
              Browse Creators
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creators.map((creator) => (
              <div
                key={creator.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all"
              >
                {/* Avatar and Menu */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold">
                    {getInitials(creator.name)}
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreVertical className="w-6 h-6" />
                  </button>
                </div>

                {/* Creator Info */}
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {creator.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
                  {creator.headline || "LinkedIn Creator"}
                </p>

                {/* Location/Industry */}
                <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
                  {creator.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">{creator.location}</span>
                    </div>
                  )}
                  {creator.industry && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">{creator.industry}</span>
                    </div>
                  )}
                  {!creator.location && !creator.industry && creator.username && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">{creator.username}</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleOpenActivity(creator.linkedinUrl)}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:from-primary-dark hover:to-primary transition-all"
                >
                  Open Recent Activity
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
