const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function processVoiceCommand(audioBlob: Blob): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error("Missing Gemini API Key");
    }

    try {
        // Convert Blob to Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);

        const base64Audio = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
                const result = reader.result as string;
                // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
        });

        const payload = {
            contents: [{
                parts: [{
                    text: "Listen to this audio and purely transcribe what user asked for a movie search. Return ONLY the search query text, nothing else."
                }, {
                    inline_data: {
                        mime_type: audioBlob.type || "audio/webm",
                        data: base64Audio
                    }
                }]
            }]
        };

        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Gemini API Error: ${err}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        return text ? text.trim() : "";
    } catch (error) {
        console.error("Gemini Voice Processing Error:", error);
        throw error;
    }
}
