import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Student from './Student.js';

const Parent = sequelize.define('Parent', {
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
    type: DataTypes.INTEGER,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING
  },
  occupation: {
    type: DataTypes.STRING
  }
});

Parent.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Parent.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
User.hasOne(Parent, { foreignKey: 'userId', as: 'parent' });
Student.hasMany(Parent, { foreignKey: 'studentId', as: 'parents' });

export default Parent;
