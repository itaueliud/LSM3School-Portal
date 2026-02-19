import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Subject from './Subject.js';

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  totalMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100
  },
  duration: {
    type: DataTypes.INTEGER
  },
  instructions: {
    type: DataTypes.TEXT
  },
  createdBy: {
    type: DataTypes.INTEGER
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

Exam.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

export default Exam;
