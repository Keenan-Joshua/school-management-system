# School Management System

A full‑stack web application for managing a school’s core operations: users and roles, students, teachers, attendance, grades, announcements, holidays, and parent information. The backend is a Node.js/Express API with JWT authentication and a MySQL database. The frontend is a React app.

---

### Features
- Authentication and authorization with JWT
  - Role-based access control using roles like `administrator`, `teacher`, and others
- Manage entities
  - Students: CRUD and class listings
  - Teachers: CRUD, class assignments, and “with account status” view
  - Parents: CRUD and listings
  - Attendance: record and view attendance
  - Grades: record and view grades
  - Announcements: create and list announcements
  - Holidays: list upcoming holidays and manage holidays
- RESTful API under `/api/*`
- CORS enabled for local development (`http://localhost:3000`)

---

### Tech Stack
- Backend: `Node.js`, `Express 5`, `jsonwebtoken`, `express-validator`, `bcryptjs`, `mysql2`, `dotenv`, `cors`
- Frontend: `React 19`, `react-router-dom 7`, `axios`, `react-hook-form`, `react-to-print`, Tailwind CSS
- Database: `MySQL`

---

### Project Structure
```
school-management-system/
├─ client/                 # React frontend
│  ├─ package.json
│  └─ src/
│     └─ pages/
│        └─ announcements/
│           ├─ Announcements.jsx
│           └─ AnnouncementForm.jsx
└─ server/                 # Node/Express backend
   ├─ index.js             # App entry
   ├─ package.json
   ├─ routes/
   │  ├─ authRoutes.js
   │  ├─ studentRoutes.js
   │  ├─ teacherRoutes.js
   │  ├─ attendanceRoutes.js
   │  ├─ gradeRoutes.js
   │  ├─ announcementRoutes.js
   │  ├─ parentRoutes.js
   │  ├─ holidayRoutes.js
   │  └─ teacherSubjectRoutes.js
   ├─ controllers/
   │  ├─ authController.js
   │  ├─ studentController.js
   │  ├─ teacherController.js
   │  ├─ announcementController.js
   │  ├─ parentController.js
   │  ├─ attendanceController.js
   │  ├─ gradeController.js
   │  ├─ holidayController.js
   │  └─ teacherSubjectController.js
   └─ middleware/
      └─ authMiddleware.js  # verifyToken, verifyRole
```

---

### Prerequisites
- Node.js 18+ recommended (for React 19 toolchain and modern ESM/CJS support)
- npm 9+ or pnpm/yarn equivalent
- MySQL Server (accessible from backend)

---

### Setup and Installation
#### 1) Clone and install dependencies
```
# From the repository root
echo "Setting up client and server"
cd server && npm install && cd ..
cd client && npm install && cd ..
```

#### 2) Backend environment variables
Create a `.env` file in `server/` with contents like:
```
# Server
PORT=5000
CORS_ORIGIN=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=school_management

# Auth
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
```

Notes:
- `CORS_ORIGIN` defaults to `http://localhost:3000` in code; keep aligned with your client dev URL.
- Ensure the database and user exist and have proper privileges.

#### 3) Database
- Create the database: `CREATE DATABASE school_management;`
- Apply schema/migrations if provided (see `server` docs or migration scripts if available). If no migrations are present, create the required tables referenced by controllers before running.

#### 4) Running the apps
- Backend (from `server/`):
```
node index.js
```
- Frontend (from `client/`):
```
npm start
```
- Open the client at `http://localhost:3000`. The API runs at `http://localhost:5000` (configurable via `.env`).

---

### Authentication & Roles
- JWT-based auth with `Authorization: Bearer <token>` header
- Middleware:
  - `verifyToken` protects most routes
  - `verifyRole('<role>')` enforces RBAC for sensitive operations (e.g., admin-only routes)
- Typical roles observed: `administrator`, `teacher`

---

### API Overview
Base URL: `http://localhost:5000/api`

Authentication (`/auth`):
- `POST /auth/register` — Initial registration/setup
- `GET /auth/setup-status` — Check if initial setup is complete
- `POST /auth/login` — Log in and receive JWT
- Protected (token required):
  - `PUT /auth/reset-password` — User-initiated password change
  - `PUT /auth/admin-reset-password` — Admin resets another user’s password (`administrator` only)
  - `POST /auth/users` — Create a new user (`administrator` only)
  - `GET /auth/users` — List all users (`administrator` only)
  - `DELETE /auth/users/:id` — Delete user by ID (`administrator` only)

Students (`/students`, protected):
- `GET /students` — List students
- `GET /students/classes` — List classes
- `GET /students/:id` — Get student by ID
- `POST /students` — Create (`administrator` only)
- `PUT /students/:id` — Update (`administrator` only)
- `DELETE /students/:id` — Delete (`administrator` only)

Teachers (`/teachers`, protected):
- `GET /teachers/with-status` — List teachers with account status
- `GET /teachers/classes` — List all classes
- `GET /teachers` — List teachers
- `GET /teachers/my-classes` — Classes assigned to current teacher (`teacher` role)
- `GET /teachers/:id` — Get teacher by ID
- `POST /teachers` — Create (`administrator` only)
- `PUT /teachers/:id` — Update (`administrator` only)
- `DELETE /teachers/:id` — Delete (`administrator` only)
- `PUT /teachers/classes/:class_id/assign` — Assign a teacher to a class (`administrator` only)

Announcements (`/announcements`, protected):
- Typical endpoints include list/create; see `announcementRoutes.js`

Attendance (`/attendance`, protected):
- Record and retrieve attendance; see `attendanceRoutes.js`

Grades (`/grades`, protected):
- Record and retrieve grades; see `gradeRoutes.js`

Parents (`/parents`, protected):
- Parent management; see `parentRoutes.js`

Holidays (`/holidays`, protected):
- `GET /holidays` — List
- `GET /holidays/upcoming` — Upcoming holidays
- `POST /holidays` — Create
- `DELETE /holidays/:id` — Delete

Teacher Subjects (`/teacher-subjects`, protected):
- Endpoints to manage teacher — subject assignments; see `teacherSubjectRoutes.js`

Note: All protected routes require `Authorization: Bearer <token>`.

---

### Example Requests
- Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Password123!"
}
```
Response:
```
{
  "token": "<jwt>",
  "user": { "id": 1, "role": "administrator" }
}
```

- Create Student (administrator only)
```
POST /api/students
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Doe",
  "class_id": 3,
  "dob": "2012-04-15"
}
```

---

### Frontend
- Development: `npm start` from `client/` runs the app on `http://localhost:3000`
- Uses React Router v7 and Tailwind CSS
- Announcements UI is available under `src/pages/announcements/`
- Configure the API base URL in the client (commonly via environment or a config file) to `http://localhost:5000/api`

---

### Scripts
- Client (`client/package.json`):
  - `start` — Run dev server
  - `build` — Production build
  - `test`, `eject`
- Server (`server/package.json`):
  - No explicit `start` script; run `node index.js` or add:
```
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

---

### Security Notes
- Keep `JWT_SECRET` strong and private
- Use HTTPS in production and set secure cookie/storage strategies if you adopt cookies
- Validate and sanitize inputs (`express-validator` is included)

---

### Deployment
- Backend
  - Set env vars (`PORT`, DB config, `JWT_SECRET`, `CORS_ORIGIN`)
  - Run `npm ci && node index.js` (or `npm start` if you add a start script)
- Frontend
  - `npm ci && npm run build`
  - Serve the `client/build` folder via a static host (Nginx, Netlify, Vercel, etc.)
  - Point the frontend to the deployed API base URL

---

### Troubleshooting
- CORS issues: ensure `CORS_ORIGIN` matches your client URL
- 401/403 responses: verify your `Authorization` header and user role
- DB connection errors: confirm host, port, credentials, and that MySQL is running
- Port conflicts: change `PORT` in `.env` or stop the conflicting process

---

### License
This project is licensed under the ISC License (see `server/package.json`).

---

### Acknowledgments
- Express, React, Tailwind, and the open-source community

---

### Status
As of 2026-07-06, this README reflects the discovered routes and structure in the repository. If additional controllers/routes exist, extend the API section accordingly.
