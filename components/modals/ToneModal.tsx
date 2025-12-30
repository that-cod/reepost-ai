"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";

const tones = [
  {
    name: "Narrative",
    emoji: "📖",
    description: "Tell compelling stories with emotional depth",
    color: "bg-blue-100 text-blue-600 hover:bg-blue-200",
  },
  {
    name: "Visionary",
    emoji: "🔮",
    description: "Paint bold futures and inspire innovation",
    color: "bg-purple-100 text-purple-600 hover:bg-purple-200",
  },
  {
    name: "Empathic",
    emoji: "💙",
    description: "Connect deeply with authentic vulnerability",
    color: "bg-teal-100 text-teal-600 hover:bg-teal-200",
  },
  {
    name: "Witty",
    emoji: "😄",
    description: "Entertain with clever humor and wordplay",
    color: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200",
  },
  {
    name: "Contrarian",
    emoji: "🎯",
    description: "Challenge assumptions with fresh perspectives",
    color: "bg-red-100 text-red-600 hover:bg-red-200",
  },
  {
    name: "Leadership",
    emoji: "👑",
    description: "Guide with authority and strategic insight",
    color: "bg-indigo-100 text-indigo-600 hover:bg-indigo-200",
  },
  {
    name: "Educational",
    emoji: "🎓",
    description: "Teach clearly with structured insights",
    color: "bg-green-100 text-green-600 hover:bg-green-200",
  },
  {
    name: "Motivational",
    emoji: "🚀",
    description: "Inspire action with energetic optimism",
    color: "bg-orange-100 text-orange-600 hover:bg-orange-200",
  },
  {
    name: "Analytical",
    emoji: "📊",
    description: "Break down complex ideas with data",
    color: "bg-slate-100 text-slate-600 hover:bg-slate-200",
  },
  {
    name: "Provocative",
    emoji: "⚡",
    description: "Spark debate with bold statements",
    color: "bg-light-green text-primary hover:bg-pastel-green",
  },
];

interface ToneModalProps {
  selectedTone: string;
  onSelectTone: (tone: string) => void;
  onClose: () => void;
}

export default function ToneModal({
  selectedTone,
  onSelectTone,
  onClose,
}: ToneModalProps) {
  const [customTone, setCustomTone] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSelectTone = (tone: string) => {
    onSelectTone(tone);
  };

  const handleCustomTone = () => {
    if (customTone.trim()) {
      onSelectTone(customTone.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Choose Your Voice Tone
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Select a tone that matches your message style
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-card-bg rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Tone Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {tones.map((tone) => (
              <button
                key={tone.name}
                onClick={() => handleSelectTone(tone.name)}
                className={`card p-4 text-left transition-all hover:scale-105 ${
                  selectedTone === tone.name
                    ? "ring-2 ring-primary shadow-medium"
                    : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-3xl">{tone.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary mb-1">
                      {tone.name}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {tone.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Tone */}
          <div className="border-t border-border pt-6">
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="flex items-center justify-between w-full text-left"
            >
              <div>
                <h3 className="font-semibold text-text-primary">
                  ✨ Custom Tone
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  Define your own unique voice
                </p>
              </div>
              <span className="text-text-secondary">
                {showCustom ? "−" : "+"}
              </span>
            </button>

            {showCustom && (
              <div className="mt-4 space-y-3 animate-slide-up">
                <input
                  type="text"
                  value={customTone}
                  onChange={(e) => setCustomTone(e.target.value)}
                  placeholder="e.g., Poetic, Technical, Casual..."
                  className="input-field"
                />
                <textarea
                  placeholder="Describe how you want this tone to sound (optional)"
                  className="input-field resize-none h-20"
                />
                <button
                  onClick={handleCustomTone}
                  disabled={!customTone.trim()}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply Custom Tone
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
