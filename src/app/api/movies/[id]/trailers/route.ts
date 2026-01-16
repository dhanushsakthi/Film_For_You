import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
// User provided key for RapidAPI YouTube Search
const RAPID_API_KEY = process.env.RAPID_API_KEY;

export async function GET(request: Request, { params }: { params: { id: string } }) {
    if (!TMDB_API_KEY) {
        return NextResponse.json([]);
    }

    const { id } = params;

    try {
        // 1. Try TMDB First
        const tmdbRes = await fetch(
            `${TMDB_BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const tmdbData = await tmdbRes.json();

        let trailers = tmdbData.results?.filter((v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")) || [];

        // 2. Fallback to RapidAPI YouTube Search if no trailers found and Key exists
        if (trailers.length === 0 && RAPID_API_KEY) {
            try {
                // Fetch movie details to get the title for search
                const movieRes = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`);
                const movie = await movieRes.json();

                if (movie.title) {
                    const query = `${movie.title} official trailer`;
                    const rapidRes = await fetch(`https://youtube-search-and-download.p.rapidapi.com/search?query=${encodeURIComponent(query)}&type=v`, {
                        headers: {
                            'X-RapidAPI-Key': RAPID_API_KEY,
                            'X-RapidAPI-Host': 'youtube-search-and-download.p.rapidapi.com'
                        }
                    });
                    const rapidData = await rapidRes.json();

                    if (rapidData.contents) {
                        trailers = rapidData.contents.map((item: any) => ({
                            key: item.video.videoId,
                            name: item.video.title,
                            site: "YouTube",
                            type: "Trailer"
                        }));
                    }
                }
            } catch (rapidError) {
                console.error("RapidAPI Search Failed", rapidError);
            }
        }

        return NextResponse.json(trailers);

    } catch (error) {
        return NextResponse.json([]);
    }
}
