import express from 'express';
import { body } from 'express-validator';
import db from '../models/index.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/exam/:examId', async (req, res) => {
  try {
    const marks = await db.Mark.findAll({
      where: { examId: req.params.examId },
      include: [{ 
        model: db.Student,
        as: 'student',
        include: [{ model: db.User, as: 'user', attributes: ['firstName', 'lastName'] }]
      }]
    });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching marks', error: error.message });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const marks = await db.Mark.findAll({
      where: { studentId: req.params.studentId },
      include: [
        { model: db.Exam, as: 'exam', include: [{ model: db.Subject, as: 'subject' }] }
      ],
      order: [[{ model: db.Exam, as: 'exam' }, 'date', 'DESC']]
    });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching marks', error: error.message });
  }
});

router.get('/subject/:subjectId/student/:studentId', async (req, res) => {
  try {
    const exams = await db.Exam.findAll({ where: { subjectId: req.params.subjectId } });
    const examIds = exams.map(e => e.id);

    const marks = await db.Mark.findAll({
      where: { 
        studentId: req.params.studentId,
        examId: examIds
      },
      include: [{ model: db.Exam, as: 'exam' }]
    });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching marks', error: error.message });
  }
});

router.post('/', authorize('admin', 'teacher'), [
  body('examId').isInt(),
  body('studentId').isInt(),
  body('marks').isFloat({ min: 0 })
], validate, async (req, res) => {
  try {
    const { examId, studentId, marks, feedback } = req.body;

    const existing = await db.Mark.findOne({
      where: { examId, studentId }
    });

    if (existing) {
      await existing.update({ marks, gradedBy: req.userId, feedback });
      return res.json({ message: 'Marks updated', mark: existing });
    }

    const mark = await db.Mark.create({
      examId,
      studentId,
      marks,
      gradedBy: req.userId,
      feedback
    });

    res.status(201).json({ message: 'Marks entered', mark });
  } catch (error) {
    res.status(500).json({ message: 'Error entering marks', error: error.message });
  }
});

router.post('/bulk', authorize('admin', 'teacher'), [
  body('examId').isInt(),
  body('records').isArray()
], validate, async (req, res) => {
  try {
    const { examId, records } = req.body;

    for (const record of records) {
      const existing = await db.Mark.findOne({
        where: { examId, studentId: record.studentId }
      });

      if (existing) {
        await existing.update({ marks: record.marks, gradedBy: req.userId, feedback: record.feedback });
      } else {
        await db.Mark.create({
          examId,
          studentId: record.studentId,
          marks: record.marks,
          gradedBy: req.userId,
          feedback: record.feedback
        });
      }
    }

    res.json({ message: 'Bulk marks entered' });
  } catch (error) {
    res.status(500).json({ message: 'Error entering bulk marks', error: error.message });
  }
});

router.put('/:id', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const mark = await db.Mark.findByPk(req.params.id);
    if (!mark) {
      return res.status(404).json({ message: 'Mark not found' });
    }

    const { marks, feedback } = req.body;
    await mark.update({ marks, feedback, gradedBy: req.userId });

    res.json({ message: 'Mark updated', mark });
  } catch (error) {
    res.status(500).json({ message: 'Error updating mark', error: error.message });
  }
});

router.get('/stats/student/:studentId', async (req, res) => {
  try {
    const marks = await db.Mark.findAll({
      where: { studentId: req.params.studentId },
      include: [{ model: db.Exam, as: 'exam', include: [{ model: db.Subject, as: 'subject' }] }]
    });

    const stats = {
      totalExams: marks.length,
      average: 0,
      highest: 0,
      lowest: 0,
      bySubject: {}
    };

    if (marks.length > 0) {
      const markValues = marks.map(m => parseFloat(m.marks));
      stats.average = (markValues.reduce((a, b) => a + b, 0) / markValues.length).toFixed(2);
      stats.highest = Math.max(...markValues);
      stats.lowest = Math.min(...markValues);
    }

    marks.forEach(mark => {
      const subjectName = mark.exam?.subject?.name || 'Unknown';
      if (!stats.bySubject[subjectName]) {
        stats.bySubject[subjectName] = { total: 0, count: 0, marks: [] };
      }
      stats.bySubject[subjectName].marks.push(parseFloat(mark.marks));
      stats.bySubject[subjectName].count++;
    });

    Object.keys(stats.bySubject).forEach(subject => {
      const marksArr = stats.bySubject[subject].marks;
      stats.bySubject[subject].average = (marksArr.reduce((a, b) => a + b, 0) / marksArr.length).toFixed(2);
      delete stats.bySubject[subject].marks;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

export default router;
