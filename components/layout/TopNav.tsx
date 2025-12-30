"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Search, Bell, Menu, User, LogOut, Settings } from "lucide-react";
import Link from "next/link";

interface TopNavProps {
    onMenuClick?: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
    const { data: session } = useSession();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-border">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left: Menu Button + Search */}
                <div className="flex items-center space-x-4 flex-1">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 hover:bg-card-bg rounded-lg transition-colors"
                    >
                        <Menu className="w-5 h-5 text-text-primary" />
                    </button>

                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search posts, topics..."
                            className="w-full pl-10 pr-4 py-2 bg-card-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Right: Notifications + User Menu */}
                <div className="flex items-center space-x-3">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 hover:bg-card-bg rounded-lg transition-colors relative"
                        >
                            <Bell className="w-5 h-5 text-text-secondary" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-border overflow-hidden">
                                <div className="p-4 border-b border-border">
                                    <h3 className="font-semibold text-text-primary">Notifications</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    <div className="p-4 text-center text-sm text-text-secondary">
                                        No new notifications
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 p-2 hover:bg-card-bg rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">
                                    {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                                </span>
                            </div>
                            <span className="hidden sm:block text-sm font-medium text-text-primary">
                                {session?.user?.name || "User"}
                            </span>
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-border overflow-hidden">
                                <div className="p-4 border-b border-border">
                                    <p className="font-semibold text-text-primary">
                                        {session?.user?.name || "User"}
                                    </p>
                                    <p className="text-xs text-text-secondary mt-1">
                                        {session?.user?.email}
                                    </p>
                                </div>
                                <div className="p-2">
                                    <Link
                                        href="/settings"
                                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-card-bg transition-colors"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <Settings className="w-4 h-4 text-text-secondary" />
                                        <span className="text-sm text-text-primary">Settings</span>
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4 text-red-600" />
                                        <span className="text-sm text-red-600">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
