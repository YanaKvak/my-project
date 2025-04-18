import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const TaskStatus = sequelize.define('TaskStatus', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'task_status',
  timestamps: false,
});

export default TaskStatus;