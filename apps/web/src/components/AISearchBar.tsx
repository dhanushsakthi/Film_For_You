"use client";

import React, { useState, useRef, useEffect } from "react";

interface AISearchBarProps {
    onSearch: (query: string) => void;
    isLoading?: boolean;
}

export default function AISearchBar({ onSearch, isLoading }: AISearchBarProps) {
    const [query, setQuery] = useState("");
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && ("WebKitSpeechRecognition" in window || "speechRecognition" in window)) {
            const SpeechRecognition = (window as any).WebKitSpeechRecognition || (window as any).speechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = "en-US";

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setQuery(transcript);
                setIsListening(false);
                onSearch(transcript);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [onSearch]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setIsListening(true);
            recognitionRef.current?.start();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
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
                    placeholder="Ask AI: 'Find me some classic action movies...'"
                    style={{
                        width: "100%",
                        padding: "1rem 3.5rem 1rem 1.5rem",
                        borderRadius: "50px",
                        border: "2px solid var(--secondary)",
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "white",
                        fontSize: "1.1rem",
                        outline: "none",
                        backdropFilter: "blur(10px)",
                        transition: "all 0.3s"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "var(--secondary)"}
                />
                <button
                    type="button"
                    onClick={toggleListening}
                    style={{
                        position: "absolute",
                        right: "15px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: isListening ? "var(--accent)" : "var(--muted)",
                        fontSize: "1.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "color 0.2s"
                    }}
                >
                    {isListening ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <div className="voice-pulse" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--accent)" }}></div>
                            <span style={{ fontSize: "0.8rem", color: "var(--accent)" }}>Listening...</span>
                        </div>
                    ) : (
                        <span>🎤</span>
                    )}
                </button>
            </form>
            {isLoading && (
                <div style={{
                    position: "absolute",
                    bottom: "-25px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "0.8rem",
                    color: "var(--accent)"
                }}>
                    AI is thinking...
                </div>
            )}
        </div>
    );
}
