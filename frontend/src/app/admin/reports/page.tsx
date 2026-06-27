"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance";
import { subjectsService } from "@/services/subjects";
import toast from "react-hot-toast";

export default function AdminReportsPage() {
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch subjects for filtering
  const { data: subjectsData } = useQuery({
    queryKey: ["filterSubjects", { department, semester }],
    queryFn: () => subjectsService.getSubjects({ department: department || undefined, semester: semester || undefined }),
  });

  // Fetch report data
  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ["adminReports", { department, semester, subjectId, startDate, endDate }],
    queryFn: () =>
      attendanceService.getReports({
        department: department || undefined,
        semester: semester || undefined,
        subjectId: subjectId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const handleExportCSV = async () => {
    try {
      const data = await attendanceService.getReports(
        {
          department: department || undefined,
          semester: semester || undefined,
          subjectId: subjectId || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
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
  const subjects = subjectsData?.data || [];

  return (
    <div className="animate-fade-in" style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 className="title-xl">System Reports</h1>
          <p className="text-muted">Generate and export attendance history for institutions.</p>
        </div>
        <button onClick={handleExportCSV} className="btn btn-primary" disabled={records.length === 0}>
          Export CSV
        </button>
      </div>

      {/* Filter panel */}
      <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Department</label>
          <select className="form-input" value={department} onChange={(e) => { setDepartment(e.target.value); setSubjectId(""); }}>
            <option value="">All</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Semester</label>
          <select className="form-input" value={semester} onChange={(e) => { setSemester(e.target.value); setSubjectId(""); }}>
            <option value="">All</option>
            <option value="Semester 1">Semester 1</option>
            <option value="Semester 2">Semester 2</option>
            <option value="Semester 3">Semester 3</option>
            <option value="Semester 4">Semester 4</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Subject</label>
          <select className="form-input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">All</option>
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
                    No reports match the selected criteria.
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
