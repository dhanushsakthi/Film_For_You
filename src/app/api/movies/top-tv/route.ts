import { NextResponse } from 'next/server';
import { getTopTvShows } from '@/lib/imdb';

export async function GET() {
    try {
        const data = await getTopTvShows();

        const results = Array.isArray(data) ? data.map((show: any) => ({
            id: show.id,
            title: show.title,
            poster_path: show.image,
            backdrop_path: show.image,
            overview: show.description || `Rank #${show.rank} on IMDb`,
            year: show.year,
            rating: show.rating
        })) : [];

        return NextResponse.json(results);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch top TV shows' }, { status: 500 });
    }
}
