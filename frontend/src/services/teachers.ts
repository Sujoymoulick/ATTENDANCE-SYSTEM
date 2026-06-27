import { api } from "../lib/api";

export const teachersService = {
  getTeachers: async (params?: any) => {
    const res = await api.get("/users", { params: { ...params, role: "TEACHER" } });
    return res.data;
  },

  createTeacher: async (data: any) => {
    const res = await api.post("/users", { ...data, role: "TEACHER" });
    return res.data;
  },

  updateTeacher: async (id: string, data: any) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },

  deleteTeacher: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};
