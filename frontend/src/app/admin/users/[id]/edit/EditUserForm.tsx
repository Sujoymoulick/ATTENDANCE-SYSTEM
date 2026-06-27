"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function EditUserForm({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  // Fetch User details
  const { data, isLoading, error } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await api.get(`/users/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Populate state on load
  useEffect(() => {
    if (data?.success && data?.data) {
      const usr = data.data;
      setName(usr.name || "");
      setEmail(usr.email || "");
      setRole(usr.role || "STUDENT");
      setDepartment(usr.department || "");
      setSemester(usr.semester || "");
      setSection(usr.section || "");
      setRollNumber(usr.rollNumber || "");
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put(`/users/${id}`, payload);
      return res.data;
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("User updated successfully");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["user", id] });
        router.push("/admin/users");
      } else {
        toast.error(res.message || "Failed to update user");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update user");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload: any = { name, email, role };
    if (role === "TEACHER") {
      payload.department = department;
      payload.semester = "";
      payload.section = "";
      payload.rollNumber = "";
    } else if (role === "STUDENT") {
      payload.department = department;
      payload.semester = semester;
      payload.section = section;
      payload.rollNumber = rollNumber;
    } else {
      payload.department = "";
      payload.semester = "";
      payload.section = "";
      payload.rollNumber = "";
    }

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return <p className="text-muted">Loading user profile...</p>;
  }

  if (error) {
    return <p className="text-muted" style={{ color: "var(--c-danger)" }}>Failed to load user info.</p>;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: "600px" }}>
      <h1 className="title-xl">Edit User</h1>
      <p className="text-muted" style={{ marginBottom: "2rem" }}>Update account details for {name}.</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div className="glass-panel">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Role</label>
            <select
              id="role"
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              disabled={updateMutation.isPending}
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {role !== "ADMIN" && (
            <div className="form-group">
              <label className="form-label" htmlFor="department">Department</label>
              <select
                id="department"
                className="form-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                disabled={updateMutation.isPending}
              >
                <option value="">Select department...</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
              </select>
            </div>
          )}

          {role === "STUDENT" && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="semester">Semester</label>
                <select
                  id="semester"
                  className="form-input"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  required
                  disabled={updateMutation.isPending}
                >
                  <option value="">Select semester...</option>
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="section">Section</label>
                <input
                  type="text"
                  id="section"
                  className="form-input"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  required
                  disabled={updateMutation.isPending}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="rollNumber">Roll Number</label>
                <input
                  type="text"
                  id="rollNumber"
                  className="form-input"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                  disabled={updateMutation.isPending}
                />
              </div>
            </>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
          <button
            type="button"
            onClick={() => router.back()}
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
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
