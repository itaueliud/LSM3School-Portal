# LSM3 - Advanced School Portal Specification

## 1. Project Overview

**Project Name:** LSM3 - Advanced School Portal
**Project Type:** Full-stack Web Application (School Management System)
**Core Functionality:** A comprehensive school management system with separate dashboards for Admin, Teacher, Student, and Parent roles, featuring real-time attendance tracking, exam management, homework assignment, messaging, and performance analytics.
**Target Users:** School administrators, teachers, students, and parents

## 2. Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (using SQLite for MVP simplicity)
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time:** Socket.io
- **Password Hashing:** bcryptjs
- **Validation:** express-validator

### Frontend
- **Framework:** React.js with Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Real-time:** Socket.io-client
- **UI Components:** Custom components with CSS
- **Charts:** Recharts
- **Icons:** Lucide React

## 3. Database Schema

### Users Table
```
- id: INTEGER PRIMARY KEY
- email: VARCHAR UNIQUE
- password: VARCHAR (hashed)
- firstName: VARCHAR
- lastName: VARCHAR
- role: ENUM('admin', 'teacher', 'student', 'parent')
- createdAt: DATETIME
```

### Students Table
```
- id: INTEGER PRIMARY KEY
- userId: INTEGER FK
- studentId: VARCHAR UNIQUE (e.g., "STU001")
- dateOfBirth: DATE
- grade: VARCHAR
- section: VARCHAR
```

### Parents Table
```
- id: INTEGER PRIMARY KEY
- userId: INTEGER FK
- studentId: INTEGER FK (linked student)
- phone: VARCHAR
```

### Teachers Table
```
- id: INTEGER PRIMARY KEY
- userId: INTEGER FK
- employeeId: VARCHAR UNIQUE
- subject: VARCHAR
```

### Subjects Table
```
- id: INTEGER PRIMARY KEY
- name: VARCHAR
- grade: VARCHAR
- teacherId: INTEGER FK
```

### Attendance Table
```
- id: INTEGER PRIMARY KEY
- studentId: INTEGER FK
- date: DATE
- status: ENUM('present', 'absent', 'late', 'excused')
- markedBy: INTEGER FK (teacher)
```

### Exams Table
```
- id: INTEGER PRIMARY KEY
- title: VARCHAR
- subjectId: INTEGER FK
- date: DATE
- totalMarks: INTEGER
- createdBy: INTEGER FK
```

### Marks Table
```
- id: INTEGER PRIMARY KEY
- examId: INTEGER FK
- studentId: INTEGER FK
- marks: DECIMAL
- gradedBy: INTEGER FK
```

### Homework Table
```
- id: INTEGER PRIMARY KEY
- title: VARCHAR
- description: TEXT
- subjectId: INTEGER FK
- assignedBy: INTEGER FK
- dueDate: DATE
- grade: VARCHAR
```

### HomeworkSubmissions Table
```
- id: INTEGER PRIMARY KEY
- homeworkId: INTEGER FK
- studentId: INTEGER FK
- submissionText: TEXT
- submittedAt: DATETIME
- grade: VARCHAR
- feedback: TEXT
```

### Messages Table
```
- id: INTEGER PRIMARY KEY
- senderId: INTEGER FK
- receiverId: INTEGER FK
- content: TEXT
- createdAt: DATETIME
- read: BOOLEAN
```

### Announcements Table
```
- id: INTEGER PRIMARY KEY
- title: VARCHAR
- content: TEXT
- createdBy: INTEGER FK
- createdAt: DATETIME
- targetRole: ENUM('all', 'teacher', 'student', 'parent')
```

### Timetable Table
```
- id: INTEGER PRIMARY KEY
- subjectId: INTEGER FK
- grade: VARCHAR
- dayOfWeek: VARCHAR
- startTime: TIME
- endTime: TIME
- room: VARCHAR
```

## 4. API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Users (Admin only)
- GET /api/users - Get all users
- GET /api/users/:id - Get user by ID
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

### Students
- GET /api/students - Get all students
- GET /api/students/:id - Get student by ID
- POST /api/students - Create student
- PUT /api/students/:id - Update student

### Teachers
- GET /api/teachers - Get all teachers
- GET /api/teachers/:id - Get teacher by ID
- POST /api/teachers - Create teacher

### Attendance
- GET /api/attendance - Get attendance records
- POST /api/attendance - Mark attendance
- GET /api/attendance/student/:id - Get student attendance
- GET /api/attendance/class/:grade - Get class attendance

### Exams
- GET /api/exams - Get all exams
- POST /api/exams - Create exam
- GET /api/exams/:id - Get exam details
- PUT /api/exams/:id - Update exam

### Marks
- GET /api/marks/exam/:examId - Get marks for exam
- POST /api/marks - Enter marks
- PUT /api/marks/:id - Update marks
- GET /api/marks/student/:studentId - Get student marks

### Homework
- GET /api/homework - Get all homework
- POST /api/homework - Create homework
- GET /api/homework/:id - Get homework details
- PUT /api/homework/:id - Update homework
- GET /api/homework/student/:studentId - Get student homework
- POST /api/homework/:id/submit - Submit homework

### Messages
- GET /api/messages - Get messages for user
- POST /api/messages - Send message
- PUT /api/messages/:id/read - Mark as read

### Announcements
- GET /api/announcements - Get announcements
- POST /api/announcements - Create announcement
- DELETE /api/announcements/:id - Delete announcement

### Timetable
- GET /api/timetable - Get timetable
- GET /api/timetable/grade/:grade - Get grade timetable
- POST /api/timetable - Create timetable entry

### Subjects
- GET /api/subjects - Get all subjects
- POST /api/subjects - Create subject
- GET /api/subjects/teacher/:teacherId - Get teacher subjects

### Analytics
- GET /api/analytics/attendance/:grade - Attendance stats
- GET /api/analytics/performance/:grade - Performance stats

## 5. Dashboard Features

### Admin Dashboard
- **User Management:** Create, edit, delete users (teachers, students, parents)
- **Attendance Overview:** View overall attendance statistics
- **Exam Setup:** Create and manage exams
- **Announcements:** Create school-wide announcements
- **Analytics:** View charts for attendance and performance

### Teacher Dashboard
- **Mark Attendance:** Take daily attendance for their classes
- **Enter Marks:** Input and calculate exam marks
- **Assign Homework:** Create and track homework
- **Messaging:** Send messages to parents and students
- **View Classes:** See their assigned subjects and students

### Student Dashboard
- **View Timetable:** See class schedule
- **View Exams:** See upcoming and past exams
- **Submit Homework:** Submit homework assignments
- **Access Resources:** View learning materials
- **Notifications:** Receive announcements and updates
- **View Results:** See their marks and performance

### Parent Dashboard
- **Track Attendance:** View child's attendance record
- **View Homework:** See assigned homework
- **View Results:** See exam results and performance
- **Notifications:** Receive school announcements
- **Messaging:** Communicate with teachers

## 6. UI/UX Specification

### Color Palette
- **Primary:** #2563eb (Blue)
- **Secondary:** #1e293b (Dark Slate)
- **Accent:** #10b981 (Emerald Green)
- **Background:** #f8fafc (Light Gray)
- **Card Background:** #ffffff
- **Text Primary:** #1e293b
- **Text Secondary:** #64748b
- **Success:** #22c55e
- **Warning:** #f59e0b
- **Error:** #ef4444
- **Danger:** #dc2626

### Typography
- **Font Family:** 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
- **Headings:** 
  - H1: 2rem (32px), font-weight: 700
  - H2: 1.5rem (24px), font-weight: 600
  - H3: 1.25rem (20px), font-weight: 600
- **Body:** 1rem (16px), font-weight: 400
- **Small:** 0.875rem (14px)

### Layout
- **Sidebar:** Fixed left, 260px width, collapsible on mobile
- **Header:** Fixed top, 64px height
- **Content Area:** Fluid, with max-width 1400px
- **Cards:** 16px padding, 8px border-radius, subtle shadow
- **Spacing:** 4px base unit (4, 8, 12, 16, 24, 32, 48)

### Responsive Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Components
- **Buttons:** Primary (blue), Secondary (gray), Danger (red), Success (green)
- **Cards:** White background, subtle shadow, rounded corners
- **Tables:** Striped rows, hover effect, sortable headers
- **Forms:** Labeled inputs, validation feedback
- **Modals:** Centered, overlay background, close button
- **Charts:** Line charts for trends, bar charts for comparisons, pie charts for distribution

## 7. Security Requirements

- JWT tokens with 24-hour expiration
- Password hashing with bcrypt (10 rounds)
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS configuration
- SQL injection prevention (parameterized queries)

## 8. Real-time Features

- Socket.io for real-time messaging
- Live notification updates
- Real-time attendance updates
- Instant homework submission notifications

## 9. Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validate.js
│   ├── models/
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── students.js
│   │   ├── teachers.js
│   │   ├── attendance.js
│   │   ├── exams.js
│   │   ├── marks.js
│   │   ├── homework.js
│   │   ├── messages.js
│   │   ├── announcements.js
│   │   ├── subjects.js
│   │   ├── timetable.js
│   │   └── analytics.js
│   ├── socket/
│   │   └── index.js
│   ├── server.js
│   └── index.js
├── package.json
└── .env
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── dashboard/
│   ├── pages/
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── teacher/
│   │   ├── student/
│   │   └── parent/
│   ├── context/
│   ├── hooks/
│   ├── services/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

## 10. Acceptance Criteria

1. User can register and login with role selection
2. Admin can manage all users (CRUD operations)
3. Teachers can mark attendance and enter marks
4. Students can view timetable, exams, submit homework
5. Parents can track child progress
6. Real-time messaging works between users
7. Dashboard analytics display correctly
8. All forms have validation
9. JWT authentication protects routes
10. Responsive design works on all devices
