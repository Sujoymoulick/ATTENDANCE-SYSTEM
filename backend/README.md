# Attendance System - Express Backend

This directory contains the Node.js + Express + Mongoose backend REST API written in TypeScript.

---

## 1. Local Setup

### Prerequisites
* Node.js v20+
* MongoDB running locally (default: `mongodb://127.0.0.1:27017/attendance`)

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env` (a template is available in `.env.example`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/attendance
   JWT_SECRET=super-secret-key-for-attendance-app
   JWT_EXPIRES=24h
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. Seed the database with mock accounts and records:
   ```bash
   npm run seed
   ```
   *Seeding completes with:*
   * Admin: `admin@test.com` (password: `password`)
   * Teacher: `teacher@test.com` (password: `password`)
   * Student: `student@test.com` (password: `password`)

---

## 2. Running the Server

### Development mode
Starts the server with file hot reloading:
```bash
npm run dev
```

### Production mode
Compiles and starts the server:
```bash
npm run build
npm start
```

---

## 3. Swagger & Postman Docs
* **Swagger OpenAPI specification**: refer to `docs/swagger.json`
* **Postman Collections**: refer to `docs/postman_collection.json`
* **Detailed Endpoint documentation**: refer to `docs/api_documentation.md`

---

## 4. Docker Guide
To build and run the backend image:
```bash
docker build -t attendance-backend .
docker run -p 5000:5000 --env MONGODB_URI=mongodb://host.docker.internal:27017/attendance attendance-backend
```

---

## 5. Render Deployment
1. Set up a Web Service on Render.
2. Select your repository, and set the **root directory** to `backend`.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Configure Environment Variables:
   * `MONGODB_URI`: Your MongoDB Atlas connection string.
   * `JWT_SECRET`: A secure random secret.
   * `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://presence.vercel.app`).
   * `NODE_ENV`: `production`
