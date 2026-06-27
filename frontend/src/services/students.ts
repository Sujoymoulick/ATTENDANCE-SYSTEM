import { api } from "../lib/api";

export const studentsService = {
  getStudents: async (params?: any) => {
    const res = await api.get("/users", { params: { ...params, role: "STUDENT" } });
    return res.data;
  },

  createStudent: async (data: any) => {
    const res = await api.post("/users", { ...data, role: "STUDENT" });
    return res.data;
  },

  updateStudent: async (id: string, data: any) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },

  deleteStudent: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },

  bulkUpload: async (csvText: string) => {
    const res = await api.post("/users/bulk-upload", { csvText });
    return res.data;
  },
};
