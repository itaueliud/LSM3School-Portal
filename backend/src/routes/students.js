import express from 'express';
import { body, param } from 'express-validator';
import db from '../models/index.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    let students;
    if (req.user.role === 'parent') {
      const parent = await db.Parent.findOne({ where: { userId: req.user.id } });
      students = await db.Student.findAll({
        where: { id: parent.studentId },
        include: [{ model: db.User, as: 'user', attributes: { exclude: ['password'] } }]
      });
    } else if (req.user.role === 'teacher') {
      const teacher = await db.Teacher.findOne({ where: { userId: req.user.id } });
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher profile not found' });
      }
      students = await db.Student.findAll({
        where: { grade: req.query.grade },
        include: [{ model: db.User, as: 'user', attributes: { exclude: ['password'] } }]
      });
    } else {
      students = await db.Student.findAll({
        include: [{ model: db.User, as: 'user', attributes: { exclude: ['password'] } }]
      });
    }
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

router.get('/grade/:grade', async (req, res) => {
  try {
    const students = await db.Student.findAll({
      where: { grade: req.params.grade },
      include: [{ model: db.User, as: 'user', attributes: { exclude: ['password'] } }]
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const student = await db.Student.findByPk(req.params.id, {
      include: [{ model: db.User, as: 'user', attributes: { exclude: ['password'] } }]
    });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
});

router.post('/', authorize('admin'), [
  body('email').isEmail(),
  body('password').notEmpty(),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('grade').notEmpty(),
  body('studentId').optional()
], validate, async (req, res) => {
  try {
    const { email, password, firstName, lastName, grade, section, dateOfBirth } = req.body;

    const user = await db.User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'student'
    });

    const student = await db.Student.create({
      userId: user.id,
      studentId: `STU${Date.now()}`,
      grade,
      section,
      dateOfBirth
    });

    res.status(201).json({ message: 'Student created', student, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: 'Error creating student', error: error.message });
  }
});

router.put('/:id', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const student = await db.Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { grade, section, dateOfBirth, address } = req.body;
    await student.update({ grade, section, dateOfBirth, address });

    res.json({ message: 'Student updated', student });
  } catch (error) {
    res.status(500).json({ message: 'Error updating student', error: error.message });
  }
});

export default router;
