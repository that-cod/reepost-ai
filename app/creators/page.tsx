"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, ExternalLink } from "lucide-react";
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
  isFollowing: boolean;
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/creators?limit=100");
      const data = await response.json();

      if (response.ok && data.success) {
        setCreators(data.creators);
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

  const handleToggleFollow = async (creatorId: string, isCurrentlyFollowing: boolean) => {
    try {
      if (isCurrentlyFollowing) {
        // Unfollow
        const response = await fetch(`/api/creators/follow?creatorId=${creatorId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setCreators(prev =>
            prev.map(c =>
              c.id === creatorId ? { ...c, isFollowing: false } : c
            )
          );
          toast.success("Removed from favorites");
        } else {
          toast.error("Failed to unfollow");
        }
      } else {
        // Follow
        const response = await fetch("/api/creators/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ creatorId }),
        });

        if (response.ok) {
          setCreators(prev =>
            prev.map(c =>
              c.id === creatorId ? { ...c, isFollowing: true } : c
            )
          );
          toast.success("Added to favorites");
        } else {
          const data = await response.json();
          toast.error(data.error || "Failed to follow");
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update");
    }
  };

  const handleOpenActivity = (linkedinUrl: string | null) => {
    if (linkedinUrl) {
      window.open(linkedinUrl, '_blank');
    } else {
      toast.error("LinkedIn profile not available");
    }
  };

  const filteredCreators = creators.filter(creator =>
    creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.headline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteCreators = filteredCreators.filter(c => c.isFollowing);
  const discoverCreators = filteredCreators.filter(c => !c.isFollowing).slice(0, 100);

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
            Discover Creators
          </h1>
          <p className="text-lg text-gray-600">
            Follow your favorite creators to see their trending posts
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators by name, username, or headline..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Your Favorite Creators */}
        {favoriteCreators.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Favorite Creators</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Checkout their recent activity and engage in their post to support them. Want to modify who shows up in this list?{" "}
                  <button className="text-primary hover:underline font-medium">
                    View Profiles
                  </button>
                </p>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <span className="font-medium">{favoriteCreators.length} Following</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all"
                >
                  {/* Avatar */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold">
                      {getInitials(creator.name)}
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>

                  {/* Creator Info */}
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {creator.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
                    {creator.headline || "LinkedIn Creator"}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    {creator.username && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
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
          </div>
        )}

        {/* Discover Creators */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Discover More Creators</h2>
            <p className="text-sm text-gray-600 mt-1">
              Browse and follow creators to personalize your trending posts feed
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : discoverCreators.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No creators found matching your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {discoverCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all"
                >
                  {/* Avatar */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xl font-bold">
                      {getInitials(creator.name)}
                    </div>
                  </div>

                  {/* Creator Info */}
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {creator.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
                    {creator.headline || "LinkedIn Creator"}
                  </p>

                  {/* Stats */}
                  <div className="text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1 mb-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{creator.postCount} trending posts</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleToggleFollow(creator.id, creator.isFollowing)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-primary hover:text-primary transition-all"
                  >
                    + Add to Favorites
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
