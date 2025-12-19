import Link from "next/link";
import { Copy, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/20 pt-20 pb-10">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Copy className="size-5 text-primary" />
                            </div>
                            <span className="font-bold text-xl">RepostAI</span>
                        </Link>
                        <p className="text-gray-400 text-sm mb-6">
                            Helping creators build their personal brand on LinkedIn with AI-powered content tools.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="size-5" /></Link>
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="size-5" /></Link>
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram className="size-5" /></Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Roadmap</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} RepostAI. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
