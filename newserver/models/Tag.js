import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Tag = sequelize.define('Tag', {
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
  tableName: 'tags',
  timestamps: true,
});

export default Tag;