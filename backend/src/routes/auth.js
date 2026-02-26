import express from 'express';
import { body } from 'express-validator';
import db from '../models/index.js';
import { validate } from '../middleware/validate.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name required'),
  body('lastName').notEmpty().withMessage('Last name required'),
  body('role').isIn(['admin', 'teacher', 'student', 'parent']).withMessage('Valid role required')
], validate, async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;

    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await db.User.create({
      email,
      password,
      firstName,
      lastName,
      role,
      phone
    });

    if (role === 'student') {
      await db.Student.create({
        userId: user.id,
        studentId: `STU${Date.now()}`,
        grade: req.body.grade || 'Grade 1'
      });
    } else if (role === 'teacher') {
      await db.Teacher.create({
        userId: user.id,
        employeeId: `TCH${Date.now()}`,
        subject: req.body.subject || 'General'
      });
    } else if (role === 'parent') {
      await db.Parent.create({
        userId: user.id,
        studentId: req.body.studentId,
        phone: phone
      });
    }

    const token = generateToken(user);
    res.status(201).json({ 
      message: 'Registration successful', 
      token, 
      user: user.toJSON() 
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Sign up first.' });
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    const token = generateToken(user);
    
    let profile = null;
    if (user.role === 'student') {
      profile = await db.Student.findOne({ where: { userId: user.id } });
    } else if (user.role === 'teacher') {
      profile = await db.Teacher.findOne({ where: { userId: user.id } });
    } else if (user.role === 'parent') {
      profile = await db.Parent.findOne({ where: { userId: user.id }, include: [{ model: db.Student, as: 'student' }] });
    }

    res.json({ 
      message: 'Login successful', 
      token, 
      user: user.toJSON(),
      profile
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    let profile = null;
    if (user.role === 'student') {
      profile = await db.Student.findOne({ where: { userId: user.id }, include: [{ model: db.User, as: 'user' }] });
    } else if (user.role === 'teacher') {
      profile = await db.Teacher.findOne({ where: { userId: user.id }, include: [{ model: db.User, as: 'user' }] });
    } else if (user.role === 'parent') {
      profile = await db.Parent.findOne({ where: { userId: user.id }, include: [{ model: db.Student, as: 'student' }] });
    }

    res.json({ user: user.toJSON(), profile });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

export default router;
