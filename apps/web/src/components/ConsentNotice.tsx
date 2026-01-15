"use client";

import React, { useState, useEffect } from "react";

export default function ConsentNotice() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Client-side only check
        if (typeof window !== "undefined") {
            const consent = localStorage.getItem("film_for_you_consent");
            if (!consent) {
                setIsVisible(true);
            }
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("film_for_you_consent", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="consent-notice">
            <h3>Your Privacy Matters</h3>
            <p>
                We use your movie preferences to provide better recommendations. By using this platform, you agree to our data collection practices as outlined in our Privacy Policy.
            </p>
            <div className="consent-buttons">
                <button onClick={handleAccept} className="btn btn-primary btn-block">Accept</button>
                <button className="btn btn-secondary btn-block">Learn More</button>
            </div>
        </div>
    );
}
