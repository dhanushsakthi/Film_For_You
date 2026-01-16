"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { API_URL } from "@/lib/config";

interface Movie {
    id: number;
    title: string;
    backdrop_path: string;
    poster_path: string;
    overview: string;
}

interface CinematicBackgroundProps {
    children?: React.ReactNode;
    className?: string;
    onMovieSelect?: (movie: Movie) => void;
}

export default function CinematicBackground({ children, className = "", onMovieSelect }: CinematicBackgroundProps) {
    const [backgroundMovie, setBackgroundMovie] = useState<Movie | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCinematicBackground = async () => {
            try {
                // Randomly choose between top-rated and trending
                const endpoint = Math.random() > 0.5 ? "/api/movies/top-rated" : "/api/movies/trending";
                // Use relative path to hit Next.js API routes
                const response = await fetch(endpoint);
                const movies: Movie[] = await response.json();

                if (movies && movies.length > 0) {
                    // Select a random movie from the results
                    const randomIndex = Math.floor(Math.random() * Math.min(movies.length, 10));
                    const selectedMovie = movies[randomIndex];
                    setBackgroundMovie(selectedMovie);
                    if (onMovieSelect) {
                        onMovieSelect(selectedMovie);
                    }

                    // Prefer backdrop_path for desktop, fallback to poster_path
                    const imagePath = selectedMovie.backdrop_path || selectedMovie.poster_path;
                    if (imagePath) {
                        setImageUrl(`https://image.tmdb.org/t/p/original${imagePath}`);
                    }
                }
            } catch (error) {
                console.error("Error fetching cinematic background:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCinematicBackground();
    }, []);

    return (
        <div className={`cinematic-background-container ${className}`}>
            {/* Background Image Layer */}
            {imageUrl && !isLoading && (
                <div className="cinematic-background-image">
                    <Image
                        src={imageUrl}
                        alt={backgroundMovie?.title || "Cinematic background"}
                        fill
                        priority
                        quality={90}
                        sizes="100vw"
                        style={{
                            objectFit: "cover",
                            objectPosition: "center",
                        }}
                        onLoadingComplete={() => {
                            // Trigger fade-in animation after image loads
                            const img = document.querySelector('.cinematic-background-image');
                            img?.classList.add('loaded');
                        }}
                    />
                </div>
            )}

            {/* Dark Gradient Overlay */}
            <div className="cinematic-overlay" />

            {/* Optional Film Grain Effect */}
            <div className="film-grain" />

            {/* Content Layer */}
            <div className="cinematic-content">
                {children}
            </div>
        </div>
    );
}
