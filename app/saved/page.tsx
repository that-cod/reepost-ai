"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bookmark, Loader2, X, Copy, Edit, Check, Calendar } from "lucide-react";
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
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingPostId, setSchedulingPostId] = useState<string | null>(null);
  const [schedulingContent, setSchedulingContent] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");

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

  const handleEdit = (postId: string, content: string) => {
    setEditingPostId(postId);
    setEditedContent(content);
  };

  const handleSaveEdit = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      // Update local state
      setSavedPosts(savedPosts.map(sp =>
        sp.post.id === postId
          ? { ...sp, post: { ...sp.post, content: editedContent } }
          : sp
      ));

      setEditingPostId(null);
      toast.success("Post updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update post");
    }
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditedContent("");
  };

  const handleSchedulePost = (postId: string, content: string) => {
    setSchedulingPostId(postId);
    setSchedulingContent(content);
    setShowScheduleModal(true);

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  };

  const handleConfirmSchedule = async () => {
    if (!selectedDate || !schedulingContent) {
      toast.error("Please select a date and ensure content is available");
      return;
    }

    try {
      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

      const response = await fetch('/api/calendar/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: schedulingContent,
          scheduledFor: scheduledDateTime.toISOString(),
        }),
      });

      if (response.ok) {
        toast.success("Post scheduled successfully! View it in the Calendar.");
        setShowScheduleModal(false);
        setSchedulingPostId(null);
        setSchedulingContent("");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to schedule post");
      }
    } catch (error) {
      console.error("Error scheduling post:", error);
      toast.error("Failed to schedule post");
    }
  };

  const handleCancelSchedule = () => {
    setShowScheduleModal(false);
    setSchedulingPostId(null);
    setSchedulingContent("");
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
                {editingPostId === savedPost.post.id ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full min-h-[200px] p-4 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary resize-none"
                  />
                ) : (
                  <p className="text-text-primary whitespace-pre-wrap">
                    {savedPost.post.content}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                {editingPostId === savedPost.post.id ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={() => handleSaveEdit(savedPost.post.id)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleCopy(savedPost.post.content)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() => handleEdit(savedPost.post.id, savedPost.post.content)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleSchedulePost(savedPost.post.id, savedPost.post.content)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Schedule</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Schedule Post</h2>
              <button
                onClick={handleCancelSchedule}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Time
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Content Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Content Preview
                </label>
                <div className="bg-gray-50 rounded-xl p-4 max-h-[200px] overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-wrap">{schedulingContent}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancelSchedule}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSchedule}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:from-primary-dark hover:to-primary transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
