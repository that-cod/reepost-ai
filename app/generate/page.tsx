"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Upload, Mic, FileText, Wand2, RefreshCw, Bookmark, BookmarkCheck, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import ToneModal from "@/components/modals/ToneModal";
import PostPreview from "@/components/post/PostPreview";

interface SavedTopic {
  id: string;
  topic: string;
  createdAt: string;
}

export default function GeneratePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"your-topic" | "suggested" | "saved">("your-topic");
  const [topic, setTopic] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTone, setSelectedTone] = useState<string>("Professional");
  const [toneIntensity, setToneIntensity] = useState(50);
  const [showToneModal, setShowToneModal] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Dynamic topics state
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [savedTopics, setSavedTopics] = useState<SavedTopic[]>([]);
  const [isLoadingSavedTopics, setIsLoadingSavedTopics] = useState(false);

  // Load user settings and topics on mount
  useEffect(() => {
    if (status === "authenticated") {
      loadUserSettings();
      loadSuggestedTopics();
      loadSavedTopics();
    } else if (status === "unauthenticated") {
      setIsLoadingSettings(false);
    }
  }, [status]);

  const loadUserSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const settings = await response.json();

        // Map tone from database enum to display value
        const toneMap: Record<string, string> = {
          PROFESSIONAL: "Professional",
          CASUAL: "Casual",
          BOLD: "Bold",
          INSPIRATIONAL: "Inspirational",
          EDUCATIONAL: "Educational",
          ENTHUSIASTIC: "Enthusiastic",
          THOUGHTFUL: "Thoughtful",
          HUMOROUS: "Humorous",
        };
        if (settings.defaultTone && toneMap[settings.defaultTone]) {
          setSelectedTone(toneMap[settings.defaultTone]);
        }

        // Map intensity from database enum to slider value (0-100)
        const intensityMap: Record<string, number> = {
          LOW: 25,
          MEDIUM: 50,
          HIGH: 75,
          EXTREME: 100,
        };
        if (settings.defaultIntensity && intensityMap[settings.defaultIntensity]) {
          setToneIntensity(intensityMap[settings.defaultIntensity]);
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      // Continue with defaults if settings fail to load
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`File uploaded: ${file.name}`);
    }
  };

  const handleGeneratePost = async () => {
    // Check if user is authenticated
    if (status !== "authenticated") {
      toast.error("Please sign in to generate posts");
      router.push("/auth/signin?callbackUrl=/");
      return;
    }

    if (topic.trim().split(" ").length < 5) {
      toast.error("Please enter at least 5 words for your topic");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
          tone: selectedTone.toUpperCase(),
          length: toneIntensity < 33 ? "short" : toneIntensity < 66 ? "medium" : "long",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to generate post");
      }

      const data = await response.json();

      if (data.success && data.post) {
        setGeneratedPost(data.post);
        toast.success("Post generated successfully!");
      } else {
        throw new Error("No content generated");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate post");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestedTopic = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
    setActiveTab("your-topic");
    toast.success("Topic selected!");
  };

  const loadSuggestedTopics = async () => {
    try {
      setIsLoadingTopics(true);
      const response = await fetch("/api/topics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 6 }),
      });

      if (!response.ok) {
        throw new Error("Failed to load topics");
      }

      const data = await response.json();
      if (data.success && data.topics) {
        setSuggestedTopics(data.topics);
      }
    } catch (error) {
      console.error("Failed to load suggested topics:", error);
      // Set fallback topics if API fails
      setSuggestedTopics([
        "The future of remote work and digital nomadism",
        "Building authentic personal brands on social media",
        "AI's impact on creative industries",
        "Sustainable business practices in tech",
        "The psychology of productive morning routines",
        "Leadership lessons from startup failures",
      ]);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const loadSavedTopics = async () => {
    try {
      setIsLoadingSavedTopics(true);
      const response = await fetch("/api/topics/saved");

      if (!response.ok) {
        throw new Error("Failed to load saved topics");
      }

      const data = await response.json();
      if (data.success && data.topics) {
        setSavedTopics(data.topics);
      }
    } catch (error) {
      console.error("Failed to load saved topics:", error);
    } finally {
      setIsLoadingSavedTopics(false);
    }
  };

  const handleRefreshTopics = async () => {
    toast.success("Refreshing topics...");
    await loadSuggestedTopics();
    toast.success("Topics refreshed!");
  };

  const handleSaveTopic = async (topicToSave: string) => {
    try {
      const response = await fetch("/api/topics/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicToSave }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save topic");
      }

      const data = await response.json();
      if (data.success && data.topic) {
        setSavedTopics([data.topic, ...savedTopics]);
        toast.success("Topic saved!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save topic");
    }
  };

  const handleDeleteSavedTopic = async (topicId: string) => {
    try {
      const response = await fetch(`/api/topics/saved/${topicId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete topic");
      }

      setSavedTopics(savedTopics.filter(t => t.id !== topicId));
      toast.success("Topic deleted!");
    } catch (error) {
      toast.error("Failed to delete topic");
    }
  };

  const isTopicSaved = (topicText: string) => {
    return savedTopics.some(t => t.topic === topicText);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Generate Post
        </h1>
        <p className="text-text-secondary">
          Create engaging content with AI-powered assistance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Input */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex space-x-6 border-b border-border">
            <button
              onClick={() => setActiveTab("your-topic")}
              className={`pb-3 px-1 transition-all ${activeTab === "your-topic" ? "tab-active" : "tab-inactive"
                }`}
            >
              Your Topic
            </button>
            <button
              onClick={() => setActiveTab("suggested")}
              className={`pb-3 px-1 transition-all ${activeTab === "suggested" ? "tab-active" : "tab-inactive"
                }`}
            >
              Suggested Topics
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`pb-3 px-1 transition-all ${activeTab === "saved" ? "tab-active" : "tab-inactive"
                }`}
            >
              Saved Topics {savedTopics.length > 0 && `(${savedTopics.length})`}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "your-topic" ? (
            <div className="space-y-6">
              {/* File Upload */}
              <div className="card p-6">
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Upload Media (Optional)
                </label>
                <div className="border-2 border-dashed border-border rounded-card p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept="image/*,audio/*,.pdf,.doc,.docx"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center space-y-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {selectedFile
                            ? selectedFile.name
                            : "Drop your file here or click to browse"}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          Supports images, audio, and documents
                        </p>
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <FileText className="w-4 h-4 text-text-secondary" />
                        <Mic className="w-4 h-4 text-text-secondary" />
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Topic Input */}
              <div className="card p-6">
                <label className="block text-sm font-medium text-text-primary mb-3">
                  What do you want to talk about?
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter your topic or idea (minimum 5 words)..."
                  className="input-field resize-none h-32"
                />
                <p className="text-xs text-text-secondary mt-2">
                  {topic.trim().split(" ").filter(Boolean).length} / 5 words minimum
                </p>
              </div>

              {/* Voice Tone Selector */}
              <div className="card p-6">
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Voice Tone
                </label>
                <button
                  onClick={() => setShowToneModal(true)}
                  className="w-full btn-secondary flex items-center justify-between"
                >
                  <span>{selectedTone}</span>
                  <Wand2 className="w-4 h-4" />
                </button>
                <div className="mt-4">
                  <label className="block text-xs text-text-secondary mb-2">
                    Tone Intensity: {toneIntensity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={toneIntensity}
                    onChange={(e) => setToneIntensity(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGeneratePost}
                disabled={isGenerating}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>Generate Post</span>
                  </>
                )}
              </button>
            </div>
          ) : activeTab === "suggested" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-secondary">
                  Choose from AI-generated trending topics
                </p>
                <button
                  onClick={handleRefreshTopics}
                  disabled={isLoadingTopics}
                  className="btn-secondary flex items-center space-x-2 text-sm"
                  title="Refresh topics"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingTopics ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingTopics ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid gap-3">
                  {suggestedTopics.map((suggestedTopic, index) => (
                    <div
                      key={index}
                      className="card p-4 hover:shadow-medium transition-shadow group"
                    >
                      <div className="flex items-start justify-between space-x-3">
                        <button
                          onClick={() => handleSuggestedTopic(suggestedTopic)}
                          className="flex-1 text-left"
                        >
                          <p className="text-text-primary font-medium group-hover:text-primary transition-colors">
                            {suggestedTopic}
                          </p>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isTopicSaved(suggestedTopic)) {
                              toast.info("Topic already saved");
                            } else {
                              handleSaveTopic(suggestedTopic);
                            }
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isTopicSaved(suggestedTopic)
                              ? "text-primary bg-primary/10"
                              : "text-text-secondary hover:text-primary hover:bg-primary/10"
                          }`}
                          title={isTopicSaved(suggestedTopic) ? "Already saved" : "Save topic"}
                        >
                          {isTopicSaved(suggestedTopic) ? (
                            <BookmarkCheck className="w-5 h-5" />
                          ) : (
                            <Bookmark className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-secondary">
                  Your saved topics for quick access
                </p>
                <span className="text-xs text-text-secondary">
                  {savedTopics.length} saved
                </span>
              </div>

              {isLoadingSavedTopics ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : savedTopics.length === 0 ? (
                <div className="card p-8 text-center">
                  <Bookmark className="w-12 h-12 text-text-secondary mx-auto mb-3 opacity-50" />
                  <p className="text-text-secondary mb-2">No saved topics yet</p>
                  <p className="text-xs text-text-secondary">
                    Save topics from the Suggested Topics tab
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {savedTopics.map((savedTopic) => (
                    <div
                      key={savedTopic.id}
                      className="card p-4 hover:shadow-medium transition-shadow group"
                    >
                      <div className="flex items-start justify-between space-x-3">
                        <button
                          onClick={() => handleSuggestedTopic(savedTopic.topic)}
                          className="flex-1 text-left"
                        >
                          <p className="text-text-primary font-medium group-hover:text-primary transition-colors">
                            {savedTopic.topic}
                          </p>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Remove this saved topic?")) {
                              handleDeleteSavedTopic(savedTopic.id);
                            }
                          }}
                          className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete saved topic"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:sticky lg:top-24 h-fit">
          <PostPreview
            content={generatedPost}
            isGenerating={isGenerating}
            onContentChange={(newContent) => setGeneratedPost(newContent)}
          />
        </div>
      </div>

      {/* Tone Modal */}
      {showToneModal && (
        <ToneModal
          selectedTone={selectedTone}
          onSelectTone={(tone) => {
            setSelectedTone(tone);
            setShowToneModal(false);
            toast.success(`Tone set to ${tone}`);
          }}
          onClose={() => setShowToneModal(false)}
        />
      )}
    </div>
  );
}
