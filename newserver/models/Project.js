import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  team_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('active', 'archived'),
    allowNull: false,
    defaultValue: 'active',
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'projects',
  timestamps: true,
});

export default Project;