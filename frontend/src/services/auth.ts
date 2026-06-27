import { api } from "../lib/api";

export const authService = {
  login: async (credentials: any) => {
    const res = await api.post("/auth/login", credentials);
    return res.data;
  },

  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};
