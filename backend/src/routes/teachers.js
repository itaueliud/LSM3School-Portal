import express from 'express';
import { body } from 'express-validator';
import db from '../models/index.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const teachers = await db.Teacher.findAll({
      include: [{ model: db.User, as: 'user', attributes: { exclude: ['password'] } }]
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const teacher = await db.Teacher.findByPk(req.params.id, {
      include: [{ model: db.User, as: 'user', attributes: { exclude: ['password'] } }]
    });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher', error: error.message });
  }
});

router.post('/', authorize('admin'), [
  body('email').isEmail(),
  body('password').notEmpty(),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('subject').notEmpty()
], validate, async (req, res) => {
  try {
    const { email, password, firstName, lastName, subject, qualification } = req.body;

    const user = await db.User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'teacher'
    });

    const teacher = await db.Teacher.create({
      userId: user.id,
      employeeId: `TCH${Date.now()}`,
      subject,
      qualification
    });

    res.status(201).json({ message: 'Teacher created', teacher, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: 'Error creating teacher', error: error.message });
  }
});

router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const teacher = await db.Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const { subject, qualification } = req.body;
    await teacher.update({ subject, qualification });

    res.json({ message: 'Teacher updated', teacher });
  } catch (error) {
    res.status(500).json({ message: 'Error updating teacher', error: error.message });
  }
});

export default router;
