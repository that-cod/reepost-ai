"use client";

import { useState, useEffect } from "react";
import { Search, Sliders, ChevronDown, Loader2, TrendingUp } from "lucide-react";
import TrendingPostCard from "@/components/trending/TrendingPostCard";
import toast from "react-hot-toast";

interface TrendingPost {
  id: string;
  content: string;
  linkedInPostId: string | null;
  postUrl: string | null;
  postType: string | null;
  mediaUrl?: string;
  mediaType: "IMAGE" | "VIDEO" | "DOCUMENT" | "NONE";
  likes: number;
  comments: number;
  reposts: number;
  views: number;
  outlierIndex: number;
  wordCount: number | null;
  hasQuestion: boolean | null;
  hasCallToAction: boolean | null;
  postedHour: number | null;
  postedDayOfWeek: string | null;
  publishedDate: string;
  keywords: string[];
  creator: {
    id: string;
    name: string;
    username: string | null;
    headline: string | null;
    image: string | null;
    linkedinUrl: string | null;
    followerCount: number;
  };
}

interface FilterState {
  mediaType: string;
  minEngagement: number;
  dayOfWeek: string;
  hasQuestion: boolean | null;
  hasCTA: boolean | null;
  postType: string;
  sortBy: 'latest' | 'engagement' | 'outlier';
  followedOnly: boolean;
}

interface Stats {
  totalPosts: number;
  withQuestions: number;
  withCTA: number;
  highVirality: number;
}

export default function TrendingPage() {
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    withQuestions: 0,
    withCTA: 0,
    highVirality: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    mediaType: "all",
    minEngagement: 0,
    dayOfWeek: "all",
    hasQuestion: null,
    hasCTA: null,
    postType: "all",
    sortBy: 'outlier',
    followedOnly: false,
  });

  useEffect(() => {
    fetchPosts();
  }, [filters, searchQuery]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sortBy: filters.sortBy,
        limit: '50',
      });

      if (filters.mediaType !== 'all') {
        params.append('mediaType', filters.mediaType);
      }
      if (filters.dayOfWeek !== 'all') {
        params.append('dayOfWeek', filters.dayOfWeek);
      }
      if (filters.postType !== 'all') {
        params.append('postType', filters.postType);
      }
      if (filters.minEngagement > 0) {
        params.append('minEngagement', filters.minEngagement.toString());
      }
      if (filters.hasQuestion !== null) {
        params.append('hasQuestion', filters.hasQuestion.toString());
      }
      if (filters.hasCTA !== null) {
        params.append('hasCTA', filters.hasCTA.toString());
      }
      if (filters.followedOnly) {
        params.append('followedOnly', 'true');
      }

      const response = await fetch(`/api/trending-posts?${params}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setPosts(data.posts);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        toast.error("Failed to load trending posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load trending posts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Trending LinkedIn Posts
          </h1>
          <p className="text-lg text-gray-600">
            Discover viral content from top creators and analyze what's working on LinkedIn
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts by content or creator..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Followed Creators Toggle */}
          <div className="mb-4 flex items-center justify-between p-4 bg-gradient-to-r from-light-green to-pastel-green rounded-xl border border-primary">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Show Only Favorite Creators</h3>
                <p className="text-sm text-gray-600">Filter posts from creators you follow</p>
              </div>
            </div>
            <button
              onClick={() => setFilters({ ...filters, followedOnly: !filters.followedOnly })}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                filters.followedOnly ? 'bg-gradient-to-r from-primary to-accent' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  filters.followedOnly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="outlier">Virality Score</option>
                <option value="engagement">Total Engagement</option>
                <option value="latest">Most Recent</option>
              </select>
            </div>

            {/* Media Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media Type
              </label>
              <select
                value={filters.mediaType}
                onChange={(e) => setFilters({ ...filters, mediaType: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="DOCUMENT">Document</option>
                <option value="NONE">Text Only</option>
              </select>
            </div>

            {/* Day of Week */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day Posted
              </label>
              <select
                value={filters.dayOfWeek}
                onChange={(e) => setFilters({ ...filters, dayOfWeek: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="all">All Days</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            {/* Post Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Type
              </label>
              <select
                value={filters.postType}
                onChange={(e) => setFilters({ ...filters, postType: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="regular">Original Posts</option>
                <option value="repost">Reposts</option>
                <option value="quote">Quote Posts</option>
              </select>
            </div>
          </div>

          {/* Content Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setFilters({ ...filters, hasQuestion: filters.hasQuestion === true ? null : true })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.hasQuestion === true
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
              }`}
            >
              Has Question
            </button>
            <button
              onClick={() => setFilters({ ...filters, hasCTA: filters.hasCTA === true ? null : true })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.hasCTA === true
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
              }`}
            >
              Has Call-to-Action
            </button>

            {/* Reset Filters */}
            {(filters.mediaType !== 'all' || filters.dayOfWeek !== 'all' || filters.postType !== 'all' || filters.hasQuestion !== null || filters.hasCTA !== null) && (
              <button
                onClick={() => setFilters({
                  mediaType: "all",
                  minEngagement: 0,
                  dayOfWeek: "all",
                  hasQuestion: null,
                  hasCTA: null,
                  postType: "all",
                  sortBy: 'outlier',
                })}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalPosts.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.withQuestions.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">With Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.withCTA.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">With CTA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.highVirality.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">High Virality</div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Loading trending posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search query</p>
            <button
              onClick={() => setFilters({
                mediaType: "all",
                minEngagement: 0,
                dayOfWeek: "all",
                hasQuestion: null,
                hasCTA: null,
                postType: "all",
                sortBy: 'outlier',
              })}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-md"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <TrendingPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
