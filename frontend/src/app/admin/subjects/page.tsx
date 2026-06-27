"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subjectsService } from "@/services/subjects";
import { teachersService } from "@/services/teachers";
import toast from "react-hot-toast";

export default function AdminSubjectsPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [teacher, setTeacher] = useState("");
  const [semester, setSemester] = useState("");
  const [department, setDepartment] = useState("");

  // Fetch Subjects
  const { data: subjectsData, isLoading: loadingSubjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectsService.getSubjects(),
  });

  // Fetch Teachers
  const { data: teachersData, isLoading: loadingTeachers } = useQuery({
    queryKey: ["teachersList"],
    queryFn: () => teachersService.getTeachers({ limit: 100 }),
  });

  // Create Subject Mutation
  const createMutation = useMutation({
    mutationFn: subjectsService.createSubject,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Subject created successfully");
        setShowAddModal(false);
        // Reset form
        setName("");
        setCode("");
        setTeacher("");
        setSemester("");
        setDepartment("");
        queryClient.invalidateQueries({ queryKey: ["subjects"] });
      } else {
        toast.error(res.message || "Failed to create subject");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create subject");
    },
  });

  // Delete Subject Mutation
  const deleteMutation = useMutation({
    mutationFn: subjectsService.deleteSubject,
    onSuccess: () => {
      toast.success("Subject deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete subject");
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete subject "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !teacher || !semester || !department) {
      toast.error("Please fill in all fields");
      return;
    }
    createMutation.mutate({ name, code, teacher, semester, department });
  };

  const subjects = subjectsData?.data || [];
  const teachers = teachersData?.data?.users || [];

  return (
    <div className="animate-fade-in" style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 className="title-xl">Manage Subjects</h1>
          <p className="text-muted">Register academic courses and assign them to teachers.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          + Add Subject
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
        {loadingSubjects ? (
          <div style={{ padding: "3rem", textAlign: "center" }} className="text-muted">Loading subjects...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--c-surface-hover)" }}>
                <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Code</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Name</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Teacher</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Department / Semester</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub: any) => (
                <tr key={sub._id} style={{ borderBottom: "1px solid var(--c-surface-border)" }}>
                  <td style={{ padding: "1rem", fontWeight: 700 }}>{sub.code}</td>
                  <td style={{ padding: "1rem", fontWeight: 500 }}>{sub.name}</td>
                  <td style={{ padding: "1rem" }}>{sub.teacher?.name || "-"}</td>
                  <td style={{ padding: "1rem" }} className="text-muted">
                    {sub.department} ({sub.semester})
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <button
                      onClick={() => handleDelete(sub._id, sub.name)}
                      className="btn btn-outline"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", color: "var(--c-danger)", borderColor: "rgba(239, 68, 68, 0.2)" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem", textAlign: "center" }} className="text-muted">
                    No subjects registered yet. Click "+ Add Subject" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
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
            <h2 className="title-lg" style={{ marginBottom: "1.5rem" }}>Add Subject</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="subCode">Subject Code</label>
                <input
                  type="text"
                  id="subCode"
                  className="form-input"
                  placeholder="e.g. CS101"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subName">Subject Name</label>
                <input
                  type="text"
                  id="subName"
                  className="form-input"
                  placeholder="e.g. Programming in C++"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subTeacher">Assign Teacher</label>
                <select
                  id="subTeacher"
                  className="form-input"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  required
                >
                  <option value="">Select teacher...</option>
                  {teachers.map((t: any) => (
                    <option key={t._id} value={t._id}>{t.name} ({t.department})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subDept">Department</label>
                <select
                  id="subDept"
                  className="form-input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Select department...</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subSem">Semester</label>
                <select
                  id="subSem"
                  className="form-input"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  required
                >
                  <option value="">Select semester...</option>
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                  disabled={createMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Adding..." : "Add Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
