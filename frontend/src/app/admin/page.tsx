"use client";

import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ["#10B981", "#EF4444", "#F59E0B"];

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminStats"],
    queryFn: attendanceService.getStats,
  });

  if (isLoading) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1 className="title-xl">Admin Dashboard</h1>
        <p className="text-muted">Loading metrics...</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginTop: "2rem" }}>
          <div className="glass-panel" style={{ height: "150px" }}></div>
          <div className="glass-panel" style={{ height: "150px" }}></div>
          <div className="glass-panel" style={{ height: "150px" }}></div>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1 className="title-xl">Admin Dashboard</h1>
        <p className="text-muted" style={{ color: "var(--c-danger)" }}>
          Failed to load dashboard metrics. Ensure MongoDB is running.
        </p>
      </div>
    );
  }

  const stats = data.data;
  const today = stats.todayAttendance;
  
  // Format today's data for PieChart
  const todayPieData = [
    { name: "Present", value: today.present },
    { name: "Absent", value: today.absent },
    { name: "Late", value: today.late },
  ].filter(item => item.value > 0);

  // Fallback if no attendance marked today
  if (todayPieData.length === 0) {
    todayPieData.push({ name: "No Data", value: 1 });
  }

  // Format monthly stats for chart
  const lineChartData = stats.monthlyTrends.map((trend: any) => ({
    date: trend._id,
    Present: trend.present,
    Absent: trend.absent,
    Late: trend.late,
  }));

  // Format department data for bar chart
  const barChartData = stats.departmentDistribution.map((dept: any) => ({
    name: dept._id || "Unknown",
    Present: dept.present,
    Absent: dept.absent,
    Late: dept.late,
  }));

  return (
    <div className="animate-fade-in" style={{ padding: "1rem" }}>
      <h1 className="title-xl">Admin Overview</h1>
      <p className="text-muted" style={{ marginBottom: "2rem" }}>
        Real-time statistics across all departments.
      </p>

      {/* Cards Row */}
      <div className="grid-cards" style={{ marginBottom: "2.5rem" }}>
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", background: "rgba(124, 58, 237, 0.08)" }}>
          <h3 className="text-muted" style={{ fontSize: "0.95rem" }}>Total Students</h3>
          <span style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--c-primary)" }}>{stats.totalStudents}</span>
          <Link href="/admin/users?role=STUDENT" style={{ fontSize: "0.85rem", color: "var(--c-primary-light)", textDecoration: "none" }}>
            View student directory &rarr;
          </Link>
        </div>

        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", background: "rgba(16, 185, 129, 0.08)" }}>
          <h3 className="text-muted" style={{ fontSize: "0.95rem" }}>Total Teachers</h3>
          <span style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--c-success)" }}>{stats.totalTeachers}</span>
          <Link href="/admin/users?role=TEACHER" style={{ fontSize: "0.85rem", color: "var(--c-success)", textDecoration: "none" }}>
            View teacher directory &rarr;
          </Link>
        </div>

        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", background: "rgba(245, 158, 11, 0.08)" }}>
          <h3 className="text-muted" style={{ fontSize: "0.95rem" }}>Today's Attendance Status</h3>
          <div style={{ display: "flex", gap: "1rem", alignItems: "baseline" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 700 }}>{today.total}</span>
            <span className="text-muted" style={{ fontSize: "0.85rem" }}>records today</span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--c-text-muted)" }}>
            Present: <strong style={{ color: "var(--c-success)" }}>{today.present}</strong> | Absent: <strong style={{ color: "var(--c-danger)" }}>{today.absent}</strong> | Late: <strong style={{ color: "var(--c-warning)" }}>{today.late}</strong>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", marginBottom: "2.5rem" }}>
        {/* Monthly Trend Chart */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 className="title-lg" style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Monthly Attendance Trends</h3>
          <div style={{ width: "100%", height: "260px" }}>
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--c-text-muted)" fontSize={12} />
                  <YAxis stroke="var(--c-text-muted)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--c-bg)", border: "1px solid var(--c-surface-border)" }} />
                  <Legend />
                  <Line type="monotone" dataKey="Present" stroke="#10B981" strokeWidth={2.5} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Late" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="Absent" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-center" style={{ height: "100%" }}>
                <p className="text-muted">No attendance records in the last 30 days.</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Ratios */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
          <h3 className="title-lg" style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Today's Distribution</h3>
          <div style={{ width: "100%", height: "180px", position: "relative" }}>
            {today.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={todayPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {todayPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-center" style={{ height: "100%" }}>
                <p className="text-muted" style={{ textAlign: "center", fontSize: "0.9rem" }}>No attendance marked today.</p>
              </div>
            )}
          </div>
          <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-around", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }}></div>
              <span>Present</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }}></div>
              <span>Absent</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }}></div>
              <span>Late</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Department Attendance */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <h3 className="title-lg" style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Department-wise Attendance Distribution</h3>
        <div style={{ width: "100%", height: "260px" }}>
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--c-text-muted)" fontSize={12} />
                <YAxis stroke="var(--c-text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--c-bg)", border: "1px solid var(--c-surface-border)" }} />
                <Legend />
                <Bar dataKey="Present" fill="#10B981" stackId="a" />
                <Bar dataKey="Late" fill="#F59E0B" stackId="a" />
                <Bar dataKey="Absent" fill="#EF4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-center" style={{ height: "100%" }}>
              <p className="text-muted">No department data to display.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
