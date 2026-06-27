"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/store/AuthContext";
import { Toaster } from "react-hot-toast";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <p className="text-muted">Verifying session...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Toaster position="top-right" />
      {/* Sidebar */}
      <aside className="glass-panel" style={{ width: "260px", margin: "1rem", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h2 className="title-lg" style={{ margin: 0, fontSize: "1.8rem", fontWeight: 700 }}>Presence.</h2>
          <span className="badge badge-success" style={{ marginTop: "0.25rem", display: "inline-block" }}>Student Portal</span>
        </div>

        <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--c-surface-border)" }}>
          <p className="text-muted" style={{ fontSize: "0.85rem" }}>Logged in as:</p>
          <strong style={{ display: "block", color: "var(--c-text-main)" }}>{user?.name || "Student"}</strong>
          <span style={{ fontSize: "0.80rem", color: "var(--c-text-muted)" }}>{user?.email}</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flexGrow: 1 }}>
          <Link href="/student" className={`btn ${pathname === "/student" ? "btn-primary" : "btn-outline"}`} style={{ justifyContent: "flex-start" }}>
            My Attendance
          </Link>
          <Link href="/student/profile" className={`btn ${pathname === "/student/profile" ? "btn-primary" : "btn-outline"}`} style={{ justifyContent: "flex-start" }}>
            Student Profile
          </Link>
        </nav>

        <button onClick={logout} className="btn btn-outline" style={{ marginTop: "auto", width: "100%", justifyContent: "center" }}>
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: "1rem 2rem 1rem 0" }}>
        <div className="glass-panel" style={{ minHeight: "calc(100vh - 2rem)", borderTopLeftRadius: "0", borderBottomLeftRadius: "0" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
