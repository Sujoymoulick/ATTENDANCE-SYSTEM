"use client";

import { useQuery } from "@tanstack/react-query";
import { subjectsService } from "@/services/subjects";
import { useAuth } from "@/store/AuthContext";
import Link from "next/link";

export default function TeacherDashboardPage() {
  const { user } = useAuth();

  // Fetch subjects assigned to this teacher
  const { data: subjectsData, isLoading } = useQuery({
    queryKey: ["teacherSubjects", user?.id],
    queryFn: () => subjectsService.getSubjects({ teacher: user?.id }),
    enabled: !!user?.id,
  });

  const subjects = subjectsData?.data || [];

  return (
    <div className="animate-fade-in" style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="title-xl">Welcome, {user?.name || "Teacher"}</h1>
          <p className="text-muted">Manage classes, mark student presence, and review logs.</p>
        </div>
        <Link href="/teacher/mark" className="btn btn-primary">
          Mark Attendance
        </Link>
      </div>

      <h2 className="title-lg" style={{ fontSize: "1.4rem", marginBottom: "1.2rem" }}>Your Assigned Subjects</h2>

      <div className="grid-cards">
        {isLoading ? (
          <div style={{ gridColumn: "1 / -1" }} className="text-muted">Loading assigned courses...</div>
        ) : subjects.length > 0 ? (
          subjects.map((sub: any) => (
            <div key={sub._id} className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem", borderLeft: "4px solid var(--c-primary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span className="badge badge-success" style={{ fontSize: "0.75rem", background: "rgba(124, 58, 237, 0.15)", color: "var(--c-primary-light)", marginBottom: "0.25rem", display: "inline-block" }}>
                    {sub.code}
                  </span>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 600, margin: 0 }}>{sub.name}</h3>
                </div>
              </div>

              <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                <p><strong>Department:</strong> {sub.department}</p>
                <p><strong>Semester:</strong> {sub.semester}</p>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--c-surface-border)" }}>
                <Link href={`/teacher/mark?subjectId=${sub._id}&department=${sub.department}&semester=${sub.semester}`} className="btn btn-primary" style={{ flex: 1, padding: "0.5rem", fontSize: "0.85rem", justifyContent: "center" }}>
                  Mark Today
                </Link>
                <Link href={`/teacher/history?subjectId=${sub._id}`} className="btn btn-outline" style={{ flex: 1, padding: "0.5rem", fontSize: "0.85rem", justifyContent: "center" }}>
                  View History
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel text-muted" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem" }}>
            No subjects are currently assigned to you. Please contact the administrator.
          </div>
        )}
      </div>
    </div>
  );
}
