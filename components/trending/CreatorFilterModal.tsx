"use client";

import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import Image from "next/image";

interface Creator {
    id: string;
    name: string;
    image?: string;
    occupation?: string;
}

interface CreatorFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCreators: string[];
    onApply: (selectedIds: string[]) => void;
    creators: Creator[];
}

export default function CreatorFilterModal({
    isOpen,
    onClose,
    selectedCreators,
    onApply,
    creators,
}: CreatorFilterModalProps) {
    const [selected, setSelected] = useState<string[]>(selectedCreators);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setSelected(selectedCreators);
    }, [selectedCreators, isOpen]);

    if (!isOpen) return null;

    const filteredCreators = creators.filter((creator) =>
        creator.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggle = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        setSelected(creators.map((c) => c.id));
    };

    const handleSelectNone = () => {
        setSelected([]);
    };

    const handleApply = () => {
        onApply(selected);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-border max-w-md w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">Filter Creators ({filteredCreators.length})</h2>
                        <p className="text-sm text-text-secondary mt-1">Choose which creators' posts to display</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-text-secondary hover:text-text-primary transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card-bg">
                    <button
                        onClick={handleSelectAll}
                        className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                        Select All
                    </button>
                    <button
                        onClick={handleSelectNone}
                        className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                        Select None
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-border bg-card-bg">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search creators..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                </div>

                {/* Creators List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredCreators.map((creator) => (
                        <div
                            key={creator.id}
                            onClick={() => handleToggle(creator.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${selected.includes(creator.id)
                                    ? "bg-light-green border-2 border-primary"
                                    : "bg-card-bg border-2 border-transparent hover:bg-pastel-green/30"
                                }`}
                        >
                            <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selected.includes(creator.id)
                                        ? "bg-primary border-primary"
                                        : "border-gray-400"
                                    }`}
                            >
                                {selected.includes(creator.id) && (
                                    <svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                )}
                            </div>

                            <div className="flex items-center gap-3 flex-1">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                    {creator.image ? (
                                        <Image
                                            src={creator.image}
                                            alt={creator.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-text-primary font-bold text-lg">
                                            {creator.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-text-primary font-medium truncate">{creator.name}</p>
                                    {creator.occupation && (
                                        <p className="text-xs text-text-secondary truncate">{creator.occupation}</p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelected([creator.id]);
                                }}
                                className="text-text-secondary hover:text-primary transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-border bg-card-bg">
                    <p className="text-sm text-text-secondary">
                        {selected.length} of {creators.length} selected
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-text-secondary hover:text-text-primary font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl"
                        >
                            Apply Filter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
