"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("http://localhost:5000/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to reset password");
            setMessage("Password reset successfully! Redirecting to login...");
            setTimeout(() => router.push("/auth"), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return <p className="error-msg">Invalid or missing reset token.</p>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="input-group">
                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div className="input-group">
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
            </button>
            {error && <p className="error-msg">{error}</p>}
            {message && <p className="success-msg">{message}</p>}
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className="auth-page">
            <div className="auth-overlay"></div>
            <div className="auth-card">
                <h1>Reset Password</h1>
                <Suspense fallback={<p>Loading...</p>}>
                    <ResetPasswordForm />
                </Suspense>
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
                .error-msg { color: #e87c03; background: rgba(232, 124, 3, 0.1); padding: 10px; border-radius: 4px; margin-top: 20px; font-size: 0.9rem; }
                .success-msg { color: #46d369; background: rgba(70, 211, 105, 0.1); padding: 10px; border-radius: 4px; margin-top: 20px; font-size: 0.9rem; }
            `}</style>
        </main>
    );
}
