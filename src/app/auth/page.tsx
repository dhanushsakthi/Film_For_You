"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
        try {
            const res = await fetch(`http://localhost:5000${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Something went wrong");

            localStorage.setItem("film_for_you_token", data.token);
            localStorage.setItem("user_profiles", JSON.stringify(data.user.profiles));
            router.push("/");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-overlay"></div>
            <div className="auth-card">
                <h1>{isLogin ? "Sign In" : "Sign Up"}</h1>
                {error && <p className="error-msg">{error}</p>}
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
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">
                        {isLogin ? "Sign In" : "Get Started"}
                    </button>
                </form>
                <div className="auth-footer">
                    <p>
                        {isLogin ? "New to Film For You?" : "Already have an account?"}
                        <button onClick={() => setIsLogin(!isLogin)} className="link-btn">
                            {isLogin ? "Sign up now." : "Sign in now."}
                        </button>
                    </p>
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
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
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
        h1 {
          color: white;
          margin-bottom: 28px;
          font-size: 2rem;
        }
        .input-group {
          margin-bottom: 16px;
        }
        input {
          width: 100%;
          padding: 16px 20px;
          background: #333;
          border-radius: 4px;
          border: none;
          color: white;
          font-size: 1rem;
        }
        .btn-block {
          width: 100%;
          padding: 16px;
          margin-top: 24px;
          font-size: 1rem;
          font-weight: 700;
        }
        .auth-footer {
          margin-top: 50px;
          color: #737373;
        }
        .link-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1rem;
          margin-left: 5px;
        }
        .error-msg {
          color: #e87c03;
          background: rgba(232, 124, 3, 0.1);
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }
      `}</style>
        </main>
    );
}
