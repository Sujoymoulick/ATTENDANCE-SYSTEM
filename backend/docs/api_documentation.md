# REST API Documentation - Attendance Management System

This document outlines the detailed specifications of the Express + Mongoose backend REST API.

## Base URL
* Local Development: `http://localhost:5000/api/v1`
* Health check endpoint: `http://localhost:5000/health` (no prefix)

---

## 1. Authentication & Session Flow
The API uses **HttpOnly Cookies** to persist sessions. On a successful login, a JWT is encrypted and set in the response cookie (`token`). Client requests must configure `withCredentials: true` so the browser automatically handles and attaches the token.

---

## 2. API Response Patterns

### Success Responses (ApiResponse)
All successful endpoints return a standard JSON object:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Retrieval complete",
  "data": { ... }
}
```

### Error Responses (ApiError)
Failed validation or server execution triggers a centralized error middleware, returning:
```json
{
  "success": false,
  "message": "Detailed description of error",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

---

## 3. Endpoints Catalog

### Auth Module (`/auth`)

#### `POST /auth/login`
Authenticates user credentials and returns a secure HTTP-Only cookie.
* **Payload**:
  ```json
  { "email": "admin@test.com", "password": "password" }
  ```
* **Success (200)**: Sets `token` cookie and returns user profile metadata.

#### `POST /auth/logout`
Logs out current user session.
* **Success (200)**: Clears cookie and returns success response.

#### `GET /auth/me`
Gets current logged in profile from session payload.
* **Headers**: Required `Cookie: token=<jwt>` or `Authorization: Bearer <jwt>`.
* **Success (200)**: Returns full profile minus password.

---

### User Management Module (`/users`) - ADMIN Only

#### `GET /users`
Search and filter paginated directory of users.
* **Query Params**:
  * `page` (number, default: 1)
  * `limit` (number, default: 10)
  * `search` (name, email, or rollNumber search string)
  * `role` (ADMIN, TEACHER, STUDENT)
  * `department` (filter string)
  * `semester` (filter string)
* **Success (200)**: List of users and `pagination` metadata.

#### `POST /users`
Create new individual student or teacher.
* **Payload**: Includes name, email, role, password, and role-specific details.

#### `POST /users/bulk-upload`
Bulk creation of students via a raw CSV string in the payload.
* **Payload**:
  ```json
  {
    "csvText": "name,email,password,role,department,semester,section,rollNumber\nFrank Student,frank@test.com,password,STUDENT,Computer Science,Semester 1,A,CS007"
  }
  ```
* **Success (200)**: Returns `totalProcessed`, `successCount`, `failCount`, and `errors` array for rows that failed validation.

---

### Attendance Module (`/attendance`)

#### `POST /attendance/bulk` - TEACHER Only
Mark attendance for an entire class roster.
* **Payload**:
  ```json
  {
    "subject": "ObjectId",
    "date": "YYYY-MM-DD",
    "records": [
      { "student": "ObjectId", "status": "Present", "remarks": "Ontime" }
    ]
  }
  ```

#### `PUT /attendance/:id` - TEACHER/ADMIN
Updates status of a specific marked attendance. Triggers an audit logging event.
* **Payload**:
  ```json
  { "status": "Late", "remarks": "Bus delayed" }
  ```
* **Actions**: Checks old status, writes the update, and records a trace in the `AuditLog` database table.

#### `GET /attendance/student` - Logged in STUDENT or Admin/Teacher
Retrieve attendance history and subject-wise percentages for a student.
* **Query Params**: `studentId` (for Admins/Teachers checking a student; omitted for logged-in students).
* **Success (200)**: Returns overall attendance %, and `subjectWiseStats` (attended/conducted ratios, percentages).
