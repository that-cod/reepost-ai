"use client";

import { MapPin, Briefcase, X, Plus } from "lucide-react";
import Image from "next/image";

interface Creator {
    id: string;
    name: string;
    image?: string;
    bio?: string;
    occupation?: string;
    location?: string;
    industry?: string;
    followerCount: number;
    isFollowing: boolean;
}

interface CreatorCardProps {
    creator: Creator;
    onToggleFollow: (id: string) => void;
}

export default function CreatorCard({ creator, onToggleFollow }: CreatorCardProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className={`bg-white rounded-xl border-2 p-5 transition-all hover:shadow-lg ${creator.isFollowing ? "border-primary" : "border-border"
            }`}>
            {/* Avatar and Name */}
            <div className="flex items-start gap-3 mb-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-primary flex-shrink-0">
                    {creator.image ? (
                        <Image
                            src={creator.image}
                            alt={creator.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                            {getInitials(creator.name)}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text-primary truncate">{creator.name}</h3>
                    <p className="text-sm text-text-secondary line-clamp-2 mt-0.5">
                        {creator.bio || creator.occupation}
                    </p>
                </div>
            </div>

            {/* Location */}
            {creator.location && (
                <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{creator.location}</span>
                </div>
            )}

            {/* Industry */}
            {creator.industry && (
                <div className="flex items-center gap-2 text-xs text-text-secondary mb-4">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="truncate">{creator.industry}</span>
                </div>
            )}

            {/* Action Button */}
            <button
                onClick={() => onToggleFollow(creator.id)}
                className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${creator.isFollowing
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-primary text-white hover:bg-primary-dark"
                    }`}
            >
                {creator.isFollowing ? (
                    <>
                        <span>Remove from list</span>
                        <X className="w-4 h-4" />
                    </>
                ) : (
                    <>
                        <Plus className="w-4 h-4" />
                        <span>Add to List</span>
                    </>
                )}
            </button>
        </div>
    );
}
