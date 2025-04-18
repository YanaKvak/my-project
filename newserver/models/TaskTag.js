import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Task from './Task.js';
import Tag from './Tag.js';

const TaskTag = sequelize.define('TaskTag', {
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Task,
      key: 'id',
    },
  },
  tag_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Tag,
      key: 'id',
    },
  },
}, {
  tableName: 'task_tags',
  timestamps: false,
});

Task.belongsToMany(Tag, { through: TaskTag, foreignKey: 'task_id', as: 'tags' });
Tag.belongsToMany(Task, { through: TaskTag, foreignKey: 'tag_id', as: 'tasks' });

export default TaskTag;