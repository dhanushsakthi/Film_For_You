import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request: Request) {
    if (!TMDB_API_KEY) {
        return NextResponse.json([]);
    }

    try {
        const { searchParams } = new URL(request.url);
        const region = searchParams.get('watch_region') || 'US';

        const response = await fetch(
            `${TMDB_BASE_URL}/watch/providers/movie?api_key=${TMDB_API_KEY}&watch_region=${region}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch from TMDB');
        }

        const data = await response.json();
        const popularProviders = [
            'Netflix', 'Amazon Prime Video', 'Disney Plus', 'Hulu', 'HBO Max', 'Apple TV Plus'
        ];

        const results = data.results.filter((p: any) => popularProviders.includes(p.provider_name));

        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch watch providers' }, { status: 500 });
    }
}
