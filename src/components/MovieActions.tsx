"use client";

import React, { useState } from 'react';
import TrailerModal from './TrailerModal';

interface MovieDetail {
    id: string;
    title: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    year: string;
    rating: string;
    rank: number;
}

interface MovieActionsProps {
    movie: MovieDetail;
}

export default function MovieActions({ movie }: MovieActionsProps) {
    const [showTrailer, setShowTrailer] = useState(false);
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);

    const handlePlay = async () => {
        setIsLoadingTrailer(true);
        try {
            const res = await fetch(`/api/movies/${movie.id}/trailers`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setTrailerKey(data[0].key);
                setShowTrailer(true);
            } else {
                alert("Sorry, no trailer available for this title.");
            }
        } catch (error) {
            console.error("Error fetching trailer:", error);
            alert("Failed to load trailer.");
        } finally {
            setIsLoadingTrailer(false);
        }
    };

    const addToWatchlist = () => {
        if (!movie) return;
        // Simple LocalStorage Watchlist
        const existing = localStorage.getItem('watchlist');
        let list = existing ? JSON.parse(existing) : [];
        if (!list.find((m: any) => m.id === movie.id)) {
            list.push(movie);
            localStorage.setItem('watchlist', JSON.stringify(list));
            alert("Added to watchlist!");
        } else {
            alert("Already in watchlist");
        }
    };

    // Save to history on mount (client-side effect)
    React.useEffect(() => {
        const history = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const newHistory = [movie, ...history.filter((m: any) => m.id !== movie.id)].slice(0, 10);
        localStorage.setItem('recentlyViewed', JSON.stringify(newHistory));
    }, [movie]);

    return (
        <>
            <div className="flex gap-4">
                <button
                    onClick={handlePlay}
                    disabled={isLoadingTrailer}
                    className="bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-50"
                >
                    {isLoadingTrailer ? 'Loading...' : '▶ Play Trailer'}
                </button>
                <button
                    onClick={addToWatchlist}
                    className="bg-gray-600/80 backdrop-blur-md text-white px-8 py-3 rounded font-bold hover:bg-gray-500/80 transition"
                >
                    + My List
                </button>
            </div>

            {showTrailer && trailerKey && (
                <TrailerModal
                    videoKey={trailerKey}
                    onClose={() => setShowTrailer(false)}
                />
            )}
        </>
    );
}
