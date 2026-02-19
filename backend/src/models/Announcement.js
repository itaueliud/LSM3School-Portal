import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER
  },
  targetRole: {
    type: DataTypes.ENUM('all', 'teacher', 'student', 'parent'),
    defaultValue: 'all'
  },
  grade: {
    type: DataTypes.STRING
  },
  priority: {
    type: DataTypes.ENUM('normal', 'important', 'urgent'),
    defaultValue: 'normal'
  }
});

export default Announcement;
