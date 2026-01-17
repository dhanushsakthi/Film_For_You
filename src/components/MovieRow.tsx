import React from 'react';
import MovieCard from './MovieCard';

interface Movie {
    id: number | string;
    title: string;
    poster_path: string;
    year?: string | number;
    rating?: number | string;
    rank?: number;
    backdrop_path?: string;
    overview?: string;
}

interface MovieRowProps {
    title: string;
    movies: Movie[];
}

const MovieRow: React.FC<MovieRowProps> = ({ title, movies }) => {
    return (
        <div className="space-y-4 md:space-y-6 my-8 px-4 md:px-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-white drop-shadow-md mb-2">{title}</h2>

            <div className="group relative">
                {/* 
                     Using raw CSS scroll snapping for horizontal list 
                     Ideally we would use 'ref' to scroll left/right with buttons
                 */}
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory">
                    {movies.map((movie) => (
                        <div key={movie.id} className="min-w-[160px] md:min-w-[200px] snap-start">
                            <MovieCard movie={movie} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MovieRow;
