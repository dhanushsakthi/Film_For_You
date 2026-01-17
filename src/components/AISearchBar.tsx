import React, { useState, useRef, useEffect } from "react";
import { processVoiceCommand } from "@/lib/gemini";

interface AISearchBarProps {
    onSearch: (query: string) => void;
    isLoading?: boolean;
    compact?: boolean;
}

interface Movie {
    id: number | string;
    title: string;
    poster_path: string;
    release_date?: string;
    overview: string;
}

export default function AISearchBar({ onSearch, isLoading, compact }: AISearchBarProps) {
    const [query, setQuery] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [voiceSearchResults, setVoiceSearchResults] = useState<Movie[]>([]);
    const [showVoiceResults, setShowVoiceResults] = useState(false);
    const [voiceError, setVoiceError] = useState<string>("");

    // MediaRecorder refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleVoiceSearch = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setIsProcessing(true);
                setIsRecording(false);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                try {
                    const text = await processVoiceCommand(audioBlob);
                    if (text) {
                        setQuery(text);
                        onSearch(text);
                    } else {
                        setVoiceError("Could not understand audio. Try again.");
                    }
                } catch (error) {
                    console.error(error);
                    setVoiceError("Voice processing failed.");
                } finally {
                    setIsProcessing(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setVoiceError("");
        } catch (error) {
            console.error("Microphone access denied:", error);
            setVoiceError("Microphone access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setShowVoiceResults(false);
            onSearch(query);
        }
    };

    return (
        <div className={`w-full max-w-xl mx-auto relative ${compact ? 'scale-90 origin-top-right' : ''}`}>
            <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={isRecording ? "Listening..." : isProcessing ? "Processing audio..." : "Search movies..."}
                    className={`w-full py-3 pl-6 pr-14 rounded-full bg-black/80 text-white border-2 outline-none backdrop-blur-md transition-all duration-300 ${isRecording ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" :
                            isProcessing ? "border-blue-500 animate-pulse" : "border-gray-700 focus:border-white"
                        }`}
                    disabled={isRecording || isProcessing}
                />

                <button
                    type="button"
                    onClick={handleVoiceSearch}
                    className={`absolute right-3 p-2 rounded-full transition-all duration-200 ${isRecording ? "bg-red-500 text-white scale-110" : "text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                    disabled={isProcessing}
                >
                    {isRecording ? (
                        <div className="w-5 h-5 flex items-center justify-center">
                            <span className="w-2.5 h-2.5 bg-white rounded-sm animate-pulse"></span>
                        </div>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    )}
                </button>
            </form>

            {/* Voice Error Message */}
            {voiceError && (
                <div style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "rgba(229, 9, 20, 0.9)",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    whiteSpace: "nowrap",
                    zIndex: 1000,
                    animation: "fadeIn 0.3s ease-in-out"
                }}>
                    {voiceError}
                </div>
            )}

            {/* AI Loading Indicator */}
            {isLoading && (
                <div style={{
                    position: "absolute",
                    bottom: "-30px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "0.85rem",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}>
                    <div className="ai-thinking-dots">
                        <span>.</span><span>.</span><span>.</span>
                    </div>
                    AI is thinking
                </div>
            )}

            {/* Voice Search Results Preview */}
            {showVoiceResults && voiceSearchResults.length > 0 && (
                <div style={{
                    position: "absolute",
                    top: "calc(100% + 15px)",
                    left: 0,
                    right: 0,
                    backgroundColor: "rgba(20, 20, 20, 0.98)",
                    borderRadius: "12px",
                    padding: "1rem",
                    backdropFilter: "blur(20px)",
                    border: "1px solid var(--secondary)",
                    zIndex: 1000,
                    maxHeight: "300px",
                    overflowY: "auto",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.75rem"
                    }}>
                        <h4 style={{ fontSize: "0.9rem", color: "var(--muted)", margin: 0 }}>
                            Voice Search Results
                        </h4>
                        <button
                            onClick={() => setShowVoiceResults(false)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "var(--muted)",
                                cursor: "pointer",
                                fontSize: "1.2rem",
                                padding: 0
                            }}
                        >
                            ✕
                        </button>
                    </div>
                    {voiceSearchResults.map((movie) => (
                        <div
                            key={movie.id}
                            style={{
                                display: "flex",
                                gap: "1rem",
                                padding: "0.75rem",
                                borderRadius: "8px",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                                marginBottom: "0.5rem"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            onClick={() => {
                                setShowVoiceResults(false);
                                onSearch(movie.title);
                            }}
                        >
                            {movie.poster_path && (
                                <img
                                    src={movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                    alt={movie.title}
                                    style={{
                                        width: "50px",
                                        height: "75px",
                                        objectFit: "cover",
                                        borderRadius: "4px"
                                    }}
                                />
                            )}
                            <div style={{ flex: 1 }}>
                                <h5 style={{
                                    fontSize: "0.95rem",
                                    marginBottom: "0.25rem",
                                    color: "white"
                                }}>
                                    {movie.title}
                                </h5>
                                <p style={{
                                    fontSize: "0.8rem",
                                    color: "var(--muted)",
                                    margin: 0
                                }}>
                                    {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
