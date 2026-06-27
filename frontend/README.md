# Attendance System - Next.js Frontend

This directory contains the Next.js 15 (App Router) client application designed with Tailwind CSS, shadcn/ui styles, TanStack Query, and Axios.

---

## 1. Local Setup

### Prerequisites
* Node.js v20+
* Backend service active (running on port `5000`)

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env` (a template is available in `.env.example`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```

---

## 2. Running the Client

### Development mode
Starts the Next.js dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the landing page.

### Production Build
Builds the production-ready package:
```bash
npm run build
npm start
```

---

## 3. Tech Stack Features
* **Authentication Context**: Client session persistence across refreshes.
* **TanStack Query**: Cache synchronization and loading skeletons.
* **Axios Instance**: Automatic handling of backend-set HttpOnly JWT cookies.
* **Responsive Dashboards**: Custom view layouts matching Admin, Teacher, and Student roles.

---

## 4. Vercel Deployment
1. Import the project repository into Vercel.
2. Set the **Root Directory** configuration option to `frontend`.
3. Set the compile-time **Environment Variable**:
   * `NEXT_PUBLIC_API_URL`: Your backend Web Service URL deployed on Render (e.g. `https://presence-backend.onrender.com/api/v1`).
4. Click **Deploy**.
