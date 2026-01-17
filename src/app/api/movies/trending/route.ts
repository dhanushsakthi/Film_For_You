import { NextResponse } from 'next/server';
import { getTrendingMovies } from '@/lib/imdb';
import { getTrendingMoviesTMDB } from '@/lib/tmdb';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        // Try TMDB first for high-quality backdrops
        const tmdbData = await getTrendingMoviesTMDB();

        if (tmdbData && tmdbData.length > 0) {
            const results = tmdbData.map((movie: any) => ({
                id: movie.id,
                title: movie.title || movie.name,
                poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
                overview: movie.overview,
                year: movie.release_date ? movie.release_date.substring(0, 4) : movie.first_air_date ? movie.first_air_date.substring(0, 4) : '',
                rating: movie.vote_average ? movie.vote_average.toFixed(1) : null,
                rank: movie.popularity
            }));
            return NextResponse.json(results);
        }

        // Fallback to IMDb/RapidAPI
        console.log("Fallback to IMDb for trending...");
        const data = await getTrendingMovies();

        const results = Array.isArray(data) ? data.map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            poster_path: movie.image,
            backdrop_path: movie.image, // Fallback: IMDb usually only has posters
            overview: movie.description || `Trending now`,
            year: movie.year,
            rating: movie.rating,
            rank: movie.rank
        })) : [];

        return NextResponse.json(results);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch trending movies' }, { status: 500 });
    }
}

