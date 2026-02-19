import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Subject from './Subject.js';

const Homework = sequelize.define('Homework', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assignedBy: {
    type: DataTypes.INTEGER
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  section: {
    type: DataTypes.STRING
  },
  attachments: {
    type: DataTypes.TEXT
  }
});

Homework.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

export default Homework;
