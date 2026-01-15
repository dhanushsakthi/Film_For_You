# Film_For_You - AI Movie Discovery Platform

Film_For_You is a premium, OTT-inspired movie discovery platform that uses AI to provide personalized recommendations.

## Features

- **AI Recommendations**: Personalized movie suggestions based on natural language queries, chat, and user preferences.
- **Voice Commands**: Search and explore movies using your voice.
- **Multi-Profile Management**: Create and manage adult and kids' profiles, each with its own watchlist and history.
- **Production-Ready Backend**:
  - **In-Memory Caching**: Reduced API latency and TMDB request load.
  - **Secure Authentication**: JWT-based auth with a centralized middleware.
  - **Age-Based Filtering**: Content automatically filtered based on profile maturity limits.
- **Premium UI/UX**:
  - **Skeleton Loaders**: Smooth transitions during data fetching.
  - **Responsive Design**: Optimized for desktop, tablet, and mobile.
  - **OTT Dark Theme**: Immersive, Netflix-inspired aesthetic.

## Tech Stack

- **Frontend**: Next.js (App Router), Vanilla CSS
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **AI/MCP**: Gemini Pro + Model Context Protocol (MCP) for tool-driven discovery
- **Infrastructure**: Docker & Docker Compose

## Features (New in v2.0)

- **Interactive Media**: Watch official trailers for movies directly within the app.
- **Social Sharing**: Share your favorite discoveries via the Web Share API or copy-link fallback.
- **PWA Ready**: Installable on mobile/desktop with offline-ready manifest.
- **SEO Optimized**: Rich OpenGraph and Twitter meta tags for premium previews.
- **Mission-Critical Stability**: Global Error Boundaries, Health Checks, and Loading States.

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (optional but recommended)
- TMDB API Key
- Gemini API Key

### Running with Docker (Recommended)

1.  **Configure environment variables**: Create a `.env` in the root with `TMDB_API_KEY`, `MONGODB_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.
2.  **Launch the ecosystem**:
    ```bash
    docker compose up --build
    ```
3.  **Explore**:
    - App: `http://localhost:3000`
    - API Health: `http://localhost:5000/api/health`

### Manual Setup

1.  **Install dependencies**: Run `npm install` in the root (or individually in `apps/*`).
2.  **Start Services**:
    - **MCP**: `npm run dev` in `apps/mcp-server`
    - **Backend**: `npm run dev` in `apps/backend`
    - **Frontend**: `npm run dev` in `apps/web`

## License
MIT
