import { NextResponse } from 'next/server';
import { getTopRatedMovies } from '@/lib/imdb';

export async function GET() {
    try {
        const data = await getTopRatedMovies();

        // Map RapidAPI data to frontend structure
        // RapidAPI IMDb often returns: { id, title, image, year, rating, ... }
        // Frontend expects: { id, title, poster_path, backdrop_path, overview }

        const results = Array.isArray(data) ? data.map((movie: any) => ({
            id: movie.id, // IMDb ID (e.g., tt0111161)
            title: movie.title,
            // Check if image is a full URL. If so, passing it directly might break frontend
            // if frontend blindly prepends TMDB base URL. 
            // We will pass it as poster_path and fix frontend later.
            poster_path: movie.image,
            backdrop_path: movie.image, // Fallback to poster if no backdrop
            overview: movie.description || `Rank #${movie.rank} on IMDb`,
            year: movie.year,
            rating: movie.rating
        })) : [];

        return NextResponse.json(results);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch top rated movies' }, { status: 500 });
    }
}
