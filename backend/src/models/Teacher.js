import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Teacher = sequelize.define('Teacher', {
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
  employeeId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  qualification: {
    type: DataTypes.STRING
  }
});

Teacher.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Teacher, { foreignKey: 'userId', as: 'teacher' });

export default Teacher;
