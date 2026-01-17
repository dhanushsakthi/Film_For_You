import React from 'react';
import Link from 'next/link';
import { Movie } from "@/lib/api";

interface MovieCardProps {
    movie: Movie;
    priority?: boolean;
    onClick?: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, priority = false, onClick }) => {
    // Handle image URL: if it's a full URL (IMDb/RapidAPI), use it.
    // Otherwise assume TMDB and prepend base URL.
    const imageUrl = movie.poster_path?.startsWith('http')
        ? movie.poster_path
        : `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    const CardContent = (
        <div className="movie-card group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 bg-card-bg border border-transparent hover:border-white/10">
            <div className="aspect-[2/3] relative">
                <img
                    src={imageUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading={priority ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold text-lg truncate">{movie.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        {movie.rating && <span className="text-accent">★ {movie.rating}</span>}
                        {movie.year && <span>{movie.year}</span>}
                    </div>
                </div>
            </div>

            {movie.rank && (
                <div className="absolute top-2 right-2 bg-accent/90 text-white font-bold px-2 py-1 rounded text-xs backdrop-blur-sm">
                    #{movie.rank}
                </div>
            )}
        </div>
    );

    if (onClick) {
        return (
            <div onClick={() => onClick(movie)}>
                {CardContent}
            </div>
        );
    }

    return (
        <Link href={`/movie/${movie.id}`} className="block">
            {CardContent}
        </Link>
    );
};

export default MovieCard;
