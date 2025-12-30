"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Plus, X, ChevronLeft, ChevronRight, Save, Edit, Trash2, Copy } from "lucide-react";
import toast from "react-hot-toast";

interface ScheduledPost {
  id: string;
  content: string;
  scheduledFor: string;
  status: string;
  createdAt: string;
}

type ViewType = 'month' | 'week' | 'day';

export default function CalendarPage() {
  const [view, setView] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedDate, setEditedDate] = useState("");
  const [editedTime, setEditedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");

  useEffect(() => {
    fetchScheduledPosts();
  }, [currentDate, view]);

  const fetchScheduledPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/posts');
      const data = await response.json();

      if (response.ok && data.success) {
        setScheduledPosts(data.posts);
      } else {
        toast.error("Failed to load scheduled posts");
      }
    } catch (error) {
      console.error("Error fetching scheduled posts:", error);
      toast.error("Failed to load calendar");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPost = async () => {
    if (!selectedDate || !newPostContent.trim()) {
      toast.error("Please select a date and enter content");
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
          content: newPostContent,
          scheduledFor: scheduledDateTime.toISOString(),
        }),
      });

      if (response.ok) {
        toast.success("Post scheduled successfully");
        setShowAddModal(false);
        setNewPostContent("");
        setSelectedDate(null);
        fetchScheduledPosts();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to schedule post");
      }
    } catch (error) {
      console.error("Error scheduling post:", error);
      toast.error("Failed to schedule post");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this scheduled post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/calendar/posts?postId=${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Post removed from calendar");
        setShowViewModal(false);
        setSelectedPost(null);
        fetchScheduledPosts();
      } else {
        toast.error("Failed to remove post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to remove post");
    }
  };

  const handleViewPost = (post: ScheduledPost) => {
    setSelectedPost(post);
    setEditedContent(post.content);

    const scheduledDate = new Date(post.scheduledFor);
    setEditedDate(scheduledDate.toISOString().split('T')[0]);
    setEditedTime(scheduledDate.toTimeString().substring(0, 5));

    setIsEditingPost(false);
    setShowViewModal(true);
  };

  const handleCopyPost = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Post content copied to clipboard");
  };

  const handleSaveEdit = async () => {
    if (!selectedPost || !editedContent.trim()) {
      toast.error("Please enter content");
      return;
    }

    try {
      const scheduledDateTime = new Date(editedDate);
      const [hours, minutes] = editedTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

      const response = await fetch('/api/calendar/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: selectedPost.id,
          content: editedContent,
          scheduledFor: scheduledDateTime.toISOString(),
        }),
      });

      if (response.ok) {
        toast.success("Post updated successfully");
        setIsEditingPost(false);
        setShowViewModal(false);
        setSelectedPost(null);
        fetchScheduledPosts();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
    }
  };

  const handleCancelEdit = () => {
    if (selectedPost) {
      setEditedContent(selectedPost.content);
      const scheduledDate = new Date(selectedPost.scheduledFor);
      setEditedDate(scheduledDate.toISOString().split('T')[0]);
      setEditedTime(scheduledDate.toTimeString().substring(0, 5));
    }
    setIsEditingPost(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduledFor);
      return (
        postDate.getDate() === date.getDate() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 1);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
      return newDate;
    });
  };

  const renderMonthView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Add day names
    const dayHeaders = dayNames.map(day => (
      <div key={day} className="text-center font-semibold text-gray-700 py-2">
        {day}
      </div>
    ));

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-50 border border-gray-200"></div>);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const postsForDay = getPostsForDate(date);
      const isToday =
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`min-h-[120px] border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
          }`}
          onClick={() => {
            setSelectedDate(date);
            setShowAddModal(true);
          }}
        >
          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {postsForDay.slice(0, 3).map(post => (
              <div
                key={post.id}
                className="text-xs bg-gradient-to-r from-primary to-accent text-white rounded px-2 py-1 truncate cursor-pointer hover:from-primary-dark hover:to-primary transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewPost(post);
                }}
              >
                {new Date(post.scheduledFor).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            ))}
            {postsForDay.length > 3 && (
              <div className="text-xs text-gray-600 font-medium">
                +{postsForDay.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-7 gap-0">
          {dayHeaders}
          {days}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map(date => {
            const postsForDay = getPostsForDate(date);
            const isToday =
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear();

            return (
              <div key={date.toISOString()} className="space-y-2">
                <div className={`text-center p-3 rounded-xl ${isToday ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <div className="text-xs text-gray-600">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-2xl font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                    {date.getDate()}
                  </div>
                </div>
                <div className="space-y-2">
                  {postsForDay.map(post => (
                    <div
                      key={post.id}
                      className="bg-gradient-to-r from-primary to-accent text-white rounded-xl p-3 cursor-pointer hover:from-primary-dark hover:to-primary transition-all"
                      onClick={() => handleViewPost(post)}
                    >
                      <div className="text-xs font-medium mb-1">
                        {new Date(post.scheduledFor).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-xs line-clamp-2">{post.content}</div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setSelectedDate(date);
                      setShowAddModal(true);
                    }}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition-colors text-sm"
                  >
                    + Add Post
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const postsForDay = getPostsForDate(currentDate).sort((a, b) =>
      new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
    );

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          <p className="text-gray-600 mt-1">{postsForDay.length} scheduled posts</p>
        </div>

        <div className="space-y-4">
          {postsForDay.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No posts scheduled for this day</p>
              <button
                onClick={() => {
                  setSelectedDate(currentDate);
                  setShowAddModal(true);
                }}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:from-primary-dark hover:to-primary transition-all"
              >
                Schedule a Post
              </button>
            </div>
          ) : (
            postsForDay.map(post => (
              <div
                key={post.id}
                className="border-l-4 border-primary bg-gradient-to-r from-light-green to-pastel-green rounded-xl p-4 cursor-pointer hover:shadow-md transition-all"
                onClick={() => handleViewPost(post)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-gray-900">
                      {new Date(post.scheduledFor).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost(post.id);
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">{post.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Content Calendar</h1>
              <p className="text-lg text-gray-600">
                Schedule and manage your LinkedIn content publishing timeline
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedDate(new Date());
                setShowAddModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:from-primary-dark hover:to-primary transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Schedule Post
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            {/* View Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('month')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  view === 'month'
                    ? 'bg-gradient-to-r from-primary to-accent text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  view === 'week'
                    ? 'bg-gradient-to-r from-primary to-accent text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  view === 'day'
                    ? 'bg-gradient-to-r from-primary to-accent text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Day
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
              >
                Today
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (view === 'month') navigateMonth('prev');
                    else if (view === 'week') navigateWeek('prev');
                    else navigateDay('prev');
                  }}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <div className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                  {view === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  {view === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  {view === 'day' && currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <button
                  onClick={() => {
                    if (view === 'month') navigateMonth('next');
                    else if (view === 'week') navigateWeek('next');
                    else navigateDay('next');
                  }}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
          </>
        )}
      </div>

      {/* Add/Schedule Post Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Schedule Post</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewPostContent("");
                  setSelectedDate(null);
                }}
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
                  value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
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

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Content
                </label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Write your LinkedIn post content here..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewPostContent("");
                    setSelectedDate(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPost}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:from-primary-dark hover:to-primary transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Schedule Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Post Modal */}
      {showViewModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditingPost ? "Edit Scheduled Post" : "Scheduled Post"}
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPost(null);
                  setIsEditingPost(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Post Status Badge */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gradient-to-r from-primary to-accent text-white rounded-full text-sm font-medium">
                  {selectedPost.status}
                </span>
                <span className="text-sm text-gray-600">
                  Created {new Date(selectedPost.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Date
                  </label>
                  {isEditingPost ? (
                    <input
                      type="date"
                      value={editedDate}
                      onChange={(e) => setEditedDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  ) : (
                    <div className="px-4 py-2 bg-gray-50 rounded-xl text-gray-900">
                      {new Date(selectedPost.scheduledFor).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Time
                  </label>
                  {isEditingPost ? (
                    <input
                      type="time"
                      value={editedTime}
                      onChange={(e) => setEditedTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  ) : (
                    <div className="px-4 py-2 bg-gray-50 rounded-xl text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      {new Date(selectedPost.scheduledFor).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Content
                </label>
                {isEditingPost ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    placeholder="Write your LinkedIn post content here..."
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
                  </div>
                )}
              </div>

              {/* Character Count */}
              <div className="text-sm text-gray-600">
                {isEditingPost ? editedContent.length : selectedPost.content.length} characters
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {isEditingPost ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:from-primary-dark hover:to-primary transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleCopyPost(selectedPost.content)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Copy className="w-5 h-5" />
                      Copy
                    </button>
                    <button
                      onClick={() => setIsEditingPost(true)}
                      className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit className="w-5 h-5" />
                      Edit Post
                    </button>
                    <button
                      onClick={() => handleDeletePost(selectedPost.id)}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
