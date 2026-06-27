"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/store/AuthContext";
import { subjectsService } from "@/services/subjects";
import { attendanceService } from "@/services/attendance";
import toast from "react-hot-toast";

export default function TeacherReportsPage() {
  const { user } = useAuth();
  const [subjectId, setSubjectId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch subjects taught by this teacher (for dropdown selection)
  const { data: subjectsData } = useQuery({
    queryKey: ["teacherSubjectsReports", user?.id],
    queryFn: () => subjectsService.getSubjects({ teacher: user?.id }),
    enabled: !!user?.id,
  });

  const subjects = subjectsData?.data || [];

  // Fetch report data
  const { data: reportData, isLoading } = useQuery({
    queryKey: ["teacherReports", { subjectId, startDate, endDate }],
    queryFn: () =>
      attendanceService.getReports({
        subjectId: subjectId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        // If no subject selected, constraint search by all teacher subjects
        subjectIds: subjectId ? undefined : subjects.map((s: any) => s._id).join(","),
      }),
    enabled: subjects.length > 0,
  });

  const handleExportCSV = async () => {
    try {
      const data = await attendanceService.getReports(
        {
          subjectId: subjectId || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          subjectIds: subjectId ? undefined : subjects.map((s: any) => s._id).join(","),
        },
        "csv"
      );
      
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("CSV report exported successfully!");
    } catch (err: any) {
      toast.error("Failed to export CSV report");
    }
  };

  const records = reportData?.data || [];

  return (
    <div className="animate-fade-in" style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 className="title-xl">Attendance Reports</h1>
          <p className="text-muted">Export csv files or filter records for courses you teach.</p>
        </div>
        <button onClick={handleExportCSV} className="btn btn-primary" disabled={records.length === 0}>
          Export CSV
        </button>
      </div>

      {/* Filter panel */}
      <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Subject</label>
          <select className="form-input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">All Assigned Subjects</option>
            {subjects.map((sub: any) => (
              <option key={sub._id} value={sub._id}>{sub.code} - {sub.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Start Date</label>
          <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">End Date</label>
          <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* Results Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center" }} className="text-muted">Compiling report data...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--c-surface-hover)" }}>
                <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Date</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Student</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Roll No</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Subject</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Status</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec: any) => (
                <tr key={rec._id} style={{ borderBottom: "1px solid var(--c-surface-border)" }}>
                  <td style={{ padding: "1rem", whiteSpace: "nowrap" }}>
                    {new Date(rec.date).toISOString().split("T")[0]}
                  </td>
                  <td style={{ padding: "1rem", fontWeight: 500 }}>{rec.student?.name}</td>
                  <td style={{ padding: "1rem" }} className="text-muted">{rec.student?.rollNumber || "-"}</td>
                  <td style={{ padding: "1rem" }}>{rec.subject?.code} - {rec.subject?.name}</td>
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
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center" }} className="text-muted">
                    No records found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
