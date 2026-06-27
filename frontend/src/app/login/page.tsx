"use client";

import { useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email, password });
      if (res.success) {
        toast.success("Successfully logged in!");
      } else {
        toast.error(res.message || "Invalid credentials");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: "100vh", padding: "1rem" }}>
      <Toaster position="top-right" />
      <div className="glass-panel animate-fade-in" style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 className="title-lg" style={{ fontSize: "2.2rem", fontWeight: 700 }}>Presence.</h1>
          <p className="text-muted">Dynamic Attendance Platform</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="name@institute.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center", borderTop: "1px solid var(--c-surface-border)", paddingTop: "1.5rem" }}>
          <p className="text-muted" style={{ fontSize: "0.85rem", lineHeight: "1.6" }}>
            <strong>Test Accounts:</strong><br />
            Admin: <code>admin@test.com</code><br />
            Teacher: <code>teacher@test.com</code><br />
            Student: <code>student@test.com</code><br />
            Password: <code>password</code>
          </p>
        </div>
      </div>
    </div>
  );
}
