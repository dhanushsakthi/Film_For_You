"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/lib/api";

interface HeroSectionProps {
    movies: Movie[];
    onPlayClick?: (movie: Movie) => void;
}

export default function HeroSection({ movies, onPlayClick }: HeroSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        if (!movies || movies.length === 0) return;

        const interval = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % movies.length);
                setIsFading(false);
            }, 500); // Wait for fade out
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [movies]);

    if (!movies || movies.length === 0) {
        return <div className="h-[80vh] bg-black" />; // Fallback
    }

    const currentMovie = movies[currentIndex];
    const imageUrl = currentMovie.backdrop_path?.startsWith("http")
        ? currentMovie.backdrop_path
        : currentMovie.poster_path?.startsWith("http")
            ? currentMovie.poster_path
            : `https://image.tmdb.org/t/p/original${currentMovie.backdrop_path || currentMovie.poster_path
            }`;

    return (
        <div className="relative h-[85vh] w-full overflow-hidden">
            {/* Background Image */}
            <div
                className={`absolute inset-0 transition-opacity duration-1000 ${isFading ? "opacity-0" : "opacity-100"
                    }`}
            >
                <Image
                    src={imageUrl}
                    alt={currentMovie.title}
                    fill
                    priority
                    className="object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex h-full items-end pb-32 pl-4 md:pl-16 max-w-4xl">
                <div
                    className={`space-y-6 transition-opacity duration-1000 ${isFading ? "opacity-0" : "opacity-100"
                        }`}
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
                        {currentMovie.title}
                    </h1>

                    <div className="flex items-center gap-4 text-lg text-gray-200">
                        {currentMovie.rating && (
                            <span className="text-green-400 font-semibold">
                                ★ {currentMovie.rating}
                            </span>
                        )}
                        {currentMovie.year && <span>{currentMovie.year}</span>}
                    </div>

                    <p className="max-w-xl text-lg text-gray-300 line-clamp-3 drop-shadow-md">
                        {currentMovie.overview}
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={() => onPlayClick && onPlayClick(currentMovie)}
                            className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-white/90 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Play
                        </button>
                        <Link
                            href={`/movie/${currentMovie.id}`}
                            className="px-8 py-3 bg-gray-500/30 text-white font-bold rounded backdrop-blur-sm hover:bg-gray-500/50 transition-colors flex items-center gap-2"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            More Info
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
