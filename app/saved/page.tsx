"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bookmark, Loader2, X, Copy, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface SavedPost {
  id: string;
  savedAt: string;
  post: {
    id: string;
    content: string;
    topic: string;
    createdAt: string;
  };
}

export default function SavedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/saved");
    } else if (status === "authenticated") {
      fetchSavedPosts();
    }
  }, [status, router]);

  const fetchSavedPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/saved");

      if (!response.ok) {
        throw new Error("Failed to fetch saved posts");
      }

      const data = await response.json();
      setSavedPosts(data.savedPosts || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load saved posts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsave = async (savedPostId: string) => {
    try {
      const response = await fetch(`/api/saved/${savedPostId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to unsave post");
      }

      toast.success("Post removed from saved");
      setSavedPosts(savedPosts.filter((sp) => sp.id !== savedPostId));
    } catch (error: any) {
      toast.error(error.message || "Failed to unsave post");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Post copied to clipboard");
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Saved Posts</h1>
        <p className="text-text-secondary">
          Your collection of saved LinkedIn posts
        </p>
      </div>

      {/* Stats */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-text-primary mb-1">
              {savedPosts.length}
            </div>
            <div className="text-text-secondary">Saved Posts</div>
          </div>
          <Bookmark className="w-12 h-12 text-primary opacity-20" />
        </div>
      </div>

      {/* Saved Posts List */}
      {savedPosts.length === 0 ? (
        <div className="card p-12 text-center">
          <Bookmark className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No saved posts yet
          </h3>
          <p className="text-text-secondary mb-6">
            Save posts from the generator to access them later
          </p>
          <button
            onClick={() => router.push("/")}
            className="btn-primary"
          >
            Generate Post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedPosts.map((savedPost) => (
            <div
              key={savedPost.id}
              className="card p-6 hover:shadow-medium transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                      SAVED
                    </span>
                    <span className="text-sm text-text-secondary">
                      Saved {format(new Date(savedPost.savedAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {savedPost.post.topic}
                  </h3>
                </div>
                <button
                  onClick={() => handleUnsave(savedPost.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove from saved"
                >
                  <X className="w-5 h-5 text-red-500" />
                </button>
              </div>

              <div className="bg-card-bg p-4 rounded-lg mb-4">
                <p className="text-text-primary whitespace-pre-wrap">
                  {savedPost.post.content}
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleCopy(savedPost.post.content)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
