import { API_URL } from "@/lib/config";

export const trackEvent = (eventName: string, params: any = {}) => {
    // Baseline logic for analytics (e.g., GA4, Mixpanel, or custom endpoint)
    // For now, we'll log to console or a backend endpoint
    console.log(`[Analytics] Event: ${eventName}`, params);

    const token = typeof window !== "undefined" ? localStorage.getItem("film_for_you_token") : null;
    if (token) {
        // Option: Send to backend for long-term behavioral analysis
        /*
        fetch(`${API_URL}/api/analytics/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ event: eventName, ...params, timestamp: new Date() })
        }).catch(() => {});
        */
    }
};
