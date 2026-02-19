import express from 'express';
import { Op } from 'sequelize';
import db from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/attendance/:grade', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { grade: req.params.grade };
    
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }

    const attendance = await db.Attendance.findAll({ where });
    
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length
    };

    stats.percentage = stats.total > 0 
      ? ((stats.present + stats.late + stats.excused) / stats.total * 100).toFixed(2)
      : 0;

    const byDate = {};
    attendance.forEach(a => {
      if (!byDate[a.date]) {
        byDate[a.date] = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
      }
      byDate[a.date][a.status]++;
      byDate[a.date].total++;
    });

    res.json({ stats, byDate });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance analytics', error: error.message });
  }
});

router.get('/performance/:grade', async (req, res) => {
  try {
    const exams = await db.Exam.findAll({ where: { grade: req.params.grade } });
    const examIds = exams.map(e => e.id);

    const marks = examIds.length === 0
      ? []
      : await db.Mark.findAll({
          where: { examId: { [Op.in]: examIds } },
          include: [
            { model: db.Exam, as: 'exam', include: [{ model: db.Subject, as: 'subject' }] }
          ]
        });

    const stats = {
      totalExams: exams.length,
      totalMarks: marks.length,
      average: 0,
      highest: 0,
      lowest: 0,
      gradeDistribution: {
        'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0
      },
      bySubject: {},
      byStudent: {}
    };

    if (marks.length > 0) {
      const markValues = marks.map(m => parseFloat(m.marks));
      stats.average = (markValues.reduce((a, b) => a + b, 0) / markValues.length).toFixed(2);
      stats.highest = Math.max(...markValues);
      stats.lowest = Math.min(...markValues);

      markValues.forEach(m => {
        if (m >= 90) stats.gradeDistribution.A++;
        else if (m >= 80) stats.gradeDistribution.B++;
        else if (m >= 70) stats.gradeDistribution.C++;
        else if (m >= 60) stats.gradeDistribution.D++;
        else stats.gradeDistribution.F++;
      });
    }

    marks.forEach(mark => {
      const subjectName = mark.exam?.subject?.name || 'Unknown';
      if (!stats.bySubject[subjectName]) {
        stats.bySubject[subjectName] = { total: 0, count: 0 };
      }
      stats.bySubject[subjectName].total += parseFloat(mark.marks);
      stats.bySubject[subjectName].count++;
    });

    Object.keys(stats.bySubject).forEach(subject => {
      stats.bySubject[subject].average = (stats.bySubject[subject].total / stats.bySubject[subject].count).toFixed(2);
    });

    marks.forEach(mark => {
      const studentId = mark.studentId;
      if (!stats.byStudent[studentId]) {
        stats.byStudent[studentId] = { total: 0, count: 0 };
      }
      stats.byStudent[studentId].total += parseFloat(mark.marks);
      stats.byStudent[studentId].count++;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching performance analytics', error: error.message });
  }
});

router.get('/overview', async (req, res) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalParents,
      totalExams,
      totalHomework,
      recentAnnouncements
    ] = await Promise.all([
      db.Student.count(),
      db.Teacher.count(),
      db.Parent.count(),
      db.Exam.count(),
      db.Homework.count(),
      db.Announcement.findAll({ limit: 5, order: [['createdAt', 'DESC']] })
    ]);

    const attendance = await db.Attendance.findAll({
      where: { date: new Date().toISOString().split('T')[0] }
    });

    const todayStats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length
    };

    res.json({
      totalStudents,
      totalTeachers,
      totalParents,
      totalExams,
      totalHomework,
      todayAttendance: todayStats,
      recentAnnouncements
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overview', error: error.message });
  }
});

router.get('/student/:studentId/progress', async (req, res) => {
  try {
    const marks = await db.Mark.findAll({
      where: { studentId: req.params.studentId },
      include: [
        { 
          model: db.Exam,
          as: 'exam',
          include: [{ model: db.Subject, as: 'subject' }]
        }
      ],
      order: [[{ model: db.Exam, as: 'exam' }, 'date', 'ASC']]
    });

    const attendance = await db.Attendance.findAll({
      where: { studentId: req.params.studentId },
      order: [['date', 'DESC']],
      limit: 30
    });

    const homework = await db.HomeworkSubmission.findAll({
      where: { studentId: req.params.studentId },
      include: [{ model: db.Homework, as: 'homework' }]
    });

    const performance = marks.map(m => ({
      subject: m.exam?.subject?.name,
      marks: parseFloat(m.marks),
      examDate: m.exam?.date,
      totalMarks: m.exam?.totalMarks
    }));

    const attendanceStats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      percentage: attendance.length > 0 
        ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(2)
        : 0
    };

    const homeworkStats = {
      total: homework.length,
      submitted: homework.filter(h => h.submittedAt).length,
      pending: homework.length - homework.filter(h => h.submittedAt).length,
      graded: homework.filter(h => h.grade).length
    };

    res.json({ performance, attendance: attendanceStats, homework: homeworkStats });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student progress', error: error.message });
  }
});

export default router;
