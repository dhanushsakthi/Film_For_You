import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    if (!TMDB_API_KEY) {
        return NextResponse.json({ error: 'TMDB_API_KEY is not defined' }, { status: 500 });
    }

    const { id } = params;

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch movie details from TMDB');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch movie details' }, { status: 500 });
    }
}
