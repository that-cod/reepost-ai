"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, TrendingUp, Calendar, Settings, Home } from "lucide-react";

interface Command {
    id: string;
    title: string;
    description: string;
    icon: any;
    href: string;
    keywords: string[];
}

const commands: Command[] = [
    {
        id: "dashboard",
        title: "Dashboard",
        description: "View your dashboard and stats",
        icon: Home,
        href: "/dashboard",
        keywords: ["home", "overview", "stats"],
    },
    {
        id: "generate",
        title: "Generate Post",
        description: "Create new AI-powered content",
        icon: FileText,
        href: "/generate",
        keywords: ["create", "new", "ai", "post", "content"],
    },
    {
        id: "trending",
        title: "Browse Trending",
        description: "Discover viral content",
        icon: TrendingUp,
        href: "/trending",
        keywords: ["popular", "viral", "trending", "discover"],
    },
    {
        id: "calendar",
        title: "Content Calendar",
        description: "Schedule and manage posts",
        icon: Calendar,
        href: "/calendar",
        keywords: ["schedule", "plan", "calendar", "manage"],
    },
    {
        id: "settings",
        title: "Settings",
        description: "Manage your preferences",
        icon: Settings,
        href: "/settings",
        keywords: ["preferences", "account", "profile"],
    },
];

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const router = useRouter();

    const filteredCommands = commands.filter(
        (cmd) =>
            cmd.title.toLowerCase().includes(search.toLowerCase()) ||
            cmd.description.toLowerCase().includes(search.toLowerCase()) ||
            cmd.keywords.some((kw) => kw.includes(search.toLowerCase()))
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSelect = (href: string) => {
        setIsOpen(false);
        setSearch("");
        router.push(href);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Command Palette */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center px-4 border-b border-border">
                    <Search className="w-5 h-5 text-text-secondary" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search commands..."
                        className="flex-1 px-4 py-4 bg-transparent outline-none text-text-primary placeholder:text-text-secondary"
                        autoFocus
                    />
                    <kbd className="px-2 py-1 text-xs bg-card-bg rounded border border-border text-text-secondary">
                        ESC
                    </kbd>
                </div>

                {/* Commands List */}
                <div className="max-h-96 overflow-y-auto p-2">
                    {filteredCommands.length === 0 ? (
                        <div className="text-center py-8 text-text-secondary">
                            No commands found
                        </div>
                    ) : (
                        filteredCommands.map((cmd) => {
                            const Icon = cmd.icon;
                            return (
                                <button
                                    key={cmd.id}
                                    onClick={() => handleSelect(cmd.href)}
                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors text-left"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-text-primary">{cmd.title}</p>
                                        <p className="text-sm text-text-secondary">{cmd.description}</p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-border bg-card-bg">
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                        <span>Press ↑ ↓ to navigate</span>
                        <span>Press ⏎ to select</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
