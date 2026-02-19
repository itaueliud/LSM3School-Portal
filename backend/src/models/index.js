import sequelize from '../config/database.js';
import User from './User.js';
import Student from './Student.js';
import Teacher from './Teacher.js';
import Parent from './Parent.js';
import Subject from './Subject.js';
import Attendance from './Attendance.js';
import Exam from './Exam.js';
import Mark from './Mark.js';
import Homework from './Homework.js';
import HomeworkSubmission from './HomeworkSubmission.js';
import Message from './Message.js';
import Announcement from './Announcement.js';
import Timetable from './Timetable.js';

const db = {
  sequelize,
  User,
  Student,
  Teacher,
  Parent,
  Subject,
  Attendance,
  Exam,
  Mark,
  Homework,
  HomeworkSubmission,
  Message,
  Announcement,
  Timetable
};

export default db;
