import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Exam from './Exam.js';
import Student from './Student.js';

const Mark = sequelize.define('Mark', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  examId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  marks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  gradedBy: {
    type: DataTypes.INTEGER
  },
  feedback: {
    type: DataTypes.TEXT
  }
});

Mark.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });
Mark.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

export default Mark;
