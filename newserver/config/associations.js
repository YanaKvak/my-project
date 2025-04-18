import User from '../models/User.js';
import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import TaskStatus from '../models/TaskStatus.js';
import Tag from '../models/Tag.js';
import Event from '../models/Event.js';

const setupAssociations = () => {
  // User -> Team
  User.hasMany(Team, { foreignKey: 'created_by', as: 'teamsCreated' });
  Team.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // User -> Task
  User.hasMany(Task, { foreignKey: 'creator_id', as: 'tasksCreated' });
  Task.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });

  // User -> TeamMember
  User.belongsToMany(Team, { through: TeamMember, foreignKey: 'users_id', otherKey: 'team_id', as: 'teams' });
  Team.belongsToMany(User, { through: TeamMember, foreignKey: 'team_id', otherKey: 'users_id', as: 'members' });

  // Team -> Project
  Team.hasMany(Project, { foreignKey: 'team_id', as: 'projects' });
  Project.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

  // Project -> Task
  Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks' });
  Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

  // TaskStatus -> Task
  TaskStatus.hasMany(Task, { foreignKey: 'status_id', as: 'tasks' });
  Task.belongsTo(TaskStatus, { foreignKey: 'status_id', as: 'status' });

  // Task <-> Tag (many-to-many)
  Task.belongsToMany(Tag, { through: 'TaskTag', foreignKey: 'task_id', otherKey: 'tag_id', as: 'tags' });
  Tag.belongsToMany(Task, { through: 'TaskTag', foreignKey: 'tag_id', otherKey: 'task_id', as: 'tasks' });

  // User -> Event
  User.hasMany(Event, { foreignKey: 'user_id', as: 'events' });
  Event.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
};

export default setupAssociations;