"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentsService } from "@/services/students";
import { teachersService } from "@/services/teachers";
import { api } from "@/lib/api"; // for generic user query if needed
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [page, setPage] = useState(1);
  const [csvText, setCsvText] = useState("");
  const [showCsvModal, setShowCsvModal] = useState(false);

  // Fetch Users
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["users", { search, role, department, semester, page }],
    queryFn: async () => {
      // Use the backend getUsers API
      const res = await api.get("/users", {
        params: {
          search,
          role: role || undefined,
          department: department || undefined,
          semester: semester || undefined,
          page,
          limit: 10,
        },
      });
      return res.data;
    },
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete user");
    },
  });

  // Bulk Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: studentsService.bulkUpload,
    onSuccess: (res) => {
      if (res.success) {
        toast.success(`Bulk upload completed! ${res.data.successCount} users created.`);
        if (res.data.failCount > 0) {
          toast.error(`${res.data.failCount} rows failed. Errors: ${res.data.errors.join("; ")}`, { duration: 6000 });
        }
        setShowCsvModal(false);
        setCsvText("");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      } else {
        toast.error(res.message || "Bulk upload failed");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Bulk upload failed");
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete user ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleBulkUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) {
      toast.error("Please enter CSV data");
      return;
    }
    uploadMutation.mutate(csvText);
  };

  const usersList = data?.data?.users || [];
  const pagination = data?.data?.pagination || { totalPages: 1, totalUsers: 0 };

  return (
    <div className="animate-fade-in" style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 className="title-xl">Manage Users</h1>
          <p className="text-muted">Register, edit, delete, or bulk upload students and teachers.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => setShowCsvModal(true)} className="btn btn-outline">
            &uarr; Bulk Upload CSV
          </button>
          <Link href="/admin/users/new" className="btn btn-primary">
            + Add User
          </Link>
        </div>
      </div>

      {/* Filter Row */}
      <div className="glass-panel" style={{ padding: "1rem", marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "1rem" }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by name, email, roll number..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select className="form-input" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
        </select>
        <select className="form-input" value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1); }}>
          <option value="">All Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
        </select>
        <select className="form-input" value={semester} onChange={(e) => { setSemester(e.target.value); setPage(1); }}>
          <option value="">All Semesters</option>
          <option value="Semester 1">Semester 1</option>
          <option value="Semester 2">Semester 2</option>
          <option value="Semester 3">Semester 3</option>
          <option value="Semester 4">Semester 4</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: "hidden", marginBottom: "1.5rem" }}>
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center" }} className="text-muted">Loading users...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--c-surface-hover)" }}>
                <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Name</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Email</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Role</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)" }}>Roll / Dept</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid var(--c-surface-border)", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((usr: any) => (
                <tr key={usr._id} style={{ borderBottom: "1px solid var(--c-surface-border)" }}>
                  <td style={{ padding: "1rem", fontWeight: 500 }}>{usr.name}</td>
                  <td style={{ padding: "1rem" }} className="text-muted">{usr.email}</td>
                  <td style={{ padding: "1rem" }}>
                    <span className={`badge ${usr.role === "ADMIN" ? "badge-danger" : usr.role === "TEACHER" ? "badge-warning" : "badge-success"}`}>
                      {usr.role}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }} className="text-muted">
                    {usr.role === "STUDENT" ? (
                      <span>Roll: {usr.rollNumber || "-"} ({usr.semester})</span>
                    ) : (
                      <span>Dept: {usr.department || "-"}</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <Link href={`/admin/users/${usr._id}/edit`} className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(usr._id, usr.name)}
                        className="btn btn-outline"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", color: "var(--c-danger)", borderColor: "rgba(239, 68, 68, 0.2)" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {usersList.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem", textAlign: "center" }} className="text-muted">
                    No users found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Row */}
      {pagination.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p className="text-muted" style={{ fontSize: "0.9rem" }}>Total Users: {pagination.totalUsers}</p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="btn btn-outline"
              style={{ padding: "0.5rem 1rem" }}
            >
              Previous
            </button>
            <span style={{ alignSelf: "center", padding: "0 1rem" }}>Page {page} of {pagination.totalPages}</span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(p => Math.min(p + 1, pagination.totalPages))}
              className="btn btn-outline"
              style={{ padding: "0.5rem 1rem" }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showCsvModal && (
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
          <div className="glass-panel animate-fade-in" style={{ width: "100%", maxWidth: "600px", padding: "2rem", background: "var(--c-bg)" }}>
            <h2 className="title-lg" style={{ marginBottom: "0.5rem" }}>Bulk CSV Student Upload</h2>
            <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
              Paste raw CSV data including headers. Required headers: <code>name, email, password, role</code>. <br />
              Optional student headers: <code>department, semester, section, rollNumber</code>.
            </p>

            <form onSubmit={handleBulkUpload}>
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <textarea
                  className="form-input"
                  style={{ height: "200px", resize: "none", fontFamily: "monospace", fontSize: "0.85rem" }}
                  placeholder="name,email,password,role,department,semester,section,rollNumber&#10;Alice Student,alice@test.com,password,STUDENT,Computer Science,Semester 1,A,CS010&#10;Bob Student,bob@test.com,password,STUDENT,Computer Science,Semester 1,A,CS011"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowCsvModal(false)}
                  className="btn btn-outline"
                  disabled={uploadMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? "Uploading..." : "Process CSV"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
