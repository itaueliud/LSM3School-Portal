import express from 'express';
import { body } from 'express-validator';
import db from '../models/index.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { grade, dayOfWeek } = req.query;
    const where = {};
    if (grade) where.grade = grade;
    if (dayOfWeek) where.dayOfWeek = dayOfWeek;

    const timetable = await db.Timetable.findAll({
      where,
      include: [{ model: db.Subject, as: 'subject' }],
      order: [['dayOfWeek'], ['startTime']]
    });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timetable', error: error.message });
  }
});

router.get('/grade/:grade', async (req, res) => {
  try {
    const { day } = req.query;
    const where = { grade: req.params.grade };
    if (day) where.dayOfWeek = day;

    const timetable = await db.Timetable.findAll({
      where,
      include: [{ model: db.Subject, as: 'subject' }],
      order: [['dayOfWeek'], ['startTime']]
    });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timetable', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const timetable = await db.Timetable.findByPk(req.params.id, {
      include: [{ model: db.Subject, as: 'subject' }]
    });
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timetable entry', error: error.message });
  }
});

router.post('/', authorize('admin', 'teacher'), [
  body('subjectId').isInt(),
  body('grade').notEmpty(),
  body('dayOfWeek').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']),
  body('startTime').notEmpty(),
  body('endTime').notEmpty()
], validate, async (req, res) => {
  try {
    const { subjectId, grade, section, dayOfWeek, startTime, endTime, room } = req.body;

    const timetable = await db.Timetable.create({
      subjectId,
      grade,
      section,
      dayOfWeek,
      startTime,
      endTime,
      room
    });

    res.status(201).json({ message: 'Timetable entry created', timetable });
  } catch (error) {
    res.status(500).json({ message: 'Error creating timetable entry', error: error.message });
  }
});

router.put('/:id', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const timetable = await db.Timetable.findByPk(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    const { subjectId, grade, section, dayOfWeek, startTime, endTime, room } = req.body;
    await timetable.update({ subjectId, grade, section, dayOfWeek, startTime, endTime, room });

    res.json({ message: 'Timetable entry updated', timetable });
  } catch (error) {
    res.status(500).json({ message: 'Error updating timetable entry', error: error.message });
  }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const timetable = await db.Timetable.findByPk(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    await timetable.destroy();
    res.json({ message: 'Timetable entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting timetable entry', error: error.message });
  }
});

export default router;
