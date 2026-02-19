import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Student from './Student.js';
import Teacher from './Teacher.js';

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
    allowNull: false,
    defaultValue: 'present'
  },
  markedBy: {
    type: DataTypes.INTEGER
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
  }
});

Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendanceRecords' });

export default Attendance;
