import React from 'react';
import Link from 'next/link';
import { getMovieDetails } from '@/lib/imdb';
import MovieActions from '@/components/MovieActions';
import { Metadata } from 'next';

// This is a Server Component now
interface PageProps {
    params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const movie = await getMovieDetails(params.id);
    if (!movie || Array.isArray(movie)) {
        return {
            title: 'Movie Not Found - Film For You',
        };
    }

    const imageUrl = movie.poster_path?.startsWith('http')
        ? movie.poster_path
        : `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    return {
        title: `${movie.title} (${movie.year}) | Film For You`,
        description: movie.overview?.substring(0, 160) || `Watch ${movie.title} on Film For You.`,
        openGraph: {
            title: movie.title,
            description: movie.overview,
            images: [imageUrl],
        },
    };
}

export default async function MoviePage({ params }: PageProps) {
    const movie = await getMovieDetails(params.id);

    if (!movie || Array.isArray(movie)) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Movie not found</div>;

    const imageUrl = movie.poster_path?.startsWith('http')
        ? movie.poster_path
        : `https://image.tmdb.org/t/p/original${movie.poster_path}`;

    return (
        <main className="min-h-screen bg-black text-white">
            {/* Hero Backdrop */}
            <div className="relative h-[70vh] w-full">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-4xl z-10">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4">{movie.title}</h1>
                    <div className="flex items-center gap-4 text-xl mb-6 text-gray-300">
                        {movie.year && <span>{movie.year}</span>}
                        {movie.rating && <span className="text-accent font-semibold">★ {movie.rating}</span>}
                        {movie.rank && <span className="bg-gray-800 px-2 py-1 rounded text-sm">Rank #{movie.rank}</span>}
                    </div>
                    {/* Client Component for Interactions */}
                    <MovieActions movie={movie} />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-accent">Plot</h2>
                        <p className="text-lg text-gray-300 leading-relaxed">{movie.overview}</p>
                    </section>

                    {/* Additional Details */}
                    <div className="grid grid-cols-2 gap-8">
                        {movie.director && (
                            <div>
                                <h3 className="text-gray-500 mb-2">Director</h3>
                                <p>{movie.director.join(", ")}</p>
                            </div>
                        )}
                        {movie.genre && (
                            <div>
                                <h3 className="text-gray-500 mb-2">Genres</h3>
                                <div className="flex flex-wrap gap-2">
                                    {movie.genre.map((g: string) => (
                                        <span key={g} className="bg-gray-800 px-3 py-1 rounded-full text-sm">{g}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Like items or cast */}
                <div className="glass-panel p-6 rounded-xl h-fit">
                    <h3 className="text-xl font-bold mb-4">Movie Info</h3>
                    <div className="space-y-4 text-sm text-gray-400">
                        <div className="flex justify-between">
                            <span>Rating</span>
                            <span className="text-white">{movie.rating || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Release Year</span>
                            <span className="text-white">{movie.year || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed top-6 left-6 z-50">
                <Link href="/" className="bg-black/50 backdrop-blur text-white px-4 py-2 rounded-full hover:bg-white/20 transition">
                    ← Back
                </Link>
            </div>
        </main>
    );
}
