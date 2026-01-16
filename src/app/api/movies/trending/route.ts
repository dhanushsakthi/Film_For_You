import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET() {
    if (!TMDB_API_KEY) {
        return NextResponse.json({ error: 'TMDB_API_KEY is not defined' }, { status: 500 });
    }

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch from TMDB');
        }

        const data = await response.json();
        // Filter only valid backdrops
        const results = data.results
            .filter((movie: any) => movie.backdrop_path)
            .map((movie: any) => ({
                id: movie.id,
                title: movie.title,
                backdrop_path: movie.backdrop_path,
                poster_path: movie.poster_path,
                overview: movie.overview
            }));

        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch trending movies' }, { status: 500 });
    }
}
