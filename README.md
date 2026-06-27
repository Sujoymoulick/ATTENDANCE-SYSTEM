# Production-Ready Attendance Management System

A full-stack, role-based Attendance Management System designed to be fast, secure, and modern. Built with a split monorepo architecture:

* **Backend**: Express + TypeScript + Mongoose MongoDB (with rate limiters, security headers, cookie authentication, Zod validation, and audit logs).
* **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + TanStack Query + Axios (with custom layouts, skeletons, and toasts).

---

## 1. Directory Structure Overview
```
attendance-system/
├── frontend/             # Next.js client application
├── backend/              # Node.js + Express API server
├── docker-compose.yml    # Multi-container local execution
└── README.md             # This guide
```

---

## 2. Local Run Guide (Direct)

### Step 1: Start Database
Verify a local MongoDB instance is active on port `27017`. If using Docker, spin up the database container:
```bash
docker-compose up -d mongodb
```

### Step 2: Configure & Run Backend
1. Open terminal inside `backend/` and configure environment:
   ```bash
   cd backend
   cp .env.example .env
   npm install
   ```
2. Populate the database with default accounts (admin, teachers, students, subjects):
   ```bash
   npm run seed
   ```
3. Run the development API server:
   ```bash
   npm run dev
   ```
   *The backend will boot on port `5000`.*

### Step 3: Configure & Run Frontend
1. Open a new terminal inside `frontend/` and configure environment:
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   ```
2. Start the Next.js client app:
   ```bash
   npm run dev
   ```
   *The client runs on port `3000`. Navigate to [http://localhost:3000](http://localhost:3000) to login.*

---

## 3. Local Run Guide (Docker Compose)
To compile and spin up the complete database, backend, and frontend stack in isolated containers, run:
```bash
docker-compose up --build
```
* MongoDB: `mongodb://localhost:27017`
* Backend API: `http://localhost:5000/api/v1`
* Frontend App: `http://localhost:3000`

---

## 4. Production Deployment Guide

### Database: MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User with read-write access.
3. Whitelist access from Render IPs (or configure `0.0.0.0/0` for global access).
4. Copy the connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/attendance`

### Backend: Render
1. Create a **Web Service** on Render.
2. Select your git repository.
3. Configure the following service options:
   * **Root Directory**: `backend`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
4. Set Environment Variables under the "Environment" tab:
   * `MONGODB_URI`: Your MongoDB Atlas string.
   * `JWT_SECRET`: A secure random password string.
   * `CLIENT_URL`: Your Vercel frontend domain (e.g. `https://presence.vercel.app`).
   * `NODE_ENV`: `production`

### Frontend: Vercel
1. Create a new project on Vercel and import your repository.
2. Configure project options:
   * **Root Directory**: `frontend`
   * **Build & Development Settings**: Keep defaults (Vercel automatically detects Next.js build targets).
3. Set compile-time Environment Variables:
   * `NEXT_PUBLIC_API_URL`: Your backend URL on Render (e.g. `https://presence-backend.onrender.com/api/v1`).
4. Click **Deploy**.

---

## 5. Security Checklist
* [x] **HTTP-Only Cookies**: JWT is saved securely via HTTP-Only SameSite cookie configuration to prevent XSS theft.
* [x] **CORS Enforcement**: Restricts cross-origin resource access with credentials flag strictly bound to production client domains.
* [x] **Validation**: Request payloads verified by Zod before reaching controllers.
* [x] **Security Headers**: Helmet middleware enabled.
* [x] **Rate Limiters**: Prevents brute-forcing on login routes.
