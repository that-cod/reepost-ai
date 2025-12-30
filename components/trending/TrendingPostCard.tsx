"use client";

import { Heart, MessageCircle, Repeat2, Eye, Bookmark, Copy, ExternalLink } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import toast from "react-hot-toast";

interface TrendingPost {
    id: string;
    content: string;
    mediaUrl?: string;
    mediaType: "IMAGE" | "VIDEO" | "DOCUMENT" | "NONE";
    likes: number;
    comments: number;
    reposts: number;
    views: number;
    outlierIndex: number;
    publishedDate: string;
    postUrl?: string | null;
    linkedInPostId?: string | null;
    creator: {
        id: string;
        name: string;
        image?: string;
        occupation?: string;
        headline?: string;
    };
}

interface TrendingPostCardProps {
    post: TrendingPost;
}

export default function TrendingPostCard({ post }: TrendingPostCardProps) {
    const [isSaved, setIsSaved] = useState(false);
    const [showFullContent, setShowFullContent] = useState(false);

    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    };

    const getMediaTypeLabel = () => {
        switch (post.mediaType) {
            case "IMAGE":
                return "image";
            case "VIDEO":
                return "video";
            case "DOCUMENT":
                return "document";
            default:
                return null;
        }
    };

    const getOutlierBadgeColor = (index: number) => {
        if (index >= 80) return "bg-primary text-white"; // High virality - green
        if (index >= 60) return "bg-accent text-white"; // Good virality - accent green
        if (index >= 40) return "bg-orange-500 text-white"; // Medium - orange
        return "bg-gray-500 text-white"; // Low
    };

    const formatOutlierIndex = (index: number) => {
        // Convert 0-100 scale to multiplier format (like 125.62x)
        const multiplier = (index / 10).toFixed(1);
        return `${multiplier}x`;
    };

    const handleCopyContent = () => {
        navigator.clipboard.writeText(post.content);
        toast.success("Content copied to clipboard!");
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
        toast.success(isSaved ? "Removed from saved" : "Saved to collection!");
    };

    const handleViewPost = () => {
        if (post.postUrl) {
            window.open(post.postUrl, '_blank');
        }
    };

    const truncateContent = (text: string, maxLength: number = 280) => {
        if (text.length <= maxLength || showFullContent) return text;
        return text.substring(0, maxLength) + "...";
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 flex items-start gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex-shrink-0">
                    {post.creator.image ? (
                        <Image
                            src={post.creator.image}
                            alt={post.creator.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                            {post.creator.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{post.creator.name}</h3>
                            {(post.creator.occupation || post.creator.headline) && (
                                <p className="text-sm text-gray-600 truncate">{post.creator.occupation || post.creator.headline}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(post.publishedDate), { addSuffix: true })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {getMediaTypeLabel() && (
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
                                    {getMediaTypeLabel()}
                                </span>
                            )}
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${getOutlierBadgeColor(post.outlierIndex)}`}>
                                {formatOutlierIndex(post.outlierIndex)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-3 flex-1">
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                    {truncateContent(post.content)}
                </p>
                {post.content.length > 280 && (
                    <button
                        onClick={() => setShowFullContent(!showFullContent)}
                        className="text-primary text-sm font-medium mt-2 hover:underline"
                    >
                        {showFullContent ? "...less" : "...more"}
                    </button>
                )}
            </div>

            {/* Media */}
            {post.mediaUrl && post.mediaType !== "NONE" && (
                <div className="px-4 pb-3">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
                        {post.mediaType === "IMAGE" && (
                            <Image
                                src={post.mediaUrl}
                                alt="Post media"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-500"
                            />
                        )}
                        {post.mediaType === "VIDEO" && (
                            <>
                                <Image
                                    src={post.mediaUrl}
                                    alt="Video thumbnail"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-primary border-b-[10px] border-b-transparent ml-1"></div>
                                    </div>
                                </div>
                            </>
                        )}
                        {post.mediaType === "DOCUMENT" && (
                            <>
                                <Image
                                    src={post.mediaUrl}
                                    alt="Document preview"
                                    fill
                                    className="object-cover opacity-40"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-14 h-14 mx-auto mb-2 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-gray-700 font-medium">Document</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Engagement Stats with Emoji Reactions */}
            <div className="px-4 py-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                        <span className="text-base">👍</span>
                        <span className="text-base">❤️</span>
                        <span className="text-base">💡</span>
                        <span className="text-sm font-medium text-gray-700 ml-1">{formatNumber(post.likes)} Likes</span>
                    </div>
                    <div className="text-sm text-gray-600">
                        {formatNumber(post.comments)} Comments · {formatNumber(post.reposts)} Reposts
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleViewPost}
                            disabled={!post.postUrl}
                            className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Eye className="w-4 h-4" />
                            <span className="font-medium">View</span>
                        </button>
                        <button
                            onClick={handleCopyContent}
                            className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                            <Copy className="w-4 h-4" />
                            <span className="font-medium">Copy</span>
                        </button>
                        <button
                            onClick={handleSave}
                            className={`text-sm transition-colors flex items-center gap-1.5 ${
                                isSaved ? 'text-primary' : 'text-gray-600 hover:text-primary'
                            }`}
                        >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-primary' : ''}`} />
                            <span className="font-medium">Save</span>
                        </button>
                    </div>
                    {post.postUrl && (
                        <button
                            onClick={handleViewPost}
                            className="text-sm text-primary hover:text-primary-dark transition-colors flex items-center gap-1.5 font-medium"
                        >
                            <span>Repurpose</span>
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
