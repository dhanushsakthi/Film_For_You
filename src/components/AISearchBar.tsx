"use client";

import React, { useState, useRef, useEffect } from "react";
import { API_URL } from "@/lib/config";

interface AISearchBarProps {
    onSearch: (query: string) => void;
    isLoading?: boolean;
}

interface Movie {
    id: number;
    title: string;
    poster_path: string;
    release_date: string;
    overview: string;
}

export default function AISearchBar({ onSearch, isLoading }: AISearchBarProps) {
    const [query, setQuery] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [voiceSearchResults, setVoiceSearchResults] = useState<Movie[]>([]);
    const [showVoiceResults, setShowVoiceResults] = useState(false);
    const [voiceError, setVoiceError] = useState<string>("");
    const [isSpeechSupported, setIsSpeechSupported] = useState(true);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const hasWebSpeech = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
            setIsSpeechSupported(hasWebSpeech);

            if (hasWebSpeech) {
                const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = "en-US";

                recognitionRef.current.onresult = async (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setQuery(transcript);
                    setIsListening(false);

                    // Search TMDB for the voice query
                    await searchTMDB(transcript);
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error:", event.error);
                    setIsListening(false);

                    let errorMessage = "Voice recognition failed. Please try again.";
                    if (event.error === "no-speech") {
                        errorMessage = "No speech detected. Please try again.";
                    } else if (event.error === "not-allowed") {
                        errorMessage = "Microphone access denied. Please enable it in browser settings.";
                    }
                    setVoiceError(errorMessage);
                    setTimeout(() => setVoiceError(""), 3000);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };
            }
        }
    }, []);

    const searchTMDB = async (searchQuery: string) => {
        try {
            // Use relative path to hit Next.js API routes
            const response = await fetch(`/api/movies/search?query=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                setVoiceSearchResults(data.slice(0, 5)); // Show top 5 results
                setShowVoiceResults(true);

                // Auto-trigger AI search with the voice query
                onSearch(searchQuery);
            } else {
                setVoiceError("No movies found. Try a different search.");
                setTimeout(() => setVoiceError(""), 3000);
            }
        } catch (error) {
            console.error("TMDB search error:", error);
            setVoiceError("Search failed. Please try again.");
            setTimeout(() => setVoiceError(""), 3000);
        }
    };

    const toggleListening = () => {
        if (!isSpeechSupported) {
            setVoiceError("Voice search is not supported in this browser. Try Chrome, Edge, or Safari.");
            setTimeout(() => setVoiceError(""), 4000);
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setVoiceError("");
            setShowVoiceResults(false);
            setIsListening(true);
            recognitionRef.current?.start();
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
        <div style={{
            width: "100%",
            maxWidth: "600px",
            position: "relative",
            margin: "0 auto"
        }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", position: "relative" }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask AI or use voice: 'Find me some classic action movies...'"
                    style={{
                        width: "100%",
                        padding: "1rem 3.5rem 1rem 1.5rem",
                        borderRadius: "50px",
                        border: `2px solid ${isListening ? "var(--accent)" : "var(--secondary)"}`,
                        backgroundColor: "rgba(0,0,0,0.7)",
                        color: "white",
                        fontSize: "1.1rem",
                        outline: "none",
                        backdropFilter: "blur(10px)",
                        transition: "all 0.3s",
                        boxShadow: isListening ? "0 0 20px rgba(229, 9, 20, 0.3)" : "none"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                    onBlur={(e) => !isListening && (e.currentTarget.style.borderColor = "var(--secondary)")}
                />
                <button
                    type="button"
                    onClick={toggleListening}
                    title={isSpeechSupported ? "Click to use voice search" : "Voice search not supported"}
                    style={{
                        position: "absolute",
                        right: "15px",
                        background: "none",
                        border: "none",
                        cursor: isSpeechSupported ? "pointer" : "not-allowed",
                        color: isListening ? "var(--accent)" : (isSpeechSupported ? "var(--muted)" : "#555"),
                        fontSize: "1.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                        opacity: isSpeechSupported ? 1 : 0.5
                    }}
                >
                    {isListening ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <div className="voice-pulse-animated" style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                backgroundColor: "var(--accent)"
                            }}></div>
                            <span style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: "600" }}>Listening...</span>
                        </div>
                    ) : (
                        <span style={{ filter: isSpeechSupported ? "none" : "grayscale(100%)" }}>🎙️</span>
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
                                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
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
