const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export const getTrendingMoviesTMDB = async () => {
    if (!TMDB_API_KEY) {
        console.warn("TMDB_API_KEY is missing. Skipping TMDB fetch.");
        return null;
    }

    try {
        const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&language=en-US`, {
            next: { revalidate: 3600 } // Revalidate every hour
        });

        if (!res.ok) {
            throw new Error(`TMDB Error: ${res.status}`);
        }

        const data = await res.json();
        return data.results || [];
    } catch (error) {
        console.error("Error fetching from TMDB:", error);
        return null;
    }
};
