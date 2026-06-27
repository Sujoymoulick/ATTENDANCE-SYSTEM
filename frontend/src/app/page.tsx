"use client";

import Link from "next/link";
import { useAuth } from "@/store/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(`/${user.role.toLowerCase()}`);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex-center" style={{ minHeight: "100vh", padding: "2rem", flexDirection: "column" }}>
      <div className="animate-fade-in" style={{ textAlign: "center", maxWidth: "800px" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <span className="badge badge-success" style={{ background: "var(--c-primary-light)", color: "var(--c-primary-hover)" }}>v2.0 REST-API Live</span>
        </div>

        <h1 style={{ fontSize: "4.5rem", fontWeight: 700, lineHeight: 1.1, marginBottom: "1.5rem", letterSpacing: "-0.03em" }}>
          Attendance Tracking <br /> <span style={{ color: "var(--c-primary)" }}>Reimagined.</span>
        </h1>

        <p className="text-muted" style={{ fontSize: "1.2rem", marginBottom: "2.5rem", maxWidth: "600px", margin: "0 auto" }}>
          Secure, role-based attendance management with centralized SQL-like MongoDB models, bulk CSV uploading, and daily/weekly/monthly reports.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/login" className="btn btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem" }}>
            Sign In to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
