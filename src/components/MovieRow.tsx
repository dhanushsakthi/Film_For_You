"use client";

import React, { useRef, useState, MouseEvent } from 'react';

interface MovieRowProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
}

const MovieRow: React.FC<MovieRowProps> = ({ children, title, className = "" }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const onMouseDown = (e: MouseEvent) => {
        if (!rowRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - rowRef.current.offsetLeft);
        setScrollLeft(rowRef.current.scrollLeft);
    };

    const onMouseLeave = () => {
        setIsDragging(false);
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!isDragging || !rowRef.current) return;
        e.preventDefault();
        const x = e.pageX - rowRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        rowRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <section className={`py-6 md:py-8 ${className}`}>
            {title && (
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-white px-4 md:px-12">
                    {title}
                </h2>
            )}
            <div
                ref={rowRef}
                className="flex gap-4 overflow-x-auto px-4 md:px-12 scrollbar-hide py-4 cursor-grab active:cursor-grabbing snap-x snap-mandatory"
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                style={{ scrollBehavior: 'smooth' }}
            >
                {/* 
                  Enforce a min-width on children to ensure they don't shrink 
                  when using basic flebox.
                */}
                {React.Children.map(children, child => (
                    <div className="min-w-[160px] md:min-w-[200px] snap-start">
                        {child}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default MovieRow;
