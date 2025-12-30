"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Trash2, Calendar, Filter, Edit, Check, X, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Post {
  id: string;
  content: string;
  topic: string;
  status: string;
  createdAt: string;
  scheduledFor?: string;
}

export default function MyPostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/my-posts");
    } else if (status === "authenticated") {
      fetchPosts();
    }
  }, [status, router]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/posts?limit=100");

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      toast.success("Post deleted successfully");
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete post");
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
      setPosts(posts.map(p =>
        p.id === postId
          ? { ...p, content: editedContent }
          : p
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

  const filteredPosts = filterStatus === "ALL"
    ? posts
    : posts.filter(p => p.status === filterStatus);

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
        <h1 className="text-3xl font-bold text-text-primary mb-2">My Posts</h1>
        <p className="text-text-secondary">
          Manage all your generated LinkedIn posts
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-text-secondary" />
          <span className="text-sm font-medium text-text-primary">Filter:</span>
          <div className="flex space-x-2">
            {["ALL", "DRAFT", "SCHEDULED", "PUBLISHED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === status
                    ? "bg-primary text-white"
                    : "bg-card-bg text-text-secondary hover:bg-gray-200"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-2xl font-bold text-text-primary">{posts.length}</div>
          <div className="text-sm text-text-secondary">Total Posts</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-text-primary">
            {posts.filter(p => p.status === "DRAFT").length}
          </div>
          <div className="text-sm text-text-secondary">Drafts</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-text-primary">
            {posts.filter(p => p.status === "SCHEDULED").length}
          </div>
          <div className="text-sm text-text-secondary">Scheduled</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-text-primary">
            {posts.filter(p => p.status === "PUBLISHED").length}
          </div>
          <div className="text-sm text-text-secondary">Published</div>
        </div>
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            {filterStatus === "ALL" ? "No posts yet" : `No ${filterStatus.toLowerCase()} posts`}
          </h3>
          <p className="text-text-secondary mb-6">
            {filterStatus === "ALL"
              ? "Generate your first post to get started"
              : `You don't have any ${filterStatus.toLowerCase()} posts yet`
            }
          </p>
          {filterStatus === "ALL" && (
            <button
              onClick={() => router.push("/")}
              className="btn-primary"
            >
              Generate Post
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="card p-6 hover:shadow-medium transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${post.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : post.status === "SCHEDULED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                      {post.status}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {format(new Date(post.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {post.topic}
                  </h3>
                </div>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete post"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>

              <div className="bg-card-bg p-4 rounded-lg mb-4">
                {editingPostId === post.id ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full min-h-[200px] p-4 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary resize-none"
                  />
                ) : (
                  <p className="text-text-primary whitespace-pre-wrap line-clamp-4">
                    {post.content}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  {post.scheduledFor && (
                    <div className="flex items-center text-sm text-text-secondary">
                      <Calendar className="w-4 h-4 mr-2" />
                      Scheduled for {format(new Date(post.scheduledFor), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {editingPostId === post.id ? (
                    <>
                      <button
                        onClick={handleCancelEdit}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={() => handleSaveEdit(post.id)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleCopy(post.content)}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => handleEdit(post.id, post.content)}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
