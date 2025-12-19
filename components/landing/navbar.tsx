'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Copy, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-nav h-16">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:border-primary/50 transition-colors">
                        <Copy className="size-5 text-primary" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">RepostAI</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link>
                    <Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
                    <Link href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</Link>
                </div>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/auth/signin" className="text-sm font-medium hover:text-primary transition-colors">
                        Login
                    </Link>
                    <Link href="/auth/signin">
                        <Button variant="glow" size="sm">
                            Start Free Trial
                        </Button>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass-nav border-t border-white/10 overflow-hidden"
                    >
                        <div className="flex flex-col p-4 gap-4">
                            <Link href="#features" className="text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>Features</Link>
                            <Link href="#pricing" className="text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>Pricing</Link>
                            <Link href="#faq" className="text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>FAQ</Link>
                            <div className="h-px bg-white/10 my-2" />
                            <Link href="/auth/signin" className="block text-center text-gray-400 hover:text-white">Login</Link>
                            <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                                <Button variant="glow" className="w-full">Start Free Trial</Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
