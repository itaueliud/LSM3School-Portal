import express from 'express';
import { body } from 'express-validator';
import db from '../models/index.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { grade } = req.query;
    const where = {};
    if (grade) where.grade = grade;

    const subjects = await db.Subject.findAll({
      where,
      include: [{ model: db.Teacher, as: 'teacher', include: [{ model: db.User, as: 'user', attributes: ['firstName', 'lastName'] }] }]
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subjects', error: error.message });
  }
});

router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const subjects = await db.Subject.findAll({
      where: { teacherId: req.params.teacherId }
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher subjects', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const subject = await db.Subject.findByPk(req.params.id, {
      include: [{ model: db.Teacher, as: 'teacher', include: [{ model: db.User, as: 'user' }] }]
    });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subject', error: error.message });
  }
});

router.post('/', authorize('admin'), [
  body('name').notEmpty(),
  body('grade').notEmpty(),
  body('teacherId').optional().isInt()
], validate, async (req, res) => {
  try {
    const { name, grade, teacherId, description } = req.body;

    const subject = await db.Subject.create({
      name,
      grade,
      teacherId,
      description
    });

    res.status(201).json({ message: 'Subject created', subject });
  } catch (error) {
    res.status(500).json({ message: 'Error creating subject', error: error.message });
  }
});

router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const subject = await db.Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const { name, grade, teacherId, description } = req.body;
    await subject.update({ name, grade, teacherId, description });

    res.json({ message: 'Subject updated', subject });
  } catch (error) {
    res.status(500).json({ message: 'Error updating subject', error: error.message });
  }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const subject = await db.Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await subject.destroy();
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subject', error: error.message });
  }
});

export default router;
