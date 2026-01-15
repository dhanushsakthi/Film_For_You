"use client";

import React, { useState, useEffect } from "react";

interface MovieDetailModalProps {
    movie: any;
    onClose: () => void;
}

export default function MovieDetailModal({ movie, onClose }: MovieDetailModalProps) {
    const [details, setDetails] = useState<any>(null);
    const [providers, setProviders] = useState<any>(null);
    const [trailers, setTrailers] = useState<any[]>([]);
    const [showTrailer, setShowTrailer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isInWatchlist, setIsInWatchlist] = useState(false);

    const profileId = typeof window !== "undefined" ? localStorage.getItem("selected_profile_id") || localStorage.getItem("selected_profile") : null;
    const token = typeof window !== "undefined" ? localStorage.getItem("film_for_you_token") : null;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch full details (cast, etc.)
                const detailsRes = await fetch(`http://localhost:5000/api/movies/${movie.id}`);
                const detailsData = await detailsRes.json();
                setDetails(detailsData);

                // Fetch watch providers (defaulting to IN for now, should be dynamic)
                const providersRes = await fetch(`http://localhost:5000/api/movies/${movie.id}/providers?region=IN`);
                const providersData = await providersRes.json();
                setProviders(providersData);

                // Check watchlist status (this is simplified, ideally profiles come from state)
                const savedProfiles = localStorage.getItem("user_profiles");
                if (savedProfiles && profileId) {
                    const profiles = JSON.parse(savedProfiles);
                    const currentProfile = profiles.find((p: any) => p._id === profileId || String(p.id) === profileId);
                    if (currentProfile && currentProfile.watchlist) {
                        setIsInWatchlist(currentProfile.watchlist.includes(movie.id));
                    }
                }

                // Fetch trailers
                const trailersRes = await fetch(`http://localhost:5000/api/movies/${movie.id}/trailers`);
                const trailersData = await trailersRes.json();
                setTrailers(trailersData);
            } catch (error) {
                console.error("Error fetching movie details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [movie.id, profileId]);

    const toggleWatchlist = async () => {
        if (!profileId || !token) return;

        const method = isInWatchlist ? "DELETE" : "POST";
        const url = isInWatchlist
            ? `http://localhost:5000/api/user/profiles/${profileId}/watchlist/${movie.id}`
            : `http://localhost:5000/api/user/profiles/${profileId}/watchlist`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: isInWatchlist ? undefined : JSON.stringify({ movieId: movie.id })
            });

            if (res.ok) {
                setIsInWatchlist(!isInWatchlist);
                // Update local storage for immediate feedback elsewhere
                const savedProfiles = localStorage.getItem("user_profiles");
                if (savedProfiles) {
                    const profiles = JSON.parse(savedProfiles);
                    const pIdx = profiles.findIndex((p: any) => p._id === profileId || String(p.id) === profileId);
                    if (pIdx !== -1) {
                        if (isInWatchlist) {
                            profiles[pIdx].watchlist = profiles[pIdx].watchlist.filter((id: number) => id !== movie.id);
                        } else {
                            profiles[pIdx].watchlist.push(movie.id);
                        }
                        localStorage.setItem("user_profiles", JSON.stringify(profiles));
                    }
                }
            }
        } catch (err) {
            console.error("Error toggling watchlist:", err);
        }
    };

    const trackHistory = async () => {
        if (!profileId || !token) return;
        try {
            await fetch(`http://localhost:5000/api/user/profiles/${profileId}/history`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ movieId: movie.id })
            });
        } catch (err) {
            console.error("Error tracking history:", err);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: movie.title,
            text: `Check out this movie on Film For You: ${movie.title}`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    if (!movie) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>

                <div
                    className="modal-hero"
                    style={{
                        backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
                        height: "400px",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        position: "relative"
                    }}
                >
                    {showTrailer && trailers.length > 0 ? (
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${trailers[0].key}?autoplay=1`}
                            title="Movie Trailer"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <>
                            <div className="hero-overlay"></div>
                            <div className="hero-content-modal">
                                <h2>{movie.title}</h2>
                                <div className="modal-btns" style={{ display: "flex", gap: "1rem" }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => { setShowTrailer(true); trackHistory(); }}
                                        disabled={trailers.length === 0}
                                    >
                                        {trailers.length > 0 ? "▶ Play Trailer" : "No Trailer Available"}
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        onClick={handleShare}
                                        style={{ border: "2px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.1)", color: "white" }}
                                    >
                                        Share
                                    </button>
                                    <button
                                        className={`btn ${isInWatchlist ? 'btn-secondary' : 'btn-outline'}`}
                                        onClick={toggleWatchlist}
                                        style={{
                                            padding: "0.8rem",
                                            borderRadius: "50%",
                                            width: "45px",
                                            height: "45px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "1.5rem",
                                            border: "2px solid rgba(255,255,255,0.5)",
                                            background: isInWatchlist ? "rgba(255,255,255,0.2)" : "transparent",
                                            color: "white"
                                        }}
                                        title={isInWatchlist ? "Remove from My List" : "Add to My List"}
                                    >
                                        {isInWatchlist ? "✓" : "+"}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="modal-body" style={{ padding: "2rem", display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
                    <div>
                        <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>{movie.overview}</p>

                        {details?.credits?.cast && (
                            <div className="cast-section">
                                <h4 style={{ color: "var(--muted)", marginBottom: "0.5rem" }}>Cast</h4>
                                <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem" }}>
                                    {details.credits.cast.slice(0, 5).map((person: any) => (
                                        <div key={person.id} style={{ flexShrink: 0, textAlign: "center", width: "80px" }}>
                                            <div style={{
                                                width: "60px",
                                                height: "60px",
                                                borderRadius: "50%",
                                                backgroundColor: "var(--secondary)",
                                                margin: "0 auto 0.5rem",
                                                overflow: "hidden"
                                            }}>
                                                {person.profile_path && (
                                                    <img src={`https://image.tmdb.org/t/p/w200${person.profile_path}`} alt={person.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                )}
                                            </div>
                                            <span style={{ fontSize: "0.7rem", display: "block" }}>{person.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="providers-section">
                        <h4 style={{ marginBottom: "1rem" }}>Where to Watch</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            {providers?.flatrate ? (
                                <div>
                                    <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Streaming</span>
                                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                                        {providers.flatrate.map((p: any) => (
                                            <img
                                                key={p.provider_id}
                                                src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                                                alt={p.provider_name}
                                                style={{ width: "40px", height: "40px", borderRadius: "8px" }}
                                                title={p.provider_name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No streaming options found in your region.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          overflow-y: auto;
          padding: 2rem 0;
        }
        .modal-content {
          background: #181818;
          width: 90%;
          max-width: 900px;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 50px rgba(0,0,0,1);
        }
        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #181818;
          color: white;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        .hero-content-modal {
          position: absolute;
          bottom: 2rem;
          left: 2rem;
          z-index: 1;
        }
        .hero-content-modal h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
      `}</style>
        </div>
    );
}
