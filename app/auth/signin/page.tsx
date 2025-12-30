"use client";

import { useState, Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Linkedin, Mail, Lock, User, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

function SignInForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const callbackUrl = searchParams.get("callbackUrl") || "/generate";
    const error = searchParams.get("error");

    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
    });

    // Show error from URL params (in useEffect to avoid hydration mismatch)
    useEffect(() => {
        if (error) {
            const errorMessages: Record<string, string> = {
                OAuthSignin: "Error starting OAuth sign-in",
                OAuthCallback: "Error during OAuth callback",
                OAuthCreateAccount: "Could not create OAuth account",
                EmailCreateAccount: "Could not create email account",
                Callback: "Error during callback - please try again",
                OAuthAccountNotLinked: "Email already linked to another account. Try signing in with your original method.",
                CredentialsSignin: "Invalid email or password",
                EmailSignin: "Error sending verification email",
                SessionRequired: "Please sign in to continue",
                Configuration: "LinkedIn sign-in is not properly configured. Please contact support.",
                AccessDenied: "Access denied. Your LinkedIn profile may be missing required information (email).",
                Verification: "Verification link expired or invalid",
                default: "An error occurred during sign-in. Please try again.",
            };
            toast.error(errorMessages[error] || errorMessages.default);
        }
    }, [error]);

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isSignUp) {
                // Sign up
                const res = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error?.message || "Failed to create account");
                }

                toast.success("Account created! Signing you in...");

                // Auto sign-in after signup
                const result = await signIn("credentials", {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (result?.ok) {
                    router.push(callbackUrl);
                }
            } else {
                // Sign in
                const result = await signIn("credentials", {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (result?.error) {
                    throw new Error("Invalid email or password");
                }

                if (result?.ok) {
                    router.push(callbackUrl);
                }
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLinkedInSignIn = async () => {
        setIsLoading(true);
        try {
            // Let NextAuth handle the redirect automatically
            await signIn("linkedin", {
                callbackUrl,
                redirect: true  // Changed to true - NextAuth will handle the redirect
            });
            // If redirect is true, this code won't execute as the page will redirect
        } catch (error: any) {
            console.error("LinkedIn sign-in error:", error);
            toast.error("An error occurred during LinkedIn sign-in. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">
                {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>

            {/* LinkedIn Sign In - Only show if configured */}
            {process.env.NEXT_PUBLIC_LINKEDIN_ENABLED !== 'false' && (
                <button
                    onClick={handleLinkedInSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-3 py-3 px-4 border-2 border-[#0077B5] text-[#0077B5] rounded-xl font-semibold hover:bg-[#0077B5] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Linkedin className="w-5 h-5" />
                            <span>Continue with LinkedIn</span>
                        </>
                    )}
                </button>
            )}

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-text-secondary">
                        or continue with email
                    </span>
                </div>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {isSignUp && (
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                required={isSignUp}
                                className="input-field pl-10"
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="you@example.com"
                            required
                            className="input-field pl-10"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            required
                            minLength={8}
                            className="input-field pl-10"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-3 flex items-center justify-center"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isSignUp ? (
                        "Create Account"
                    ) : (
                        "Sign In"
                    )}
                </button>
            </form>

            {/* Toggle Sign Up / Sign In */}
            <p className="mt-6 text-center text-sm text-text-secondary">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary font-semibold hover:underline"
                >
                    {isSignUp ? "Sign In" : "Sign Up"}
                </button>
            </p>
        </>
    );
}

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Repost Ai
                    </h1>
                    <p className="text-text-secondary mt-2">
                        AI-powered LinkedIn content generator
                    </p>
                </div>

                {/* Card */}
                <div className="card p-8">
                    <Suspense fallback={
                        <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    }>
                        <SignInForm />
                    </Suspense>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link href="/" className="text-sm text-text-secondary hover:text-primary">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
