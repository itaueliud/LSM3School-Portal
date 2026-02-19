import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Teacher from './Teacher.js';

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  teacherId: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  }
});

Subject.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Teacher.hasMany(Subject, { foreignKey: 'teacherId', as: 'subjects' });

export default Subject;
