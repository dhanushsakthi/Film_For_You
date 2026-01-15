import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

if (!TMDB_API_KEY) {
    console.error("TMDB_API_KEY is required");
    process.exit(1);
}

const server = new Server(
    {
        name: "movie-discovery-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

const tmdbClient = axios.create({
    baseURL: TMDB_BASE_URL,
    params: {
        api_key: TMDB_API_KEY,
    },
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "search_movie",
                description: "Search for a movie by title",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: { type: "string" },
                        language: { type: "string" },
                    },
                    required: ["query"],
                },
            },
            {
                name: "get_movie_details",
                description: "Get detailed information about a movie including cast and ratings",
                inputSchema: {
                    type: "object",
                    properties: {
                        movie_id: { type: "number" },
                    },
                    required: ["movie_id"],
                },
            },
            {
                name: "get_watch_providers",
                description: "Get available streaming providers for a movie by region",
                inputSchema: {
                    type: "object",
                    properties: {
                        movie_id: { type: "number" },
                        region: { type: "string", description: "ISO 3166-1 country code (e.g. US, IN)" },
                    },
                    required: ["movie_id", "region"],
                },
            },
            {
                name: "get_top_rated",
                description: "Get top rated movies by genre and industry",
                inputSchema: {
                    type: "object",
                    properties: {
                        genre_id: { type: "number" },
                        industry: { type: "string", description: "e.g. Hollywood, Bollywood" },
                    },
                    required: ["genre_id"],
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (name === "search_movie") {
            const response = await tmdbClient.get("/search/movie", {
                params: { query: args?.query, language: args?.language || "en-US" },
            });
            return {
                content: [{ type: "text", text: JSON.stringify(response.data.results) }],
            };
        }

        if (name === "get_movie_details") {
            const response = await tmdbClient.get(`/movie/${args?.movie_id}`, {
                params: { append_to_response: "videos,credits" },
            });
            return {
                content: [{ type: "text", text: JSON.stringify(response.data) }],
            };
        }

        if (name === "get_watch_providers") {
            const response = await tmdbClient.get(`/movie/${args?.movie_id}/watch/providers`);
            const providers = response.data.results[args?.region as string] || {};
            return {
                content: [{ type: "text", text: JSON.stringify(providers) }],
            };
        }

        if (name === "get_top_rated") {
            const response = await tmdbClient.get("/discover/movie", {
                params: {
                    with_genres: args?.genre_id,
                    sort_by: "vote_average.desc",
                    "vote_count.gte": 1000,
                },
            });
            return {
                content: [{ type: "text", text: JSON.stringify(response.data.results) }],
            };
        }

        throw new Error(`Tool not found: ${name}`);
    } catch (error: any) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Movie Discovery MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
