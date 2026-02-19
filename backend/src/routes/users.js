import express from 'express';
import { body, param } from 'express-validator';
import db from '../models/index.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

router.put('/:id', [
  body('firstName').optional(),
  body('lastName').optional(),
  body('email').optional().isEmail(),
  body('role').optional().isIn(['admin', 'teacher', 'student', 'parent'])
], validate, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { firstName, lastName, email, role, phone, password } = req.body;
    await user.update({ firstName, lastName, email, role, phone, password });

    res.json({ message: 'User updated', user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'student') {
      await db.Student.destroy({ where: { userId: user.id } });
    } else if (user.role === 'teacher') {
      await db.Teacher.destroy({ where: { userId: user.id } });
    } else if (user.role === 'parent') {
      await db.Parent.destroy({ where: { userId: user.id } });
    }

    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

export default router;
