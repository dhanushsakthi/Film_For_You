"use client";
// forcing vercel rebuild


import React, { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import MovieCard from '@/components/MovieCard';
import MovieGrid from '@/components/MovieGrid';
import MovieRow from '@/components/MovieRow';
import AISearchBar from '@/components/AISearchBar';
import TrailerModal from "@/components/TrailerModal";
import { getMovieVideos, Movie } from "@/lib/api";

export default function Home() {
    const [trending, setTrending] = useState<Movie[]>([]);
    const [topRated, setTopRated] = useState<Movie[]>([]);
    const [topTv, setTopTv] = useState<Movie[]>([]);
    const [aiResults, setAiResults] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [trailerKey, setTrailerKey] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch Data in Parallel
                const [trendingRes, ratedRes, tvRes] = await Promise.all([
                    fetch('/api/movies/trending'),
                    fetch('/api/movies/top-rated'),
                    fetch('/api/movies/top-tv')
                ]);

                const [trendingData, ratedData, tvData] = await Promise.all([
                    trendingRes.json(),
                    ratedRes.json(),
                    tvRes.json()
                ]);

                if (Array.isArray(trendingData)) setTrending(trendingData);
                if (Array.isArray(ratedData)) setTopRated(ratedData);
                if (Array.isArray(tvData)) setTopTv(tvData);

            } catch (error) {
                console.error("Error fetching homepage data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAISearch = async (query: string) => {
        console.log("AI Search:", query);
        try {
            const res = await fetch(`/api/movies/search?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (Array.isArray(data)) setAiResults(data);
        } catch (e) { console.error(e); }
    };

    const handleMovieClick = async (movie: Movie) => {
        // Fetch trailer
        try {
            const key = await getMovieVideos(movie.id, movie.title);
            if (key) {
                setTrailerKey(key);
                setIsModalOpen(true);
            } else {
                // Fallback: Could redirect to details page or show toast
                console.warn("No trailer found for", movie.title);
                // Optionally redirect to details if no trailer
                // window.location.href = `/movie/${movie.id}`;
            }
        } catch (error) {
            console.error("Error fetching trailer:", error);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white pb-20 relative">
            {/* Floating Search Bar - Stuck to top right or center, ensuring visibility */}
            <div className="fixed top-4 right-4 z-[9999] w-full max-w-xs md:max-w-md pointer-events-none">
                <div className="pointer-events-auto">
                    <AISearchBar onSearch={handleAISearch} isLoading={false} />
                </div>
            </div>

            {/* Dynamic Hero Section */}
            <HeroSection
                movies={trending.length > 0 ? trending : topRated}
                onPlayClick={handleMovieClick}
            />

            {/* Content Container (Negative margin to overlap hero) */}
            <div className="relative z-20 -mt-32 space-y-8 pb-10">

                {/* AI Search Results */}
                {aiResults.length > 0 && (
                    <div className="px-4 md:px-12">
                        <MovieGrid title="AI Search Results">
                            {aiResults.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
                            ))}
                        </MovieGrid>
                    </div>
                )}

                {/* Movie Rows */}
                {topRated.length > 0 && (
                    <MovieRow
                        title="🔥 Top Rated Movies"
                        movies={topRated}
                        onMovieClick={handleMovieClick}
                    />
                )}
                {trending.length > 0 && (
                    <MovieRow
                        title="Trending Now"
                        movies={trending}
                        onMovieClick={handleMovieClick}
                    />
                )}
                {topTv.length > 0 && (
                    <MovieRow
                        title="Popular TV Series"
                        movies={topTv}
                        onMovieClick={handleMovieClick}
                    />
                )}
            </div>

            {/* Trailer Modal */}
            {isModalOpen && trailerKey && (
                <TrailerModal
                    videoKey={trailerKey}
                    onClose={() => {
                        setIsModalOpen(false);
                        setTrailerKey(null);
                    }}
                />
            )}
        </main>
    );
}

