"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Upload, Mic, FileText, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import ToneModal from "@/components/modals/ToneModal";
import PostPreview from "@/components/post/PostPreview";

const suggestedTopics = [
  "The future of remote work and digital nomadism",
  "Building authentic personal brands on social media",
  "AI's impact on creative industries",
  "Sustainable business practices in tech",
  "The psychology of productive morning routines",
  "Leadership lessons from startup failures",
];

export default function GeneratePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"your-topic" | "suggested">("your-topic");
  const [topic, setTopic] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTone, setSelectedTone] = useState<string>("Narrative");
  const [toneIntensity, setToneIntensity] = useState(50);
  const [showToneModal, setShowToneModal] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

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
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
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
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                Choose from trending topics to get started quickly
              </p>
              <div className="grid gap-3">
                {suggestedTopics.map((suggestedTopic, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedTopic(suggestedTopic)}
                    className="card p-4 text-left hover:scale-[1.02] transition-transform"
                  >
                    <p className="text-text-primary font-medium">
                      {suggestedTopic}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:sticky lg:top-24 h-fit">
          <PostPreview content={generatedPost} isGenerating={isGenerating} />
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
