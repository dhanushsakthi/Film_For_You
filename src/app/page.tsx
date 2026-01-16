"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AISearchBar from "@/components/AISearchBar";
import MovieDetailModal from "@/components/MovieDetailModal";
import CinematicBackground from "@/components/CinematicBackground";
import { API_URL } from "@/lib/config";

interface Movie {
    id: number;
    title: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
}

const MovieSkeleton = () => (
    <div className="movie-skeleton" style={{
        minWidth: "200px",
        height: "300px",
        backgroundColor: "#333",
        borderRadius: "8px",
        animation: "pulse 1.5s infinite ease-in-out",
        marginRight: "10px"
    }} />
);

export default function Home() {
    const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
    const [trending, setTrending] = useState<Movie[]>([]);
    const [topRated, setTopRated] = useState<Movie[]>([]);
    const [aiResults, setAiResults] = useState<Movie[]>([]);
    const [aiReasoning, setAiReasoning] = useState<string>("");
    const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [userProfiles, setUserProfiles] = useState<any[]>([]);
    const [myList, setMyList] = useState<Movie[]>([]);
    const [continueWatching, setContinueWatching] = useState<Movie[]>([]);
    const [isEditingProfiles, setIsEditingProfiles] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isAgeVerified, setIsAgeVerified] = useState(false);
    const [showAgeVerification, setShowAgeVerification] = useState<any | null>(null);
    const [watchProviders, setWatchProviders] = useState<any[]>([]);
    const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const profiles = userProfiles.length > 0 ? userProfiles : [
        { id: "1", name: "User 1", color: "#e50914" },
        { id: "2", name: "User 2", color: "#54b1ed" },
        { id: "3", name: "Kids", color: "#66cc33" },
    ];

    useEffect(() => {
        // Auth check removed for direct access

        const savedProfiles = localStorage.getItem("user_profiles");
        if (savedProfiles) {
            setUserProfiles(JSON.parse(savedProfiles));
        } else {
            // Default guest profiles if none found
            const guestProfiles = [
                { id: "guest_1", name: "Guest User", color: "#e50914", age: 18, isKidsMode: false },
                { id: "guest_2", name: "Guest Kids", color: "#66cc33", age: 10, isKidsMode: true },
            ];
            setUserProfiles(guestProfiles);
            localStorage.setItem("user_profiles", JSON.stringify(guestProfiles));
        }

        const savedProfile = localStorage.getItem("selected_profile");
        if (savedProfile) {
            setSelectedProfile(savedProfile);
        } else {
            // Auto-select first guest profile
            setSelectedProfile("guest_1");
            localStorage.setItem("selected_profile", "guest_1");
        }

        const fetchProviders = async () => {
            try {
                // Use relative path for Vercel optimization
                const res = await fetch(`/api/movies/watch-providers`);
                const data = await res.json();
                setWatchProviders(data);
            } catch (error) {
                console.error("Error fetching providers:", error);
            }
        };
        fetchProviders();
    }, [router]);

    useEffect(() => {
        if (selectedProfile) {
            localStorage.setItem("selected_profile", selectedProfile);

            const fetchProfileData = async () => {
                const token = localStorage.getItem("film_for_you_token");
                const profileId = localStorage.getItem("selected_profile");
                if (!token || !profileId) return;

                setIsLoading(true);
                try {
                    // Fetch Watchlist & History mock logic (simulated)
                    const savedProfiles = JSON.parse(localStorage.getItem("user_profiles") || "[]");
                    const currentProfile = savedProfiles.find((p: any) => String(p._id) === profileId || String(p.id) === profileId);

                    if (currentProfile) {
                        // In a real app, these would be API calls
                        // Fetching trending and top rated using relative local API routes
                        const trendingRes = await fetch(`/api/movies/trending`);
                        const trendingData = await trendingRes.json();
                        setTrending(trendingData.slice(0, 10));
                        // Hero movie is now handled by CinematicBackground
                        // setHeroMovie(trendingData[0]);

                        const topRatedRes = await fetch(`/api/movies/top-rated`);
                        const topRatedData = await topRatedRes.json();
                        setTopRated(topRatedData.slice(0, 10));

                        // Mocking My List and Continue Watching
                        if (currentProfile.watchlist && currentProfile.watchlist.length > 0) {
                            const moviePromises = currentProfile.watchlist.slice(0, 6).map((id: number) =>
                                fetch(`/api/movies/${id}`).then(res => res.json())
                            );
                            const movies = await Promise.all(moviePromises);
                            setMyList(movies);
                        } else {
                            setMyList([]);
                        }

                        if (currentProfile.history && currentProfile.history.length > 0) {
                            const historyPromises = currentProfile.history.slice(0, 6).map((id: number) =>
                                fetch(`/api/movies/${id}`).then(res => res.json())
                            );
                            const historyMovies = await Promise.all(historyPromises);
                            setContinueWatching(historyMovies);
                        } else {
                            setContinueWatching([]);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching profile data:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchProfileData();
        }
    }, [selectedProfile]);

    const handleUpdateProfile = async (id: string, updates: any) => {
        const token = localStorage.getItem("film_for_you_token");
        if (!token) {
            console.log("Guest profile update - saving to local storage only");
            const updatedProfiles = userProfiles.map(p => (p._id || p.id) === id ? { ...p, ...updates } : p);
            setUserProfiles(updatedProfiles);
            localStorage.setItem("user_profiles", JSON.stringify(updatedProfiles));
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/user/profiles/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });
            if (response.ok) {
                const profileRes = await fetch(`${API_URL}/api/user/profiles`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const updatedProfiles = await profileRes.json();
                setUserProfiles(updatedProfiles);
                localStorage.setItem("user_profiles", JSON.stringify(updatedProfiles));
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleAISearch = async (query: string) => {
        setIsAiLoading(true);
        const token = localStorage.getItem("film_for_you_token");
        const profileId = localStorage.getItem("selected_profile");

        try {
            // Use relative path for Serverless AI
            const response = await fetch(`/api/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: query,
                    profileId,
                    watch_providers: selectedProviders.join("|"),
                    language: userProfiles.find((p: any) => String(p._id) === profileId || String(p.id) === profileId)?.preferredLanguage || "en-US"
                })
            });
            const data = await response.json();
            if (data.movies) {
                setAiResults(data.movies);
            }
            if (data.message) {
                setAiReasoning(data.message);
            }
        } catch (error) {
            console.error("AI Search error:", error);
        } finally {
            setIsAiLoading(false);
        }
    };

    if (!selectedProfile) {
        return (
            <main className="auth-container">
                <h1 style={{ fontSize: "3.5vw", fontWeight: "500" }}>Who's watching?</h1>
                <div className="profile-grid">
                    {profiles.map((profile: any) => (
                        <div
                            key={profile._id || profile.id}
                            className={`profile-card ${isEditingProfiles ? 'editing' : ''}`}
                            onClick={() => {
                                if (isEditingProfiles) {
                                    const newName = prompt("Enter new name", profile.name);
                                    const newAge = prompt("Enter age limit", profile.age || "18");
                                    const isKids = confirm("Is this a Kids Profile?");
                                    const newLang = prompt("Enter preferred language (en-US, hi-IN, etc.)", profile.preferredLanguage || "en-US");
                                    if (newName) handleUpdateProfile(profile._id || profile.id, {
                                        name: newName,
                                        age: parseInt(newAge || "18"),
                                        isKidsMode: isKids,
                                        preferredLanguage: newLang || "en-US"
                                    });
                                } else {
                                    if (!profile.isKidsMode && (profile.age >= 18) && !isAgeVerified) {
                                        setShowAgeVerification(profile);
                                    } else {
                                        setSelectedProfile(String(profile._id || profile.id));
                                    }
                                }
                            }}
                        >
                            <div
                                className="profile-avatar"
                                style={{
                                    backgroundColor: profile.color,
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                {isEditingProfiles && (
                                    <div style={{
                                        position: "absolute",
                                        backgroundColor: "rgba(0,0,0,0.5)",
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "4px"
                                    }}>
                                        <span style={{ fontSize: "2rem" }}>✎</span>
                                    </div>
                                )}
                            </div>
                            <span className="profile-name">{profile.name}</span>
                        </div>
                    ))}
                    <div className="profile-card add-profile" onClick={() => alert("Add Profile logic would go here")}>
                        <div className="profile-avatar" style={{ backgroundColor: "#333", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "4rem", color: "#666" }}>+</span>
                        </div>
                        <span className="profile-name">Add Profile</span>
                    </div>
                </div>
                <button
                    className="manage-profiles-btn"
                    onClick={() => setIsEditingProfiles(!isEditingProfiles)}
                >
                    {isEditingProfiles ? "DONE" : "MANAGE PROFILES"}
                </button>

                {showAgeVerification && (
                    <div className="age-verification-overlay">
                        <div className="age-verification-card">
                            <h2>Age Verification</h2>
                            <p>This profile contains adult content. Please confirm you are 18 or older.</p>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button className="btn btn-primary" onClick={() => {
                                    setIsAgeVerified(true);
                                    setSelectedProfile(showAgeVerification._id || showAgeVerification.id);
                                    setShowAgeVerification(null);
                                }}>Confirm</button>
                                <button className="btn btn-secondary" onClick={() => setShowAgeVerification(null)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        );
    }

    return (
        <main className="home-container">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loader"></div>
                </div>
            )}

            {/* Cinematic Hero Background with Dynamic TMDB Images */}
            <CinematicBackground className="hero" onMovieSelect={setHeroMovie}>
                <div className="hero-content">
                    <AISearchBar onSearch={handleAISearch} isLoading={isAiLoading} />

                    <div className="provider-selector" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', overflowX: 'auto', padding: '10px 0' }}>
                        {watchProviders.map(provider => (
                            <div
                                key={provider.provider_id}
                                className={`provider-icon ${selectedProviders.includes(provider.provider_id) ? 'selected' : ''}`}
                                onClick={() => {
                                    if (selectedProviders.includes(provider.provider_id)) {
                                        setSelectedProviders(selectedProviders.filter(id => id !== provider.provider_id));
                                    } else {
                                        setSelectedProviders([...selectedProviders, provider.provider_id]);
                                    }
                                }}
                                style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    border: selectedProviders.includes(provider.provider_id) ? '2px solid white' : '2px solid transparent',
                                    transition: 'all 0.2s',
                                    flexShrink: 0,
                                    overflow: 'hidden',
                                    background: 'rgba(255,255,255,0.1)'
                                }}
                            >
                                <img
                                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        ))}
                    </div>

                    <h1 className="hero-title" style={{ marginTop: "1rem" }}>{heroMovie?.title || "Film For You"}</h1>
                    <p className="hero-description">{heroMovie?.overview || "Discover your next favorite movie with AI-powered recommendations"}</p>
                    <div className="hero-buttons">
                        <button className="btn btn-primary" onClick={() => heroMovie && setSelectedMovie(heroMovie)}>Play</button>
                        <button className="btn btn-secondary" onClick={() => heroMovie && setSelectedMovie(heroMovie)}>More Info</button>
                    </div>
                </div>
            </CinematicBackground>

            {selectedMovie && (
                <MovieDetailModal
                    movie={selectedMovie}
                    onClose={() => {
                        setSelectedMovie(null);
                        // Refresh profile data when modal closes
                        if (selectedProfile) {
                            const fetchProfileData = async () => {
                                const token = localStorage.getItem("film_for_you_token");
                                if (!token) return;
                                try {
                                    const profs = JSON.parse(localStorage.getItem("user_profiles") || "[]");
                                    const curr = profs.find((p: any) => String(p._id) === selectedProfile || String(p.id) === selectedProfile);
                                    if (curr && curr.watchlist) {
                                        const moviePromises = curr.watchlist.slice(0, 6).map((id: number) =>
                                            fetch(`/api/movies/${id}`).then(res => res.json())
                                        );
                                        const movies = await Promise.all(moviePromises);
                                        setMyList(movies);
                                    }
                                } catch (e) { }
                            };
                            fetchProfileData();
                        }
                    }}
                />
            )}

            <section className="movie-row" style={{ backgroundColor: "rgba(229, 9, 20, 0.1)" }}>
                <h2 className="row-title" style={{ color: "var(--accent)" }}>AI Recommendations for you</h2>
                {aiReasoning && (
                    <div className="ai-reasoning" style={{ padding: "0 4%", marginBottom: "1rem", color: "var(--muted)", fontStyle: "italic" }}>
                        {aiReasoning}
                    </div>
                )}
                <div className="movie-list">
                    {isAiLoading ? (
                        [...Array(6)].map((_, i) => <MovieSkeleton key={i} />)
                    ) : aiResults.length > 0 ? (
                        aiResults.map(movie => (
                            <div key={movie.id} className="movie-card" onClick={() => setSelectedMovie(movie)}>
                                <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                            </div>
                        ))
                    ) : (
                        <p style={{ padding: "0 4%", color: "var(--muted)" }}>Ask AI for personalized picks!</p>
                    )}
                </div>
            </section>

            {continueWatching.length > 0 && (
                <section className="movie-row">
                    <h2 className="row-title">Continue Watching</h2>
                    <div className="movie-list">
                        {continueWatching.map(movie => (
                            <div key={movie.id} className="movie-card" onClick={() => setSelectedMovie(movie)}>
                                <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                                <div className="progress-bar" style={{ position: "absolute", bottom: 0, left: 0, height: "4px", width: "45%", backgroundColor: "var(--accent)" }}></div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="movie-row">
                <h2 className="row-title">Trending Now</h2>
                <div className="movie-list">
                    {trending.length > 0 ? trending.map(movie => (
                        <div key={movie.id} className="movie-card" onClick={() => setSelectedMovie(movie)}>
                            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                        </div>
                    )) : [...Array(6)].map((_, i) => <MovieSkeleton key={i} />)}
                </div>
            </section>

            {myList.length > 0 && (
                <section className="movie-row">
                    <h2 className="row-title">My List</h2>
                    <div className="movie-list">
                        {myList.map(movie => (
                            <div key={movie.id} className="movie-card" onClick={() => setSelectedMovie(movie)}>
                                <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="movie-row">
                <h2 className="row-title">Top Rated</h2>
                <div className="movie-list">
                    {topRated.length > 0 ? topRated.map(movie => (
                        <div key={movie.id} className="movie-card" onClick={() => setSelectedMovie(movie)}>
                            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                        </div>
                    )) : [...Array(6)].map((_, i) => <MovieSkeleton key={i} />)}
                </div>
            </section>
        </main>
    );
}
