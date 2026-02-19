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

    const homework = await db.Homework.findAll({
      where,
      include: [{ model: db.Subject, as: 'subject' }],
      order: [['dueDate', 'ASC']]
    });
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching homework', error: error.message });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const student = await db.Student.findByPk(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const homework = await db.Homework.findAll({
      where: { grade: student.grade },
      include: [{ model: db.Subject, as: 'subject' }],
      order: [['dueDate', 'ASC']]
    });

    const homeworkWithSubmissions = await Promise.all(
      homework.map(async (hw) => {
        const submission = await db.HomeworkSubmission.findOne({
          where: { homeworkId: hw.id, studentId: student.id }
        });
        return { ...hw.toJSON(), submission };
      })
    );

    res.json(homeworkWithSubmissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching homework', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const homework = await db.Homework.findByPk(req.params.id, {
      include: [{ model: db.Subject, as: 'subject' }]
    });
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    const submissions = await db.HomeworkSubmission.findAll({
      where: { homeworkId: homework.id },
      include: [{ model: db.Student, as: 'student', include: [{ model: db.User, as: 'user', attributes: ['firstName', 'lastName'] }] }]
    });

    res.json({ ...homework.toJSON(), submissions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching homework', error: error.message });
  }
});

router.post('/', authorize('admin', 'teacher'), [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('subjectId').isInt(),
  body('dueDate').isISO8601(),
  body('grade').notEmpty()
], validate, async (req, res) => {
  try {
    const { title, description, subjectId, dueDate, grade, section } = req.body;

    const homework = await db.Homework.create({
      title,
      description,
      subjectId,
      dueDate,
      grade,
      section,
      assignedBy: req.userId
    });

    res.status(201).json({ message: 'Homework created', homework });
  } catch (error) {
    res.status(500).json({ message: 'Error creating homework', error: error.message });
  }
});

router.put('/:id', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const homework = await db.Homework.findByPk(req.params.id);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    const { title, description, subjectId, dueDate, grade, section } = req.body;
    await homework.update({ title, description, subjectId, dueDate, grade, section });

    res.json({ message: 'Homework updated', homework });
  } catch (error) {
    res.status(500).json({ message: 'Error updating homework', error: error.message });
  }
});

router.delete('/:id', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const homework = await db.Homework.findByPk(req.params.id);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    await db.HomeworkSubmission.destroy({ where: { homeworkId: homework.id } });
    await homework.destroy();

    res.json({ message: 'Homework deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting homework', error: error.message });
  }
});

router.post('/:id/submit', async (req, res) => {
  try {
    const homework = await db.Homework.findByPk(req.params.id);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    let student;
    if (req.user.role === 'student') {
      student = await db.Student.findOne({ where: { userId: req.user.id } });
    } else if (req.body.studentId) {
      student = await db.Student.findByPk(req.body.studentId);
    }

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const existing = await db.HomeworkSubmission.findOne({
      where: { homeworkId: homework.id, studentId: student.id }
    });

    if (existing) {
      await existing.update({
        submissionText: req.body.submissionText,
        attachmentUrl: req.body.attachmentUrl,
        submittedAt: new Date()
      });
      return res.json({ message: 'Homework updated', submission: existing });
    }

    const submission = await db.HomeworkSubmission.create({
      homeworkId: homework.id,
      studentId: student.id,
      submissionText: req.body.submissionText,
      attachmentUrl: req.body.attachmentUrl
    });

    res.status(201).json({ message: 'Homework submitted', submission });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting homework', error: error.message });
  }
});

router.put('/:id/submission/:submissionId/grade', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const submission = await db.HomeworkSubmission.findByPk(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const { grade, feedback } = req.body;
    await submission.update({ grade, feedback });

    res.json({ message: 'Submission graded', submission });
  } catch (error) {
    res.status(500).json({ message: 'Error grading submission', error: error.message });
  }
});

export default router;
