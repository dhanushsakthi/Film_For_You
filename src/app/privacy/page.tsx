"use client";

import { useState, useEffect } from "react";

export default function PrivacyPage() {
    const [hasConsent, setHasConsent] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("film_for_you_consent");
        setHasConsent(consent === "true");
    }, []);

    const clearData = () => {
        localStorage.removeItem("film_for_you_consent");
        localStorage.removeItem("selected_profile"); // Hypothetical
        setHasConsent(false);
        alert("All your data has been deleted.");
    };

    return (
        <main style={{ padding: "4% 10%", display: "flex", flexDirection: "column", gap: "2rem" }}>
            <h1 style={{ fontSize: "3rem", color: "var(--accent)" }}>Data Privacy & Preferences</h1>

            <section style={{ backgroundColor: "var(--card-bg)", padding: "2rem", borderRadius: "8px" }}>
                <h2>Your Data Profile</h2>
                <p style={{ color: "var(--muted)", marginTop: "1rem" }}>
                    Consent Status: <span style={{ color: hasConsent ? "var(--accent)" : "white" }}>
                        {hasConsent ? "Accepted" : "Not Provided"}
                    </span>
                </p>
                <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
                    We currently only store your profile selection and consent status locally in your browser.
                </p>
            </section>

            <section style={{ backgroundColor: "var(--card-bg)", padding: "2rem", borderRadius: "8px" }}>
                <h2>Manage My Data</h2>
                <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
                    You can request to delete all local data we have about your preferences.
                </p>
                <button
                    onClick={clearData}
                    className="btn"
                    style={{ backgroundColor: "black", color: "var(--accent)", border: "1px solid var(--accent)" }}
                >
                    Delete All Personal Data
                </button>
            </section>

            <a href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>&larr; Back to Home</a>
        </main>
    );
}
