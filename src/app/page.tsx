"use client";
// forcing vercel rebuild


import React, { useState, useEffect } from "react";
import CinematicBackground from "@/components/CinematicBackground";
import MovieCard from '@/components/MovieCard';
import MovieGrid from '@/components/MovieGrid';
import MovieRow from '@/components/MovieRow';
import AISearchBar from '@/components/AISearchBar';

interface Movie {
    id: number | string;
    title: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    year?: string | number;
    rating?: number | string;
    rank?: number;
}

export default function Home() {
    const [trending, setTrending] = useState<Movie[]>([]);
    const [topTv, setTopTv] = useState<Movie[]>([]);
    const [editorsPicks, setEditorsPicks] = useState<Movie[]>([]);
    const [aiResults, setAiResults] = useState<Movie[]>([]);
    const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [recentlyViewed, setRecentlyViewed] = useState<Movie[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch Top Rated Movies (used as Trending/Home)
                const ratedRes = await fetch('/api/movies/top-rated');
                const ratedData = await ratedRes.json();

                // Fetch Top TV
                const tvRes = await fetch('/api/movies/top-tv');
                const tvData = await tvRes.json();

                if (Array.isArray(ratedData)) {
                    setTrending(ratedData.slice(0, 10));
                    // Editors Picks: simplified as a random slice or specific items
                    setEditorsPicks(ratedData.slice(10, 15));
                    setHeroMovie(ratedData[0]);
                }

                if (Array.isArray(tvData)) {
                    setTopTv(tvData.slice(0, 10));
                }

                // Load Recently Viewed from LocalStorage
                const history = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                setRecentlyViewed(history);

            } catch (error) {
                console.error("Error fetching homepage data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAISearch = async (query: string) => {
        // Implement AI Search logic with redirect or state update
        // For now, simple console log or existing logic if reusable
        console.log("AI Search:", query);
        try {
            const res = await fetch(`/api/movies/search?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (Array.isArray(data)) setAiResults(data);
        } catch (e) { console.error(e); }
    };

    return (
        <main className="min-h-screen bg-black text-white pb-20">
            <CinematicBackground className="hero h-[80vh]" onMovieSelect={setHeroMovie}>
                <div className="hero-content relative z-10 p-8 max-w-4xl mt-20">
                    <AISearchBar onSearch={handleAISearch} isLoading={false} />

                    <h1 className="text-5xl md:text-7xl font-bold mt-8 mb-4 tracking-tighter shadow-black drop-shadow-lg">
                        {heroMovie?.title || "Film For You"}
                    </h1>
                    <p className="text-xl text-gray-200 mb-8 max-w-2xl line-clamp-3 drop-shadow-md">
                        {heroMovie?.overview || "Discover your next masterpiece."}
                    </p>
                </div>
            </CinematicBackground>

            {aiResults.length > 0 && (
                <MovieGrid title="AI Search Results">
                    {aiResults.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </MovieGrid>
            )}

            <div className="-mt-32 relative z-20 space-y-8">
                {/* Trending (Top Rated Movies) */}
                <div className="space-y-4">
                    {trending.length > 0 && (
                        <MovieRow title="Trending Now">
                            {trending.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </MovieRow>
                    )}
                </div>

                {/* Top TV Series */}
                {topTv.length > 0 && (
                    <MovieRow title="Top Rated TV Series">
                        {topTv.map((show) => (
                            <MovieCard key={show.id} movie={show} />
                        ))}
                    </MovieRow>
                )}

                {/* Recently Viewed */}
                {recentlyViewed.length > 0 && (
                    <MovieRow title="Continue Watching">
                        {recentlyViewed.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </MovieRow>
                )}

                {/* Editors Picks - Keep as Grid or optional Row */}
                <MovieGrid title="Editor's Picks" className="px-4">
                    {editorsPicks.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </MovieGrid>
            </div>
        </main>
    );
}
