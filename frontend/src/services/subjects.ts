import { api } from "../lib/api";

export const subjectsService = {
  getSubjects: async (params?: any) => {
    const res = await api.get("/subjects", { params });
    return res.data;
  },

  getSubjectById: async (id: string) => {
    const res = await api.get(`/subjects/${id}`);
    return res.data;
  },

  createSubject: async (data: any) => {
    const res = await api.post("/subjects", data);
    return res.data;
  },

  updateSubject: async (id: string, data: any) => {
    const res = await api.put(`/subjects/${id}`, data);
    return res.data;
  },

  deleteSubject: async (id: string) => {
    const res = await api.delete(`/subjects/${id}`);
    return res.data;
  },
};
