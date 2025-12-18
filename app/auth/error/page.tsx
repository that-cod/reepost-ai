"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const errorMessages: Record<string, { title: string; description: string }> = {
        Configuration: {
            title: "Server Error",
            description: "There is a problem with the server configuration. Check your environment variables.",
        },
        AccessDenied: {
            title: "Access Denied",
            description: "Your LinkedIn profile may be missing required information. Please ensure your email is visible in your LinkedIn privacy settings.",
        },
        Verification: {
            title: "Verification Failed",
            description: "The verification link was invalid or has expired.",
        },
        OAuthSignin: {
            title: "OAuth Error",
            description: "Error starting the OAuth sign-in process. Please try again.",
        },
        OAuthCallback: {
            title: "OAuth Callback Error",
            description: "Error during the OAuth callback. This may be due to missing profile information.",
        },
        OAuthCreateAccount: {
            title: "Account Creation Error",
            description: "Could not create your account using OAuth. Your LinkedIn profile must include a visible email address.",
        },
        EmailCreateAccount: {
            title: "Account Creation Error",
            description: "Could not create your account using email.",
        },
        Callback: {
            title: "Callback Error",
            description: "An error occurred during the authentication callback.",
        },
        OAuthAccountNotLinked: {
            title: "Account Not Linked",
            description: "This email is already associated with another account. Try signing in with a different method.",
        },
        DatabaseError: {
            title: "Database Error",
            description: "A database error occurred. Please try again later or contact support if the issue persists.",
        },
        default: {
            title: "Authentication Error",
            description: "An unexpected error occurred. Please try again.",
        },
    };

    const { title, description } = errorMessages[error || "default"] || errorMessages.default;

    return (
        <div className="w-full max-w-md text-center">
            <div className="card p-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-text-primary mb-2">
                    {title}
                </h1>

                <p className="text-text-secondary mb-8">
                    {description}
                </p>

                <div className="space-y-3">
                    <Link href="/auth/signin" className="btn-primary w-full py-3 block">
                        Try Again
                    </Link>
                    <Link href="/" className="btn-secondary w-full py-3 block">
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <Suspense fallback={
                <div className="w-full max-w-md text-center">
                    <div className="card p-8">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                </div>
            }>
                <ErrorContent />
            </Suspense>
        </div>
    );
}
