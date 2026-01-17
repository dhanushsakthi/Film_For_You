"use client";
// forcing vercel rebuild


import React, { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
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
    const [topRated, setTopRated] = useState<Movie[]>([]);
    const [topTv, setTopTv] = useState<Movie[]>([]);
    const [aiResults, setAiResults] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    return (
        <main className="min-h-screen bg-black text-white pb-20">
            {/* Dynamic Hero Section */}
            <HeroSection movies={trending.length > 0 ? trending : topRated} />

            {/* Content Container (Negative margin to overlap hero) */}
            <div className="relative z-20 -mt-32 space-y-8 pb-10">

                {/* AI Search Results */}
                {aiResults.length > 0 && (
                    <div className="px-4 md:px-12">
                        <MovieGrid title="AI Search Results">
                            {aiResults.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </MovieGrid>
                    </div>
                )}

                {/* Movie Rows */}
                {topRated.length > 0 && <MovieRow title="Top Rated Movies" movies={topRated} />}
                {trending.length > 0 && <MovieRow title="Trending Now" movies={trending} />}
                {topTv.length > 0 && <MovieRow title="Popular TV Series" movies={topTv} />}
            </div>

            {/* Floating Search Bar (Optional, if not in Hero) */}
            <div className="fixed top-4 right-4 z-50 w-full max-w-xs md:max-w-md pointer-events-none">
                <div className="pointer-events-auto">
                    <AISearchBar onSearch={handleAISearch} isLoading={false} compact />
                </div>
            </div>
        </main>
    );
}

