import { api } from "../lib/api";

export const attendanceService = {
  markAttendance: async (data: any) => {
    const res = await api.post("/attendance", data);
    return res.data;
  },

  bulkMarkAttendance: async (data: { subject: string; date: string; records: Array<{ student: string; status: string; remarks?: string }> }) => {
    const res = await api.post("/attendance/bulk", data);
    return res.data;
  },

  updateAttendance: async (id: string, data: { status: string; remarks: string }) => {
    const res = await api.put(`/attendance/${id}`, data);
    return res.data;
  },

  getStudentAttendance: async (studentId?: string) => {
    const res = await api.get("/attendance/student", { params: { studentId } });
    return res.data;
  },

  getClassAttendance: async (subjectId: string, date: string) => {
    const res = await api.get("/attendance/class", { params: { subjectId, date } });
    return res.data;
  },

  getSubjectHistory: async (subjectId: string) => {
    const res = await api.get("/attendance/subject-history", { params: { subjectId } });
    return res.data;
  },

  getStats: async () => {
    const res = await api.get("/attendance/stats");
    return res.data;
  },

  getReports: async (params?: any, format?: "json" | "csv") => {
    if (format === "csv") {
      const res = await api.get("/attendance/reports", {
        params: { ...params, format: "csv" },
        responseType: "blob",
      });
      return res.data;
    }
    const res = await api.get("/attendance/reports", { params });
    return res.data;
  },
};
