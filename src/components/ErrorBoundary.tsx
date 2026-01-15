"use client";

import React, { ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#181818",
                    color: "white",
                    fontFamily: "sans-serif",
                    textAlign: "center",
                    padding: "2rem"
                }}>
                    <h1 style={{ color: "#e50914", fontSize: "3rem", marginBottom: "1rem" }}>Oops!</h1>
                    <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>Something went wrong. Even the best AIs have bad days.</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: "1rem 2rem",
                            background: "#e50914",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "1rem",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
