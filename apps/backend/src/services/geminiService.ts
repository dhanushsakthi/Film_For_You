import axios from "axios";
import { mcpClient } from "./mcpClient";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

export class GeminiService {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || "";
    }

    async chat(message: string, context: string, profile: any) {
        if (!this.apiKey || this.apiKey === "YOUR_GEMINI_API_KEY") {
            return {
                message: "Gemini API key not configured. I'm currently in search mode.",
                movies: []
            };
        }

        const prompt = `
            You are "Film For You", a premium movie discovery AI.
            User preferred language: ${profile?.preferredLanguage || "en-US"}.
            User Context: ${context}
            User Message: ${message}

            Available Tools:
            - search_movie(query, language): Search for movies by title.
            - get_movie_details(movie_id): Get rich details and cast.
            - get_watch_providers(movie_id, region): Get streaming services.
            - get_top_rated(genre_id, industry): Get top movies.

            Decision Logic:
            1. If the user asks for a specific movie or recommendation, decide if you need to call a tool.
            2. To call a tool, respond with a JSON object in this format: {"tool": "tool_name", "args": {...}}.
            3. If you have enough info, respond with a helpful message.
        `;

        try {
            const response = await axios.post(`${GEMINI_API_URL}?key=${this.apiKey}`, {
                contents: [{ parts: [{ text: prompt }] }]
            });

            const aiResponse = response.data.candidates[0].content.parts[0].text;

            // Basic tool call parsing logic
            if (aiResponse.includes('{"tool"')) {
                const toolCall = JSON.parse(aiResponse.match(/\{"tool".*\}/)[0]);
                const toolResult = await mcpClient.callTool(toolCall.tool, toolCall.args);

                // Follow up with tool result
                const followUpPrompt = `
                    The tool ${toolCall.tool} returned: ${JSON.stringify(toolResult.content)}
                    Now provide the final recommendation to the user in their preferred language (${profile?.preferredLanguage || "en-US"}).
                `;

                const finalResponse = await axios.post(`${GEMINI_API_URL}?key=${this.apiKey}`, {
                    contents: [
                        { parts: [{ text: prompt }] },
                        { parts: [{ text: aiResponse }] },
                        { parts: [{ text: followUpPrompt }] }
                    ]
                });

                return this.parseFinalResponse(finalResponse.data.candidates[0].content.parts[0].text);
            }

            return { message: aiResponse, movies: [] };
        } catch (error: any) {
            console.error("Gemini AI Error:", error.response?.data || error.message);
            return { message: "Sorry, I'm having trouble thinking right now. Let me try a basic search.", movies: [] };
        }
    }

    private parseFinalResponse(text: string) {
        // In a real scenario, we'd ask Gemini to return JSON. 
        // For now, we'll return the text as a message.
        return { message: text, movies: [] };
    }
}

export const geminiService = new GeminiService();
