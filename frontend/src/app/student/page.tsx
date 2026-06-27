"use client";

import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance";
import toast from "react-hot-toast";

export default function StudentDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["studentAttendance"],
    queryFn: () => attendanceService.getStudentAttendance(),
  });

  const handleDownloadReport = async () => {
    try {
      const stats = data?.data;
      if (!stats?.student) return;

      const csvData = await attendanceService.getReports(
        {
          studentId: stats.student._id,
        },
        "csv"
      );

      const url = window.URL.createObjectURL(new Blob([csvData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${stats.student.name.replace(/\s+/g, "_")}_attendance.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Your attendance report has been downloaded!");
    } catch (err: any) {
      toast.error("Failed to download attendance report");
    }
  };

  if (isLoading) {
    return <p className="text-muted">Loading attendance data...</p>;
  }

  if (error || !data?.success) {
    return (
      <p className="text-muted" style={{ color: "var(--c-danger)" }}>
        Failed to load your attendance data. Ensure database connection is active.
      </p>
    );
  }

  const stats = data.data;
  const subjects = stats.subjectWiseStats || [];
  const records = stats.records || [];

  return (
    <div className="animate-fade-in" style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
        <div>
          <h1 className="title-xl">Attendance Overview</h1>
          <p className="text-muted">Review course attendance rates and details.</p>
        </div>
        <button onClick={handleDownloadReport} className="btn btn-primary" disabled={records.length === 0}>
          Download Report (CSV)
        </button>
      </div>

      {/* Main Stats Card */}
      <div className="glass-panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(16, 185, 129, 0.08)", padding: "2rem", marginBottom: "2.5rem" }}>
        <div>
          <span className="text-muted" style={{ fontSize: "1rem", display: "block" }}>Overall Attendance Percentage</span>
          <span style={{ fontSize: "3.5rem", fontWeight: 700, color: stats.overallPercentage >= 75 ? "var(--c-success)" : "var(--c-danger)" }}>
            {stats.overallPercentage}%
          </span>
          <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
            Attended <strong>{stats.grandAttended}</strong> out of <strong>{stats.grandTotal}</strong> total classes conducted.
          </p>
        </div>
        <div>
          {stats.overallPercentage >= 75 ? (
            <span className="badge badge-success" style={{ padding: "0.5rem 1.5rem", fontSize: "0.9rem" }}>On Track</span>
          ) : (
            <span className="badge badge-danger" style={{ padding: "0.5rem 1.5rem", fontSize: "0.9rem" }}>Low Attendance (Goal: 75%)</span>
          )}
        </div>
      </div>

      {/* Subject break-downs */}
      <h2 className="title-lg" style={{ fontSize: "1.4rem", marginBottom: "1.2rem" }}>Subject-wise Breakdowns</h2>
      <div className="grid-cards" style={{ marginBottom: "3rem" }}>
        {subjects.map((sub: any) => (
          <div key={sub.subjectId} className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "0.8rem", borderLeft: `4px solid ${sub.attendancePercentage >= 75 ? "var(--c-success)" : "var(--c-danger)"}` }}>
            <div>
              <span className="text-muted" style={{ fontSize: "0.75rem", display: "block" }}>{sub.code}</span>
              <strong style={{ fontSize: "1.1rem", display: "block" }}>{sub.name}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "0.5rem" }}>
              <span style={{ fontSize: "1.6rem", fontWeight: 700, color: sub.attendancePercentage >= 75 ? "var(--c-success)" : "var(--c-danger)" }}>
                {sub.attendancePercentage}%
              </span>
              <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                P: {sub.presentCount} | L: {sub.lateCount} | A: {sub.absentCount}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Roster Calendar List */}
      <h2 className="title-lg" style={{ fontSize: "1.4rem", marginBottom: "1.2rem" }}>Attendance History Calendar</h2>
      <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--c-surface-hover)" }}>
              <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Date</th>
              <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Subject</th>
              <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Teacher</th>
              <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Status</th>
              <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec: any) => (
              <tr key={rec._id} style={{ borderBottom: "1px solid var(--c-surface-border)" }}>
                <td style={{ padding: "1rem" }}>{new Date(rec.date).toISOString().split("T")[0]}</td>
                <td style={{ padding: "1rem", fontWeight: 500 }}>{rec.subject?.code} - {rec.subject?.name}</td>
                <td style={{ padding: "1rem" }} className="text-muted">{rec.teacher?.name}</td>
                <td style={{ padding: "1rem" }}>
                  <span className={`badge ${rec.status === "Present" ? "badge-success" : rec.status === "Absent" ? "badge-danger" : "badge-warning"}`}>
                    {rec.status}
                  </span>
                </td>
                <td style={{ padding: "1rem" }} className="text-muted">{rec.remarks || "-"}</td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "3rem", textAlign: "center" }} className="text-muted">
                  No attendance records exist yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
