import React from 'react';

interface MovieGridProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
}

const MovieGrid: React.FC<MovieGridProps> = ({ children, title, className = "" }) => {
    return (
        <section className={`py-8 px-4 md:px-8 ${className}`}>
            {title && (
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white border-l-4 border-accent pl-3">
                    {title}
                </h2>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {children}
            </div>
        </section>
    );
};

export default MovieGrid;
