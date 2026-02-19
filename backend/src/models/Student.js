import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  studentId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  section: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT
  }
});

Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Student, { foreignKey: 'userId', as: 'student' });

export default Student;
