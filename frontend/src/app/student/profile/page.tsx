"use client";

import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance";

export default function StudentProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["studentProfile"],
    queryFn: () => attendanceService.getStudentAttendance(),
  });

  if (isLoading) {
    return <p className="text-muted">Loading profile details...</p>;
  }

  const profile = data?.data?.student;

  if (!profile) {
    return <p className="text-muted" style={{ color: "var(--c-danger)" }}>Failed to retrieve profile.</p>;
  }

  return (
    <div className="animate-fade-in" style={{ padding: "1rem", maxWidth: "600px" }}>
      <h1 className="title-xl">Student Profile</h1>
      <p className="text-muted" style={{ marginBottom: "2rem" }}>Your academic registration details.</p>

      <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", borderBottom: "1px solid var(--c-surface-border)", paddingBottom: "1rem" }}>
          <span className="form-label" style={{ fontWeight: 600 }}>Full Name</span>
          <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>{profile.name}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", borderBottom: "1px solid var(--c-surface-border)", paddingBottom: "1rem" }}>
          <span className="form-label" style={{ fontWeight: 600 }}>Email Address</span>
          <span>{profile.email}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", borderBottom: "1px solid var(--c-surface-border)", paddingBottom: "1rem" }}>
          <span className="form-label" style={{ fontWeight: 600 }}>Department</span>
          <span>{profile.department || "-"}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", borderBottom: "1px solid var(--c-surface-border)", paddingBottom: "1rem" }}>
          <span className="form-label" style={{ fontWeight: 600 }}>Semester</span>
          <span>{profile.semester || "-"}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", borderBottom: "1px solid var(--c-surface-border)", paddingBottom: "1rem" }}>
          <span className="form-label" style={{ fontWeight: 600 }}>Section</span>
          <span>{profile.section || "-"}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
          <span className="form-label" style={{ fontWeight: 600 }}>Roll Number</span>
          <span style={{ fontFamily: "monospace", letterSpacing: "0.05em", fontWeight: 700 }}>
            {profile.rollNumber || "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
