"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { subjectsService } from "@/services/subjects";
import { attendanceService } from "@/services/attendance";
import { useAuth } from "@/store/AuthContext";
import toast from "react-hot-toast";

function MarkAttendanceContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Dropdown States
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("A");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Student Attendance Form State
  const [studentList, setStudentList] = useState<Array<{ studentId: string; name: string; rollNumber: string; section: string; status: string; remarks: string }>>([]);

  // Pre-populate if query params exist (from dashboard "Mark Today" buttons)
  useEffect(() => {
    const dept = searchParams.get("department");
    const sem = searchParams.get("semester");
    const sub = searchParams.get("subjectId");
    if (dept) setDepartment(dept);
    if (sem) setSemester(sem);
    if (sub) setSubjectId(sub);
  }, [searchParams]);

  // Fetch subjects taught by this teacher (for dropdown selection)
  const { data: subjectsData } = useQuery({
    queryKey: ["teacherSubjectsMark", user?.id],
    queryFn: () => subjectsService.getSubjects({ teacher: user?.id }),
    enabled: !!user?.id,
  });

  const subjects = subjectsData?.data || [];

  // Filter subjects based on department/semester if selected
  const filteredSubjects = subjects.filter((s: any) => {
    if (department && s.department !== department) return false;
    if (semester && s.semester !== semester) return false;
    return true;
  });

  // Pull class list and merge status
  const { data: classData, isLoading: loadingStudents, refetch } = useQuery({
    queryKey: ["classStudents", { subjectId, date }],
    queryFn: () => attendanceService.getClassAttendance(subjectId, date),
    enabled: !!subjectId && !!date,
  });

  // When classData loads, populate our local form state
  useEffect(() => {
    if (classData?.success && classData?.data?.attendance) {
      const records = classData.data.attendance;
      // Filter by section if section filter is chosen
      const list = records.map((rec: any) => ({
        studentId: rec.studentId,
        name: rec.name,
        rollNumber: rec.rollNumber || "-",
        section: rec.section || "A",
        status: rec.status === "Not Marked" ? "Present" : rec.status, // default to Present if not marked
        remarks: rec.remarks || "",
      }));
      setStudentList(list);
    }
  }, [classData]);

  // Filter by section locally
  const activeStudents = studentList.filter(s => !section || s.section === section);

  // Submit Mutation
  const saveMutation = useMutation({
    mutationFn: attendanceService.bulkMarkAttendance,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Attendance saved successfully!");
        queryClient.invalidateQueries({ queryKey: ["classStudents"] });
        queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      } else {
        toast.error(res.message || "Failed to save attendance");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Error saving attendance");
    },
  });

  const handleStatusChange = (studentId: string, status: "Present" | "Absent" | "Late") => {
    setStudentList(prev =>
      prev.map(item => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setStudentList(prev =>
      prev.map(item => (item.studentId === studentId ? { ...item, remarks } : item))
    );
  };

  const handleMarkAll = (status: "Present" | "Absent" | "Late") => {
    setStudentList(prev => prev.map(item => ({ ...item, status })));
  };

  const handleSave = () => {
    if (!subjectId) {
      toast.error("Please select a subject");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    const payload = {
      subject: subjectId,
      date,
      records: studentList.map(s => ({
        student: s.studentId,
        status: s.status,
        remarks: s.remarks,
      })),
    };

    saveMutation.mutate(payload);
  };

  return (
    <div className="animate-fade-in" style={{ padding: "1rem" }}>
      <h1 className="title-xl">Mark Attendance</h1>
      <p className="text-muted" style={{ marginBottom: "2rem" }}>Select subject parameters to fetch the student roster.</p>

      {/* Selectors Panel */}
      <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }}>
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
          <label className="form-label">Section</label>
          <select className="form-input" value={section} onChange={(e) => setSection(e.target.value)}>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Subject</label>
          <select className="form-input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
            <option value="">Select subject...</option>
            {filteredSubjects.map((sub: any) => (
              <option key={sub._id} value={sub._id}>{sub.code} - {sub.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Date</label>
          <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
      </div>

      {/* Student List View */}
      {subjectId ? (
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 className="title-lg" style={{ fontSize: "1.3rem", margin: 0 }}>Student Roster ({activeStudents.length} students)</h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => handleMarkAll("Present")} className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", color: "var(--c-success)", borderColor: "rgba(16,185,129,0.3)" }}>
                Mark All Present
              </button>
              <button onClick={() => handleMarkAll("Absent")} className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", color: "var(--c-danger)", borderColor: "rgba(239,68,68,0.3)" }}>
                Mark All Absent
              </button>
            </div>
          </div>

          {loadingStudents ? (
            <p className="text-muted">Loading class list...</p>
          ) : activeStudents.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--c-surface-border)" }}>
                    <th style={{ padding: "0.75rem 1rem" }}>Roll No</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Name</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Section</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Status</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStudents.map((s) => (
                    <tr key={s.studentId} style={{ borderBottom: "1px solid var(--c-surface-border)" }}>
                      <td style={{ padding: "1rem" }} className="text-muted">{s.rollNumber}</td>
                      <td style={{ padding: "1rem", fontWeight: 500 }}>{s.name}</td>
                      <td style={{ padding: "1rem" }} className="text-muted">{s.section}</td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.studentId, "Present")}
                            className="btn"
                            style={{
                              padding: "0.3rem 0.8rem",
                              fontSize: "0.8rem",
                              background: s.status === "Present" ? "var(--c-success)" : "rgba(16,185,129,0.1)",
                              color: s.status === "Present" ? "#fff" : "var(--c-success)",
                              border: "1px solid rgba(16,185,129,0.2)",
                            }}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.studentId, "Absent")}
                            className="btn"
                            style={{
                              padding: "0.3rem 0.8rem",
                              fontSize: "0.8rem",
                              background: s.status === "Absent" ? "var(--c-danger)" : "rgba(239,68,68,0.1)",
                              color: s.status === "Absent" ? "#fff" : "var(--c-danger)",
                              border: "1px solid rgba(239,68,68,0.2)",
                            }}
                          >
                            A
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.studentId, "Late")}
                            className="btn"
                            style={{
                              padding: "0.3rem 0.8rem",
                              fontSize: "0.8rem",
                              background: s.status === "Late" ? "var(--c-warning)" : "rgba(245,158,11,0.1)",
                              color: s.status === "Late" ? "#fff" : "var(--c-warning)",
                              border: "1px solid rgba(245,158,11,0.2)",
                            }}
                          >
                            L
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                          placeholder="e.g. sick, late bus..."
                          value={s.remarks}
                          onChange={(e) => handleRemarksChange(s.studentId, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
                <button
                  onClick={handleSave}
                  className="btn btn-primary"
                  disabled={saveMutation.isPending}
                  style={{ padding: "0.8rem 2rem" }}
                >
                  {saveMutation.isPending ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-muted" style={{ textAlign: "center", padding: "2rem" }}>No students registered in this department / semester / section.</p>
          )}
        </div>
      ) : (
        <div className="glass-panel text-muted" style={{ textAlign: "center", padding: "4rem" }}>
          Please select a Subject and Date above to load the student list.
        </div>
      )}
    </div>
  );
}

export default function MarkAttendancePage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading content...</p>}>
      <MarkAttendanceContent />
    </Suspense>
  );
}
