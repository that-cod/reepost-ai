"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Save, Copy, Edit, Send, Check, X, Clock, CalendarDays, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface PostPreviewProps {
  content: string;
  isGenerating: boolean;
  postId?: string; // Optional - if provided, can be saved directly
  onPostSaved?: (postId: string) => void; // Callback when post is saved
  onContentChange?: (content: string) => void; // Callback when content is edited
}

export default function PostPreview({
  content,
  isGenerating,
  postId,
  onPostSaved,
  onContentChange
}: PostPreviewProps) {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [savedPostId, setSavedPostId] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const userName = session?.user?.name || "You";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("No content to save");
      return;
    }

    setIsSaving(true);

    try {
      // First, create the post if we don't have a postId
      let currentPostId = postId || savedPostId;

      if (!currentPostId) {
        // Create a new post first
        const createResponse = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: content,
            status: "DRAFT",
          }),
        });

        if (!createResponse.ok) {
          throw new Error("Failed to create post");
        }

        const postData = await createResponse.json();
        currentPostId = postData.id;
        setSavedPostId(currentPostId);
      }

      // Now save it to user's saved posts
      const saveResponse = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: currentPostId }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save post");
      }

      toast.success("Post saved successfully!");
      if (currentPostId) {
        onPostSaved?.(currentPostId);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save post");
    } finally {
      setIsSaving(false);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!content.trim()) {
      toast.error("No content to schedule");
      return;
    }

    setIsScheduling(true);

    try {
      // Create the post if we don't have one
      let currentPostId = postId || savedPostId;

      if (!currentPostId) {
        const createResponse = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: content,
          }),
        });

        if (!createResponse.ok) {
          throw new Error("Failed to create post");
        }

        const postData = await createResponse.json();
        currentPostId = postData.id;
        setSavedPostId(currentPostId);
      }

      // Schedule the post
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);

      const scheduleResponse = await fetch(`/api/posts/${currentPostId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SCHEDULED",
          scheduledFor: scheduledDateTime.toISOString(),
        }),
      });

      if (!scheduleResponse.ok) {
        throw new Error("Failed to schedule post");
      }

      toast.success(`Post scheduled for ${format(scheduledDateTime, "MMM d, yyyy 'at' h:mm a")}`);
      setShowScheduleModal(false);

      if (currentPostId) {
        onPostSaved?.(currentPostId);
      }
    } catch (error) {
      console.error("Schedule error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to schedule post");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(content);
  };

  const handleSaveEdit = () => {
    if (onContentChange) {
      onContentChange(editedContent);
    }
    setIsEditing(false);
    toast.success("Post updated!");
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const openScheduleModal = () => {
    // Set default to tomorrow at 9am
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(format(tomorrow, "yyyy-MM-dd"));
    setScheduleTime("09:00");
    setShowScheduleModal(true);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Post Preview
        </h3>
        {content && (
          <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-card-bg rounded-lg transition-colors"
              title="Copy"
            >
              <Copy className="w-4 h-4 text-text-secondary" />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-2 hover:bg-card-bg rounded-lg transition-colors"
              title="Save"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : savedPostId ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Save className="w-4 h-4 text-text-secondary" />
              )}
            </button>
            <button
              onClick={handleEdit}
              className="p-2 hover:bg-card-bg rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        )}
      </div>

      {/* Preview Content */}
      <div className="bg-white border border-border rounded-xl p-6 min-h-[400px]">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-text-secondary">Generating your post...</p>
          </div>
        ) : content ? (
          <div className="space-y-4">
            {/* Mock LinkedIn Post */}
            <div className="flex items-start space-x-3 mb-4">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold">
                  {userInitials}
                </div>
              )}
              <div>
                <p className="font-semibold text-text-primary">{userName}</p>
                <p className="text-xs text-text-secondary">
                  Content Creator • 2nd
                </p>
                <p className="text-xs text-text-secondary">Just now</p>
              </div>
            </div>

            {/* Post Content */}
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full min-h-[300px] p-4 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary leading-relaxed resize-none"
                placeholder="Edit your post content..."
              />
            ) : (
              <div className="whitespace-pre-wrap text-text-primary leading-relaxed">
                {content}
              </div>
            )}

            {/* Mock Engagement */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm text-text-secondary">
                <span>0 reactions</span>
                <span>0 comments • 0 reposts</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <div className="w-16 h-16 bg-card-bg rounded-full flex items-center justify-center mb-4">
              <Edit className="w-8 h-8 text-text-secondary" />
            </div>
            <p className="text-text-secondary">
              Your generated post will appear here
            </p>
            <p className="text-sm text-text-secondary mt-2">
              Enter a topic and click Generate Post to begin
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {content && !isGenerating && (
        <div className="flex space-x-3 mt-4">
          {isEditing ? (
            <>
              <button
                onClick={handleCancelEdit}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : savedPostId ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Draft</span>
                )}
              </button>
              <button
                onClick={openScheduleModal}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Schedule Post</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowScheduleModal(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">Schedule Post</h3>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 hover:bg-card-bg rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={format(new Date(), "yyyy-MM-dd")}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> LinkedIn posts perform best between 8-10 AM on weekdays.
                  </p>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleScheduleSubmit}
                    disabled={isScheduling}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  >
                    {isScheduling ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Scheduling...</span>
                      </>
                    ) : (
                      <>
                        <CalendarDays className="w-4 h-4" />
                        <span>Schedule</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


