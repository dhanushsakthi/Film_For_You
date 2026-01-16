import { NextResponse } from 'next/server';
import { searchMovies } from '@/lib/imdb';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');

        if (!query) {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }

        const data = await searchMovies(query);

        const results = Array.isArray(data) ? data.map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            poster_path: movie.image,
            year: movie.year,
            rating: movie.rating,
            overview: movie.description
        })) : [];

        return NextResponse.json(results);
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Failed to search movies' }, { status: 500 });
    }
}
