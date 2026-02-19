import express from 'express';
import { body } from 'express-validator';
import { Op } from 'sequelize';
import db from '../models/index.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const where = {};
    const andConditions = [];

    if (req.user.role !== 'admin') {
      andConditions.push({
        [Op.or]: [{ targetRole: 'all' }, { targetRole: req.user.role }]
      });
    }

    if (req.query.grade) {
      andConditions.push({
        [Op.or]: [{ grade: req.query.grade }, { grade: null }]
      });
    }

    if (andConditions.length > 0) {
      where[Op.and] = andConditions;
    }

    const announcements = await db.Announcement.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const announcement = await db.Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcement', error: error.message });
  }
});

router.post('/', authorize('admin', 'teacher'), [
  body('title').notEmpty(),
  body('content').notEmpty(),
  body('targetRole').optional().isIn(['all', 'teacher', 'student', 'parent'])
], validate, async (req, res) => {
  try {
    const { title, content, targetRole, grade, priority } = req.body;

    const announcement = await db.Announcement.create({
      title,
      content,
      targetRole: targetRole || 'all',
      grade,
      priority,
      createdBy: req.userId
    });

    if (req.app.get('io')) {
      req.app.get('io').emit('new_announcement', announcement);
    }

    res.status(201).json({ message: 'Announcement created', announcement });
  } catch (error) {
    res.status(500).json({ message: 'Error creating announcement', error: error.message });
  }
});

router.put('/:id', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const announcement = await db.Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    const { title, content, targetRole, grade, priority } = req.body;
    await announcement.update({ title, content, targetRole, grade, priority });

    res.json({ message: 'Announcement updated', announcement });
  } catch (error) {
    res.status(500).json({ message: 'Error updating announcement', error: error.message });
  }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const announcement = await db.Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await announcement.destroy();
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting announcement', error: error.message });
  }
});

export default router;
