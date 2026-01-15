"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send reset link");
            setMessage("A reset link has been sent to your email.");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-overlay"></div>
            <div className="auth-card">
                <h1>Forgot Password</h1>
                <p className="description">Enter your email and we'll send you a link to reset your password.</p>
                {error && <p className="error-msg">{error}</p>}
                {message && <p className="success-msg">{message}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <div className="auth-footer">
                    <button onClick={() => router.push("/auth")} className="link-btn">
                        Back to Login
                    </button>
                </div>
            </div>

            <style jsx>{`
                .auth-page {
                    height: 100vh;
                    width: 100%;
                    background: url('https://image.tmdb.org/t/p/original/kRE9YmgYvUInWp96XU6XG69888c.jpg') center/cover no-repeat;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .auth-overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    background-image: linear-gradient(to top, rgba(0,0,0,0.8) 0, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%);
                }
                .auth-card {
                    position: relative;
                    z-index: 1;
                    background: rgba(0, 0, 0, 0.75);
                    padding: 60px;
                    border-radius: 4px;
                    width: 100%;
                    max-width: 450px;
                }
                h1 { color: white; margin-bottom: 20px; font-size: 2rem; }
                .description { color: #b3b3b3; margin-bottom: 30px; line-height: 1.5; }
                .input-group { margin-bottom: 16px; }
                input {
                    width: 100%; padding: 16px 20px;
                    background: #333; border-radius: 4px; border: none;
                    color: white; font-size: 1rem;
                }
                .btn-block {
                    width: 100%; padding: 16px; margin-top: 24px;
                    font-size: 1rem; font-weight: 700;
                    background: #e50914; color: white; border: none; border-radius: 4px; cursor: pointer;
                }
                .btn-block:disabled { opacity: 0.5; cursor: not-allowed; }
                .auth-footer { margin-top: 30px; text-align: center; }
                .link-btn { background: none; border: none; color: white; cursor: pointer; font-size: 1rem; }
                .error-msg { color: #e87c03; background: rgba(232, 124, 3, 0.1); padding: 10px; border-radius: 4px; margin-bottom: 20px; font-size: 0.9rem; }
                .success-msg { color: #46d369; background: rgba(70, 211, 105, 0.1); padding: 10px; border-radius: 4px; margin-bottom: 20px; font-size: 0.9rem; }
            `}</style>
        </main>
    );
}
