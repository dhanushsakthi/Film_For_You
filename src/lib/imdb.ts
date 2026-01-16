export const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
export const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST!;

export const fetchFromIMDb = async (endpoint: string, params: Record<string, string> = {}) => {
    const url = `https://${RAPIDAPI_HOST}/${endpoint}`;
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
        }
    };

    try {
        const response = await fetch(fullUrl, options);
        if (!response.ok) {
            throw new Error(`IMDb API Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching from IMDb (${endpoint}):`, error);
        return [];
    }
};

// Helper functions for specific data needs
export const getTopRatedMovies = async () => {
    // Endpoints might vary based on the specific RapidAPI provider. 
    // Using common patterns for "imdb-top-100-movies" or similar data.
    // Adjusting based on standard IMDb API structure if needed.
    // For 'imdb-top-100-movies' specifically, usually root or specific path.
    // Assuming a generic structure for now, can refine if specific API docs provided.

    // For the specific API "IMDb Top 100 Movies", it often returns a simple list.
    // Let's assume a default list fetch if endpoint is empty or root.
    return await fetchFromIMDb('');
};

export const getMovieDetails = async (id: string) => {
    // If the API supports detail by ID
    return await fetchFromIMDb(id);
};

export const searchMovies = async (query: string) => {
    // Many IMDb scraper APIs have a search endpoint?
    // If the specific "Top 100" API doesn't support search, we might filter the top list.
    // For now assuming we implement a filter on the top list for safety, 
    // or if different endpoint exists.
    // Let's implement a safe 'local' search on 'top rated' if API is limited,
    // otherwise try a search endpoint.
    // Given the user said "IMDb Top Movies API", it might be limited.
    // We'll fetch all and filter for now as a fallback.
    const allMovies = await getTopRatedMovies();
    if (Array.isArray(allMovies)) {
        return allMovies.filter((movie: any) =>
            movie.title?.toLowerCase().includes(query.toLowerCase())
        );
    }
    return [];
};

export const getTopTvShows = async () => {
    // Assuming a similar endpoint structure for TV shows or a param
    // Check RapidAPI documentation or assume a standard 'series' endpoint
    // For now using a placeholder endpoint or query
    return await fetchFromIMDb('series');
};
