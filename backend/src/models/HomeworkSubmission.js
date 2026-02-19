import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Homework from './Homework.js';
import Student from './Student.js';

const HomeworkSubmission = sequelize.define('HomeworkSubmission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  homeworkId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  submissionText: {
    type: DataTypes.TEXT
  },
  attachmentUrl: {
    type: DataTypes.STRING
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  grade: {
    type: DataTypes.STRING
  },
  feedback: {
    type: DataTypes.TEXT
  }
});

HomeworkSubmission.belongsTo(Homework, { foreignKey: 'homeworkId', as: 'homework' });
HomeworkSubmission.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

export default HomeworkSubmission;
