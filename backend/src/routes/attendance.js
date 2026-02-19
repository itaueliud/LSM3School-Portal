import express from 'express';
import { body, param } from 'express-validator';
import { Op } from 'sequelize';
import db from '../models/index.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { date, grade } = req.query;
    const where = {};
    if (date) where.date = date;
    if (grade) where.grade = grade;

    const attendance = await db.Attendance.findAll({
      where,
      include: [{ model: db.Student, as: 'student', include: [{ model: db.User, as: 'user', attributes: ['firstName', 'lastName'] }] }]
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const attendance = await db.Attendance.findAll({
      where: { studentId: req.params.studentId },
      order: [['date', 'DESC']]
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
});

router.get('/class/:grade', async (req, res) => {
  try {
    const { date } = req.query;
    const where = { grade: req.params.grade };
    if (date) where.date = date;

    const students = await db.Student.findAll({ where: { grade: req.params.grade } });
    const attendance = await db.Attendance.findAll({
      where,
      include: [{ model: db.Student, as: 'student', include: [{ model: db.User, as: 'user', attributes: ['firstName', 'lastName'] }] }]
    });

    const result = students.map(student => {
      const record = attendance.find(a => a.studentId === student.id);
      return {
        student,
        status: record?.status || 'not_marked'
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class attendance', error: error.message });
  }
});

router.post('/', authorize('admin', 'teacher'), [
  body('studentId').isInt(),
  body('date').isISO8601(),
  body('status').isIn(['present', 'absent', 'late', 'excused']),
  body('grade').notEmpty()
], validate, async (req, res) => {
  try {
    const { studentId, date, status, notes } = req.body;

    const existing = await db.Attendance.findOne({
      where: { studentId, date }
    });

    if (existing) {
      await existing.update({ status, markedBy: req.userId, notes });
      return res.json({ message: 'Attendance updated', attendance: existing });
    }

    const attendance = await db.Attendance.create({
      studentId,
      date,
      status,
      markedBy: req.userId,
      grade: req.body.grade
    });

    res.status(201).json({ message: 'Attendance marked', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
});

router.post('/bulk', authorize('admin', 'teacher'), [
  body('records').isArray(),
  body('date').isISO8601(),
  body('grade').notEmpty()
], validate, async (req, res) => {
  try {
    const { records, date, grade } = req.body;

    for (const record of records) {
      const existing = await db.Attendance.findOne({
        where: { studentId: record.studentId, date }
      });

      if (existing) {
        await existing.update({ status: record.status, markedBy: req.userId });
      } else {
        await db.Attendance.create({
          studentId: record.studentId,
          date,
          status: record.status,
          markedBy: req.userId,
          grade
        });
      }
    }

    res.json({ message: 'Bulk attendance marked' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking bulk attendance', error: error.message });
  }
});

router.get('/stats/:grade', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { grade: req.params.grade };
    
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }

    const attendance = await db.Attendance.findAll({ where });
    
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length
    };

    stats.attendancePercentage = stats.total > 0 
      ? ((stats.present + stats.late + stats.excused) / stats.total * 100).toFixed(2)
      : 0;

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance stats', error: error.message });
  }
});

export default router;
