import { NextResponse } from 'next/server';

const GEN_AI_KEY = process.env.GEMINI_API_KEY;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

// --- Tool Implementations ---

async function searchMovies(query: string) {
    if (!TMDB_API_KEY) return [];
    try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`);
        const data = await res.json();
        return data.results.slice(0, 5).map((m: any) => ({
            id: m.id,
            title: m.title,
            release_date: m.release_date,
            poster_path: m.poster_path
        }));
    } catch (e) { return []; }
}

async function getMovieDetails(id: number) {
    if (!TMDB_API_KEY) return null;
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
        return await res.json();
    } catch (e) { return null; }
}

async function getTrending() {
    if (!TMDB_API_KEY) return [];
    try {
        const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        return data.results.slice(0, 5);
    } catch (e) { return []; }
}

async function getTopRated() {
    if (!TMDB_API_KEY) return [];
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        return data.results.slice(0, 5);
    } catch (e) { return []; }
}

// --- Main Chat Handler ---

export async function POST(req: Request) {
    if (!GEN_AI_KEY) {
        return NextResponse.json({
            message: "Gemini API key not configured. I'm currently in search mode.",
            movies: []
        });
    }

    try {
        const { message, profileId, language } = await req.json();

        // 1. Construct Initial Prompt
        const systemPrompt = `
            You are "Film For You", a premium movie discovery AI.
            User preferred language: ${language || "en-US"}.
            User Message: ${message}

            Available Tools:
            - search_movie(query): Search for movies by title.
            - get_trending(): Get currently trending movies.
            - get_top_rated(): Get top rated movies.

            Decision Logic:
            1. If the user asks for a specific movie or recommendation, decide if you need to call a tool.
            2. To call a tool, respond with a JSON object in this format: {"tool": "tool_name", "args": {...}}.
            3. If you have enough info, respond with a helpful message.
        `;

        // 2. Call Gemini
        const initialRes = await fetch(`${GEMINI_API_URL}?key=${GEN_AI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
        });
        const initialData = await initialRes.json();
        const aiText = initialData.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // 3. Check for Tool Call
        if (aiText.includes('{"tool"')) {
            try {
                const toolMatch = aiText.match(/\{"tool".*\}/);
                if (toolMatch) {
                    const toolCall = JSON.parse(toolMatch[0]);
                    let toolResult: any = null;
                    let movies: any[] = [];

                    // Execute Tool
                    if (toolCall.tool === "search_movie") {
                        toolResult = await searchMovies(toolCall.args.query);
                        movies = toolResult;
                    } else if (toolCall.tool === "get_trending") {
                        toolResult = await getTrending();
                        movies = toolResult;
                    } else if (toolCall.tool === "get_top_rated") {
                        toolResult = await getTopRated();
                        movies = toolResult;
                    }

                    // 4. Follow-up with Tool Result
                    const followUpPrompt = `
                        The tool ${toolCall.tool} returned: ${JSON.stringify(toolResult)}
                        Now provide the final recommendation to the user in their preferred language.
                    `;

                    const finalRes = await fetch(`${GEMINI_API_URL}?key=${GEN_AI_KEY}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [
                                { parts: [{ text: systemPrompt }] },
                                { parts: [{ text: aiText }] },
                                { parts: [{ text: followUpPrompt }] }
                            ]
                        })
                    });
                    const finalData = await finalRes.json();
                    const finalText = finalData.candidates?.[0]?.content?.parts?.[0]?.text || "Here are some movies I found.";

                    return NextResponse.json({ message: finalText, movies });
                }
            } catch (e) {
                console.error("Tool execution failed", e);
            }
        }

        // Default response if no tool call
        return NextResponse.json({ message: aiText, movies: [] });

    } catch (error) {
        console.error("AI Chat Error:", error);
        return NextResponse.json({ message: "I'm having trouble connecting right now.", movies: [] }, { status: 500 });
    }
}
