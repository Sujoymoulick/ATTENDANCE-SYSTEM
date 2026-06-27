"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { subjectsService } from "@/services/subjects";
import { attendanceService } from "@/services/attendance";
import { useAuth } from "@/store/AuthContext";
import toast from "react-hot-toast";

function HistoryContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [subjectId, setSubjectId] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<"Present" | "Absent" | "Late">("Present");
  const [editRemarks, setEditRemarks] = useState("");

  // Pre-populate subjectId from query param if available
  useEffect(() => {
    const sub = searchParams.get("subjectId");
    if (sub) setSubjectId(sub);
  }, [searchParams]);

  // Fetch subjects taught by this teacher
  const { data: subjectsData } = useQuery({
    queryKey: ["teacherSubjectsHistory", user?.id],
    queryFn: () => subjectsService.getSubjects({ teacher: user?.id }),
    enabled: !!user?.id,
  });

  const subjects = subjectsData?.data || [];

  // Fetch history list for selected subject
  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ["subjectHistoryList", subjectId],
    queryFn: () => attendanceService.getSubjectHistory(subjectId),
    enabled: !!subjectId,
  });

  const history = historyData?.data?.history || [];
  const subjectObj = historyData?.data?.subject || null;

  // Fetch class details for selected date (when looking at roster on that day)
  const { data: classDetailsData, isLoading: loadingDetails } = useQuery({
    queryKey: ["classHistoryDetails", { subjectId, date: selectedDate }],
    queryFn: () => attendanceService.getClassAttendance(subjectId, selectedDate!),
    enabled: !!subjectId && !!selectedDate,
  });

  const roster = classDetailsData?.data?.attendance || [];

  // Update Record Mutation (triggers Audit Log)
  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; status: string; remarks: string }) => {
      return attendanceService.updateAttendance(payload.id, {
        status: payload.status,
        remarks: payload.remarks,
      });
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Attendance updated and audit log saved!");
        setEditingRecord(null);
        setEditRemarks("");
        queryClient.invalidateQueries({ queryKey: ["classHistoryDetails"] });
        queryClient.invalidateQueries({ queryKey: ["subjectHistoryList"] });
      } else {
        toast.error(res.message || "Failed to update record");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update record");
    },
  });

  const handleEditClick = (record: any) => {
    setEditingRecord(record);
    setNewStatus(record.status === "Not Marked" ? "Present" : record.status);
    setEditRemarks("");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRemarks.trim()) {
      toast.error("Please provide a reason/remark for editing attendance");
      return;
    }
    if (!editingRecord.attendanceId) {
      toast.error("No marked attendance record found for this student. You can mark them by visiting Mark Attendance.");
      return;
    }

    updateMutation.mutate({
      id: editingRecord.attendanceId,
      status: newStatus,
      remarks: editRemarks,
    });
  };

  return (
    <div className="animate-fade-in" style={{ padding: "1rem" }}>
      <h1 className="title-xl">Attendance History</h1>
      <p className="text-muted" style={{ marginBottom: "2rem" }}>Review previous attendance lists and update records with audit logs.</p>

      {/* Select Subject */}
      <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem", maxWidth: "400px" }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Subject</label>
          <select className="form-input" value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setSelectedDate(null); }} required>
            <option value="">Select subject...</option>
            {subjects.map((sub: any) => (
              <option key={sub._id} value={sub._id}>{sub.code} - {sub.name}</option>
            ))}
          </select>
        </div>
      </div>

      {subjectId && (
        <div style={{ display: "grid", gridTemplateColumns: selectedDate ? "1fr 2fr" : "1fr", gap: "2rem" }}>
          {/* History Dates List */}
          <div>
            <h3 className="title-lg" style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Marked Classes</h3>
            <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
              {loadingHistory ? (
                <p style={{ padding: "1.5rem" }} className="text-muted">Loading history...</p>
              ) : history.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {history.map((h: any) => {
                    const formattedDate = new Date(h.date).toISOString().split("T")[0];
                    const isActive = selectedDate === formattedDate;
                    return (
                      <button
                        key={h.date}
                        onClick={() => setSelectedDate(formattedDate)}
                        style={{
                          background: isActive ? "var(--c-surface-hover)" : "transparent",
                          border: "none",
                          borderBottom: "1px solid var(--c-surface-border)",
                          color: "var(--c-text-main)",
                          padding: "1rem",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "background var(--transition-fast)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <strong style={{ display: "block" }}>{formattedDate}</strong>
                          <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                            P: {h.present} | A: {h.absent} | L: {h.late}
                          </span>
                        </div>
                        <span style={{ color: "var(--c-primary)", fontSize: "0.85rem" }}>View &rarr;</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p style={{ padding: "2rem", textAlign: "center" }} className="text-muted">No attendance marked for this subject.</p>
              )}
            </div>
          </div>

          {/* Roster Details */}
          {selectedDate && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
                <h3 className="title-lg" style={{ fontSize: "1.2rem", margin: 0 }}>Roster for {selectedDate}</h3>
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                  Course: <strong>{subjectObj?.name} ({subjectObj?.code})</strong>
                </span>
              </div>

              <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
                {loadingDetails ? (
                  <p style={{ padding: "1.5rem" }} className="text-muted">Loading roster details...</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "var(--c-surface-hover)" }}>
                        <th style={{ padding: "0.8rem 1rem" }}>Roll No</th>
                        <th style={{ padding: "0.8rem 1rem" }}>Student</th>
                        <th style={{ padding: "0.8rem 1rem" }}>Status</th>
                        <th style={{ padding: "0.8rem 1rem" }}>Remarks</th>
                        <th style={{ padding: "0.8rem 1rem", textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map((r: any) => (
                        <tr key={r.studentId} style={{ borderBottom: "1px solid var(--c-surface-border)" }}>
                          <td style={{ padding: "0.8rem 1rem" }} className="text-muted">{r.rollNumber}</td>
                          <td style={{ padding: "0.8rem 1rem", fontWeight: 500 }}>{r.name}</td>
                          <td style={{ padding: "0.8rem 1rem" }}>
                            <span className={`badge ${r.status === "Present" ? "badge-success" : r.status === "Absent" ? "badge-danger" : r.status === "Late" ? "badge-warning" : "text-muted"}`}>
                              {r.status}
                            </span>
                          </td>
                          <td style={{ padding: "0.8rem 1rem" }} className="text-muted">{r.remarks || "-"}</td>
                          <td style={{ padding: "0.8rem 1rem", textAlign: "right" }}>
                            {r.attendanceId ? (
                              <button
                                onClick={() => handleEditClick(r)}
                                className="btn btn-outline"
                                style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                              >
                                Edit
                              </button>
                            ) : (
                              <span className="text-muted" style={{ fontSize: "0.8rem" }}>Unmarked</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: "100%", maxWidth: "500px", padding: "2rem", background: "var(--c-bg)" }}>
            <h2 className="title-lg" style={{ marginBottom: "0.5rem" }}>Edit Attendance Record</h2>
            <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
              Updating attendance status for <strong>{editingRecord.name}</strong>. All changes are logged for auditing.
            </p>

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select
                  className="form-input"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  required
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Edit (Required Audit Log)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Student arrived late, system entry error"
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="btn btn-outline"
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Change"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading content...</p>}>
      <HistoryContent />
    </Suspense>
  );
}
