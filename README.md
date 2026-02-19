# LSM3 Advanced School Portal (MVP)

Full-stack school portal with role-based dashboards for `admin`, `teacher`, `student`, and `parent`.

## Stack
- Backend: Node.js, Express, Sequelize, SQLite (MVP DB), JWT, Socket.io
- Frontend: React (Vite), React Router, Axios

## Run
1. Backend:
```bash
cd backend
npm install
npm run dev
```
2. Frontend:
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:5000`.

## Demo Accounts
- Admin: `admin@lsm3.com` / `admin123`
- Teacher: `teacher@lsm3.com` / `teacher123`
- Student: `student@lsm3.com` / `student123`
- Parent: `parent@lsm3.com` / `parent123`

## MVP Coverage
- Auth with JWT and role-based access
- Admin dashboard: user management, subjects, attendance overview, announcements summary
- Teacher dashboard: attendance, marks entry, homework assignment, messaging, notifications
- Student dashboard: timetable, exams/marks, homework submission, notifications
- Parent dashboard: child attendance/homework/performance, notifications, messaging
- Real-time backend events for messaging/announcements via Socket.io

## Notes
- MVP database is SQLite for speed of delivery. Replace with PostgreSQL/MySQL in production.
- Add HTTPS termination at reverse proxy (Nginx/Cloud load balancer) for deployment.
