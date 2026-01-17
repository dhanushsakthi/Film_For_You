import { NextResponse } from 'next/server';
import { getTrendingMovies } from '@/lib/imdb';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        const data = await getTrendingMovies();

        const results = Array.isArray(data) ? data.map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            poster_path: movie.image,
            backdrop_path: movie.image, // Fallback
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
