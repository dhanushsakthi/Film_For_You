"use client";

import React from 'react';

interface TrailerModalProps {
    videoKey: string;
    onClose: () => void;
}

export default function TrailerModal({ videoKey, onClose }: TrailerModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20 transition backdrop-blur-md"
                >
                    ✕
                </button>
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                />
            </div>
        </div>
    );
}
