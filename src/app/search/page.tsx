"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import MovieGrid from '@/components/MovieGrid';
import AISearchBar from '@/components/AISearchBar';

interface Movie {
    id: number | string;
    title: string;
    poster_path: string;
    year?: string | number;
    rating?: number | string;
    rank?: number;
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('query') || '';
    const [results, setResults] = useState<Movie[]>([]);
    const [filteredResults, setFilteredResults] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Filters
    const [minRating, setMinRating] = useState<number>(0);
    const [yearFilter, setYearFilter] = useState<'all' | 'new' | 'old'>('all');

    const handleSearch = async (query: string) => {
        if (!query) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/movies/search?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setResults(data);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (initialQuery) {
            handleSearch(initialQuery);
        }
    }, [initialQuery]);

    // Apply Client-side Filtering
    useEffect(() => {
        let filtered = [...results];

        if (minRating > 0) {
            filtered = filtered.filter(m => {
                const rating = typeof m.rating === 'string' ? parseFloat(m.rating) : m.rating;
                return rating ? rating >= minRating : false;
            });
        }

        if (yearFilter !== 'all') {
            const currentYear = new Date().getFullYear();
            filtered = filtered.filter(m => {
                const year = typeof m.year === 'string' ? parseInt(m.year) : m.year;
                if (!year) return false;
                return yearFilter === 'new' ? year >= 2010 : year < 2010;
            });
        }

        setFilteredResults(filtered);
    }, [results, minRating, yearFilter]);

    return (
        <main className="min-h-screen bg-black text-white p-8 pt-24">
            <div className="max-w-4xl mx-auto mb-12">
                <AISearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar */}
                <aside className="w-full md:w-64 space-y-6 glass-panel p-6 rounded-xl h-fit">
                    <h3 className="text-xl font-bold text-accent">Filters</h3>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Min Rating: {minRating}+</label>
                        <input
                            type="range"
                            min="0"
                            max="9"
                            step="1"
                            value={minRating}
                            onChange={(e) => setMinRating(parseInt(e.target.value))}
                            className="w-full accent-accent"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0</span>
                            <span>9</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Release Era</label>
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value as any)}
                            className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-accent outline-none"
                        >
                            <option value="all">All Time</option>
                            <option value="new">Modern (2010+)</option>
                            <option value="old">Classics (Pre-2010)</option>
                        </select>
                    </div>
                </aside>

                {/* Results Grid */}
                <div className="flex-1">
                    <MovieGrid title={`Results (${filteredResults.length})`}>
                        {filteredResults.map(movie => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </MovieGrid>
                    {filteredResults.length === 0 && !isLoading && (
                        <div className="text-center py-20 text-gray-500">
                            No movies found. Try adjusting filters or search query.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
