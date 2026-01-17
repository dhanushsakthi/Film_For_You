import React, { useRef, useState } from 'react';
import MovieCard from './MovieCard';
import { Movie } from "@/lib/api";

interface MovieRowProps {
    title: string;
    movies: Movie[];
    onMovieClick?: (movie: Movie) => void;
}

const MovieRow: React.FC<MovieRowProps> = ({ title, movies, onMovieClick }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.pageX - (rowRef.current?.offsetLeft || 0));
        setScrollLeft(rowRef.current?.scrollLeft || 0);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - (rowRef.current?.offsetLeft || 0);
        const walk = (x - startX) * 2; // Scroll-fast
        if (rowRef.current) {
            rowRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    return (
        <div className="space-y-4 md:space-y-6 my-8 px-4 md:px-12 relative group/row">
            <h2 className="text-xl md:text-3xl font-semibold text-white drop-shadow-md mb-2">{title}</h2>

            <div className="relative">
                <div
                    ref={rowRef}
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                >
                    {movies && movies.map((movie) => (
                        <div key={movie.id} className="min-w-[140px] md:min-w-[200px] snap-start transition-transform duration-300">
                            {/* Prevent drag interfering with click by checking isDragging logic if needed, but simple onClick usually works if drag is short */}
                            <div className="pointer-events-none">
                                {/* 
                                    Pointer events hack: We want to allow dragging the container, 
                                    but `MovieCard` has an onClick. 
                                    Ideally, we distinguish click vs drag. 
                                    For simplicity here, we allow click.
                                */}
                            </div>
                            <MovieCard movie={movie} onClick={onMovieClick} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MovieRow;
