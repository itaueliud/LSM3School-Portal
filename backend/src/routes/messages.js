import express from 'express';
import { body } from 'express-validator';
import { Op } from 'sequelize';
import db from '../models/index.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const messages = await db.Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.userId },
          { receiverId: req.userId }
        ]
      },
      include: [
        { model: db.User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'role'] },
        { model: db.User, as: 'receiver', attributes: ['id', 'firstName', 'lastName', 'role'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

router.get('/conversation/:userId', async (req, res) => {
  try {
    const otherUserId = parseInt(req.params.userId);
    
    const messages = await db.Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: req.userId }
        ]
      },
      include: [
        { model: db.User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'role'] },
        { model: db.User, as: 'receiver', attributes: ['id', 'firstName', 'lastName', 'role'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    await db.Message.update(
      { read: true },
      { where: { senderId: otherUserId, receiverId: req.userId, read: false } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversation', error: error.message });
  }
});

router.get('/unread', async (req, res) => {
  try {
    const messages = await db.Message.findAll({
      where: { receiverId: req.userId, read: false },
      include: [
        { model: db.User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'role'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread messages', error: error.message });
  }
});

router.post('/', [
  body('receiverId').isInt(),
  body('content').notEmpty()
], validate, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    const message = await db.Message.create({
      senderId: req.userId,
      receiverId,
      content
    });

    const fullMessage = await db.Message.findByPk(message.id, {
      include: [
        { model: db.User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'role'] },
        { model: db.User, as: 'receiver', attributes: ['id', 'firstName', 'lastName', 'role'] }
      ]
    });

    if (req.app.get('io')) {
      req.app.get('io').to(`user_${receiverId}`).emit('new_message', fullMessage);
    }

    res.status(201).json({ message: 'Message sent', data: fullMessage });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const message = await db.Message.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.update({ read: true });
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking message as read', error: error.message });
  }
});

router.get('/contacts', async (req, res) => {
  try {
    const sentMessages = await db.Message.findAll({
      where: { senderId: req.userId },
      attributes: ['receiverId'],
      group: ['receiverId']
    });

    const receivedMessages = await db.Message.findAll({
      where: { receiverId: req.userId },
      attributes: ['senderId'],
      group: ['senderId']
    });

    const contactIds = new Set([
      ...sentMessages.map(m => m.receiverId),
      ...receivedMessages.map(m => m.senderId)
    ]);

    const contacts = await db.User.findAll({
      where: { id: { [Op.in]: Array.from(contactIds) } },
      attributes: ['id', 'firstName', 'lastName', 'role']
    });

    const contactsWithUnread = await Promise.all(
      contacts.map(async (contact) => {
        const unread = await db.Message.count({
          where: { senderId: contact.id, receiverId: req.userId, read: false }
        });
        return { ...contact.toJSON(), unreadCount: unread };
      })
    );

    res.json(contactsWithUnread);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
});

export default router;
