"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                style: {
                    background: "#fff",
                    color: "#1A1A1A",
                    borderRadius: "12px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
                    padding: "12px 16px",
                },
                success: {
                    iconTheme: {
                        primary: "#FF6B81",
                        secondary: "#fff",
                    },
                },
            }}
        />
    );
}
