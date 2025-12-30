"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Sliders } from "lucide-react";

interface AdvancedFiltersModalProps {
    isOpen: boolean;
    onClose: () => void;
    filters: AdvancedFilters;
    onApply: (filters: AdvancedFilters) => void;
}

export interface AdvancedFilters {
    dateRange: {
        start: string;
        end: string;
    } | null;
    outlierIndexMin: number;
    outlierIndexMax: number;
    mediaType: "all" | "image" | "video" | "document";
    likesMin: number | null;
    likesMax: number | null;
    commentsMin: number | null;
    commentsMax: number | null;
    repostsMin: number | null;
    repostsMax: number | null;
    creatorFollowersMin: number | null;
    creatorFollowersMax: number | null;
    excludeKeywords: string[];
}

export default function AdvancedFiltersModal({
    isOpen,
    onClose,
    filters,
    onApply,
}: AdvancedFiltersModalProps) {
    const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);
    const [keywordInput, setKeywordInput] = useState("");

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters, isOpen]);

    if (!isOpen) return null;

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters: AdvancedFilters = {
            dateRange: null,
            outlierIndexMin: 0,
            outlierIndexMax: 100,
            mediaType: "all",
            likesMin: null,
            likesMax: null,
            commentsMin: null,
            commentsMax: null,
            repostsMin: null,
            repostsMax: null,
            creatorFollowersMin: null,
            creatorFollowersMax: null,
            excludeKeywords: [],
        };
        setLocalFilters(resetFilters);
    };

    const addKeyword = () => {
        if (keywordInput.trim() && !localFilters.excludeKeywords.includes(keywordInput.trim())) {
            setLocalFilters({
                ...localFilters,
                excludeKeywords: [...localFilters.excludeKeywords, keywordInput.trim()],
            });
            setKeywordInput("");
        }
    };

    const removeKeyword = (keyword: string) => {
        setLocalFilters({
            ...localFilters,
            excludeKeywords: localFilters.excludeKeywords.filter((k) => k !== keyword),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#141937] rounded-2xl shadow-2xl border border-gray-800 max-w-2xl w-full my-8">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <Sliders className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Advanced Filters</h2>
                            <p className="text-sm text-gray-400 mt-0.5">Fine-tune your search results</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Date Range */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <label className="text-sm font-semibold text-white">Date Range</label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">From</label>
                                <input
                                    type="date"
                                    value={localFilters.dateRange?.start || ""}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            dateRange: {
                                                start: e.target.value,
                                                end: localFilters.dateRange?.end || "",
                                            },
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-[#0a0e27] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">To</label>
                                <input
                                    type="date"
                                    value={localFilters.dateRange?.end || ""}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            dateRange: {
                                                start: localFilters.dateRange?.start || "",
                                                end: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-[#0a0e27] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Outlier Index */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-white flex items-center gap-2">
                            <span className="text-primary">#</span>
                            Outlier Index
                        </label>
                        <div className="space-y-2">
                            <p className="text-xs text-gray-400">
                                Minimum outlier index: {localFilters.outlierIndexMin}
                            </p>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={localFilters.outlierIndexMin}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        outlierIndexMin: parseInt(e.target.value),
                                    })
                                }
                                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">From</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={localFilters.outlierIndexMin}
                                        onChange={(e) =>
                                            setLocalFilters({
                                                ...localFilters,
                                                outlierIndexMin: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-[#0a0e27] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">To</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={localFilters.outlierIndexMax}
                                        onChange={(e) =>
                                            setLocalFilters({
                                                ...localFilters,
                                                outlierIndexMax: parseInt(e.target.value) || 100,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-[#0a0e27] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Media Type */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-white flex items-center gap-2">
                            <span className="text-primary">📷</span>
                            Media Type
                        </label>
                        <select
                            value={localFilters.mediaType}
                            onChange={(e) =>
                                setLocalFilters({
                                    ...localFilters,
                                    mediaType: e.target.value as any,
                                })
                            }
                            className="w-full px-3 py-2.5 bg-[#0a0e27] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="all">All media types</option>
                            <option value="image">Image only</option>
                            <option value="video">Video only</option>
                            <option value="document">Document only</option>
                        </select>
                    </div>

                    {/* Likes Range */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-white flex items-center gap-2">
                            <span className="text-primary">👍</span>
                            Likes Range
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Min"
                                value={localFilters.likesMin || ""}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        likesMin: e.target.value ? parseInt(e.target.value) : null,
                                    })
                                }
                                className="px-3 py-2 bg-[#0a0e27] border border-gray-800 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                value={localFilters.likesMax || ""}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        likesMax: e.target.value ? parseInt(e.target.value) : null,
                                    })
                                }
                                className="px-3 py-2 bg-[#0a0e27] border border-gray-800 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    {/* Comments Range */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-white flex items-center gap-2">
                            <span className="text-primary">💬</span>
                            Comments Range
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Min"
                                value={localFilters.commentsMin || ""}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        commentsMin: e.target.value ? parseInt(e.target.value) : null,
                                    })
                                }
                                className="px-3 py-2 bg-[#0a0e27] border border-gray-800 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                value={localFilters.commentsMax || ""}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        commentsMax: e.target.value ? parseInt(e.target.value) : null,
                                    })
                                }
                                className="px-3 py-2 bg-[#0a0e27] border border-gray-800 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    {/* Reposts Range */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-white flex items-center gap-2">
                            <span className="text-primary">🔁</span>
                            Reposts Range
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Min"
                                value={localFilters.repostsMin || ""}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        repostsMin: e.target.value ? parseInt(e.target.value) : null,
                                    })
                                }
                                className="px-3 py-2 bg-[#0a0e27] border border-gray-800 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                value={localFilters.repostsMax || ""}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        repostsMax: e.target.value ? parseInt(e.target.value) : null,
                                    })
                                }
                                className="px-3 py-2 bg-[#0a0e27] border border-gray-800 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    {/* Exclude Keywords */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-white flex items-center gap-2">
                            <span className="text-primary">🚫</span>
                            Exclude Keywords
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                                placeholder="Type keyword and press Enter"
                                className="flex-1 px-3 py-2 bg-[#0a0e27] border border-gray-800 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                                onClick={addKeyword}
                                className="px-4 py-2 bg-primary/20 text-primary font-medium rounded-lg hover:bg-primary/30 transition-all text-sm"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {localFilters.excludeKeywords.map((keyword) => (
                                <span
                                    key={keyword}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0a0e27] border border-gray-800 rounded-lg text-sm text-white"
                                >
                                    {keyword}
                                    <button
                                        onClick={() => removeKeyword(keyword)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-800">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors"
                    >
                        Reset All
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
