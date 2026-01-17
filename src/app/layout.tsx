import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConsentNotice from "@/components/ConsentNotice";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Film For You - AI Movie Discovery",
    description: "Discover your next favorite movie with the power of AI. Personalized recommendations, trailers, and legal streaming info in 100+ languages.",
    keywords: ["movie recommendations", "AI movie search", "what to watch", "film discovery", "streaming guide"],
    authors: [{ name: "Antigravity Team" }],
    manifest: "/manifest.json",
    openGraph: {
        title: "Film For You - AI Movie Discovery",
        description: "Personalized AI-powered movie discovery for everyone.",
        url: "https://filmforyou.app",
        siteName: "Film For You",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Film For You - AI Movie Discovery",
        description: "Let AI find your next favorite movie.",
        images: ["/og-image.jpg"],
    },
};

export const viewport: Viewport = {
    themeColor: "#e50914",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ErrorBoundary>
                    {children}
                    <ConsentNotice />
                </ErrorBoundary>
            </body>
        </html>
    );
}
