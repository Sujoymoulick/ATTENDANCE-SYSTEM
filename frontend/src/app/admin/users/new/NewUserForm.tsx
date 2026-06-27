"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function NewUserForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/users", data);
      return res.data;
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("User created successfully");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["adminStats"] });
        router.push("/admin/users");
      } else {
        toast.error(res.message || "Failed to create user");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create user");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload: any = { name, email, password, role };
    if (role === "TEACHER") {
      payload.department = department;
    } else if (role === "STUDENT") {
      payload.department = department;
      payload.semester = semester;
      payload.section = section;
      payload.rollNumber = rollNumber;
    }

    mutation.mutate(payload);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "600px" }}>
      <h1 className="title-xl">Add User</h1>
      <p className="text-muted" style={{ marginBottom: "2rem" }}>Create a new admin, teacher, or student account.</p>

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
              disabled={mutation.isPending}
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
              disabled={mutation.isPending}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={mutation.isPending}
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
              disabled={mutation.isPending}
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
                disabled={mutation.isPending}
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
                  disabled={mutation.isPending}
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
                  placeholder="e.g. A"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  required
                  disabled={mutation.isPending}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="rollNumber">Roll Number</label>
                <input
                  type="text"
                  id="rollNumber"
                  className="form-input"
                  placeholder="e.g. CS001"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                  disabled={mutation.isPending}
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
            disabled={mutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}
