import express from 'express';
import { body } from 'express-validator';
import db from '../models/index.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { grade, subjectId } = req.query;
    const where = {};
    if (grade) where.grade = grade;
    if (subjectId) where.subjectId = subjectId;

    const exams = await db.Exam.findAll({
      where,
      include: [{ model: db.Subject, as: 'subject' }],
      order: [['date', 'DESC']]
    });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exams', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const exam = await db.Exam.findByPk(req.params.id, {
      include: [{ model: db.Subject, as: 'subject' }]
    });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exam', error: error.message });
  }
});

router.post('/', authorize('admin', 'teacher'), [
  body('title').notEmpty(),
  body('subjectId').isInt(),
  body('date').isISO8601(),
  body('grade').notEmpty(),
  body('totalMarks').optional().isInt()
], validate, async (req, res) => {
  try {
    const { title, subjectId, date, totalMarks, duration, instructions, grade } = req.body;

    const exam = await db.Exam.create({
      title,
      subjectId,
      date,
      totalMarks: totalMarks || 100,
      duration,
      instructions,
      grade,
      createdBy: req.userId
    });

    res.status(201).json({ message: 'Exam created', exam });
  } catch (error) {
    res.status(500).json({ message: 'Error creating exam', error: error.message });
  }
});

router.put('/:id', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const exam = await db.Exam.findByPk(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const { title, subjectId, date, totalMarks, duration, instructions } = req.body;
    await exam.update({ title, subjectId, date, totalMarks, duration, instructions });

    res.json({ message: 'Exam updated', exam });
  } catch (error) {
    res.status(500).json({ message: 'Error updating exam', error: error.message });
  }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const exam = await db.Exam.findByPk(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    await db.Mark.destroy({ where: { examId: exam.id } });
    await exam.destroy();

    res.json({ message: 'Exam deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting exam', error: error.message });
  }
});

export default router;
