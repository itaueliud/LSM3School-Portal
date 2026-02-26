import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './models/index.js';
import setupSocket from './socket/index.js';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import studentsRoutes from './routes/students.js';
import teachersRoutes from './routes/teachers.js';
import attendanceRoutes from './routes/attendance.js';
import examsRoutes from './routes/exams.js';
import marksRoutes from './routes/marks.js';
import homeworkRoutes from './routes/homework.js';
import messagesRoutes from './routes/messages.js';
import announcementsRoutes from './routes/announcements.js';
import subjectsRoutes from './routes/subjects.js';
import timetableRoutes from './routes/timetable.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const frontendOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOrigin = frontendOrigins.length === 0 ? true : frontendOrigins;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

app.use(cors({
  origin: corsOrigin
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.app.set('io', io);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LSM3 School Portal API is running' });
});

app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'LSM3 backend is running' });
});

setupSocket(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await db.sequelize.sync({ force: false });
    console.log('Database synchronized');

    await seedInitialData();

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

async function seedInitialData() {
  const adminExists = await db.User.findOne({ where: { email: 'admin@lsm3.com' } });
  if (!adminExists) {
    await db.User.create({
      email: 'admin@lsm3.com',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Admin',
      role: 'admin',
      phone: '1234567890'
    });
  }

  const teacherUser = await db.User.findOne({ where: { email: 'teacher@lsm3.com' } });
  let teacherProfile = null;
  if (!teacherUser) {
    const createdTeacherUser = await db.User.create({
      email: 'teacher@lsm3.com',
      password: 'teacher123',
      firstName: 'Demo',
      lastName: 'Teacher',
      role: 'teacher',
      phone: '1234567891'
    });
    teacherProfile = await db.Teacher.create({
      userId: createdTeacherUser.id,
      employeeId: 'TCH0001',
      subject: 'Mathematics'
    });
  } else {
    teacherProfile = await db.Teacher.findOne({ where: { userId: teacherUser.id } });
    if (!teacherProfile) {
      teacherProfile = await db.Teacher.create({
        userId: teacherUser.id,
        employeeId: 'TCH0001',
        subject: 'Mathematics'
      });
    }
  }

  const studentUser = await db.User.findOne({ where: { email: 'student@lsm3.com' } });
  let studentProfile = null;
  if (!studentUser) {
    const createdStudentUser = await db.User.create({
      email: 'student@lsm3.com',
      password: 'student123',
      firstName: 'Demo',
      lastName: 'Student',
      role: 'student',
      phone: '1234567892'
    });
    studentProfile = await db.Student.create({
      userId: createdStudentUser.id,
      studentId: 'STU0001',
      grade: 'Grade 1'
    });
  } else {
    studentProfile = await db.Student.findOne({ where: { userId: studentUser.id } });
    if (!studentProfile) {
      studentProfile = await db.Student.create({
        userId: studentUser.id,
        studentId: 'STU0001',
        grade: 'Grade 1'
      });
    }
  }

  const parentUser = await db.User.findOne({ where: { email: 'parent@lsm3.com' } });
  if (!parentUser) {
    const createdParentUser = await db.User.create({
      email: 'parent@lsm3.com',
      password: 'parent123',
      firstName: 'Demo',
      lastName: 'Parent',
      role: 'parent',
      phone: '1234567893'
    });
    await db.Parent.create({
      userId: createdParentUser.id,
      studentId: studentProfile?.id || null,
      phone: '1234567893'
    });
  } else {
    const parentProfile = await db.Parent.findOne({ where: { userId: parentUser.id } });
    if (!parentProfile) {
      await db.Parent.create({
        userId: parentUser.id,
        studentId: studentProfile?.id || null,
        phone: '1234567893'
      });
    } else if (!parentProfile.studentId && studentProfile?.id) {
      await parentProfile.update({ studentId: studentProfile.id });
    }
  }

  const subjectCount = await db.Subject.count();
  if (subjectCount === 0) {
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Art', 'Music', 'Physical Education'];
    const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];

    for (const grade of grades) {
      for (const subject of subjects) {
        await db.Subject.create({
          name: subject,
          grade,
          teacherId: subject === 'Mathematics' ? teacherProfile?.id : null
        });
      }
    }
  }

  console.log('Initial data seeded');
}

startServer();
