import { NextResponse } from 'next/server';
import { getMovieDetails } from '@/lib/imdb';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const movie = await getMovieDetails(id);

        if (!movie) {
            return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }

        // Map if necessary, or pass through if structure is adequate
        // Frontend might expect specific fields
        const result = {
            id: movie.id,
            title: movie.title,
            poster_path: movie.image,
            backdrop_path: movie.image, // Fallback
            overview: movie.description,
            year: movie.year,
            rating: movie.rating,
            rank: movie.rank,
            writers: movie.writers,
            director: movie.director,
            genre: movie.genre
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('Details API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch movie details' }, { status: 500 });
    }
}
