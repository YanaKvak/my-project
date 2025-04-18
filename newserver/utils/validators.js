import { body, param, query } from 'express-validator';

const userSchema = {
  create: [
    body('username').isString().trim().isLength({ min: 3 }).withMessage('Имя пользователя должно содержать минимум 3 символа'),
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
    body('role').optional().isIn(['manager', 'employee', 'admin']).withMessage('Недопустимая роль'),
  ],
  id: [
    param('id').isInt().withMessage('ID должен быть целым числом'),
  ],
};

const teamSchema = {
  create: [
    body('name').isString().trim().isLength({ min: 3 }).withMessage('Название команды должно содержать минимум 3 символа'),
    body('description').optional().isString().withMessage('Описание должно быть строкой'),
    body('created_by').optional().isInt().withMessage('ID создателя должен быть целым числом'),
  ],
  update: [
    param('id').isInt().withMessage('ID команды должен быть целым числом'),
    body('name').optional().isString().trim().isLength({ min: 3 }).withMessage('Название команды должно содержать минимум 3 символа'),
    body('description').optional().isString().withMessage('Описание должно быть строкой'),
    body('created_by').optional().isInt().withMessage('ID создателя должен быть целым числом'),
  ],
  id: [
    param('id').isInt().withMessage('ID команды должен быть целым числом'),
  ],
};

const teamMemberSchema = {
  add: [
    param('id').isInt().withMessage('ID команды должен быть целым числом'),
    body('userId').isInt().withMessage('ID пользователя должен быть целым числом'),
  ],
  remove: [
    param('id').isInt().withMessage('ID команды должен быть целым числом'),
    param('userId').isInt().withMessage('ID пользователя должен быть целым числом'),
  ],
};

const projectSchema = {
  create: [
    body('name').isString().trim().isLength({ min: 3 }).withMessage('Название проекта должно содержать минимум 3 символа'),
    body('team_id').isInt().withMessage('ID команды должен быть целым числом'),
    body('status').isIn(['active', 'archived']).withMessage('Статус должен быть "active" или "archived"'),
    body('description').optional().isString().withMessage('Описание должно быть строкой'),
    body('deadline').optional().isISO8601().withMessage('Дедлайн должен быть в формате ISO8601'),
  ],
  update: [
    param('id').isInt().withMessage('ID проекта должен быть целым числом'),
    body('name').optional().isString().trim().isLength({ min: 3 }).withMessage('Название проекта должно содержать минимум 3 символа'),
    body('team_id').optional().isInt().withMessage('ID команды должен быть целым числом'),
    body('status').optional().isIn(['active', 'archived']).withMessage('Статус должен быть "active" или "archived"'),
    body('description').optional().isString().withMessage('Описание должно быть строкой'),
    body('deadline').optional().isISO8601().withMessage('Дедлайн должен быть в формате ISO8601'),
  ],
};

const taskSchema = {
  create: [
    body('title').isString().trim().isLength({ min: 3 }).withMessage('Название задачи должно содержать минимум 3 символа'),
    body('project_id').isInt().withMessage('ID проекта должен быть целым числом'),
    body('status_id').isInt().withMessage('ID статуса должен быть целым числом'),
    body('creator_id').isInt().withMessage('ID создателя должен быть целым числом'),
    body('priority').isIn(['low', 'medium', 'high']).withMessage('Приоритет должен быть "low", "medium" или "high"'),
    body('due_date').optional().isISO8601().withMessage('Дата выполнения должна быть в формате ISO8601'),
    body('description').optional().isString().withMessage('Описание должно быть строкой'),
  ],
  update: [
    param('id').isInt().withMessage('ID задачи должен быть целым числом'),
    body('title').optional().isString().trim().isLength({ min: 3 }).withMessage('Название задачи должно содержать минимум 3 символа'),
    body('project_id').optional().isInt().withMessage('ID проекта должен быть целым числом'),
    body('status_id').optional().isInt().withMessage('ID статуса должен быть целым числом'),
    body('creator_id').optional().isInt().withMessage('ID создателя должен быть целым числом'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Приоритет должен быть "low", "medium" или "high"'),
    body('due_date').optional().isISO8601().withMessage('Дата выполнения должна быть в формате ISO8601'),
    body('description').optional().isString().withMessage('Описание должно быть строкой'),
  ],
  id: [
    param('id').isInt().withMessage('ID задачи должен быть целым числом'),
  ],
};

const tagSchema = {
  create: [
    body('name').isString().trim().isLength({ min: 1 }).withMessage('Название тега должно содержать минимум 1 символ'),
    body('color').isString().isHexColor().withMessage('Цвет должен быть в формате HEX'),
  ],
  update: [
    param('id').isInt().withMessage('ID тега должен быть целым числом'),
    body('name').optional().isString().trim().isLength({ min: 1 }).withMessage('Название тега должно содержать минимум 1 символ'),
    body('color').optional().isString().isHexColor().withMessage('Цвет должен быть в формате HEX'),
  ],
  id: [
    param('id').isInt().withMessage('ID тега должен быть целым числом'),
  ],
};

const taskTagSchema = {
  create: [
    param('id').isInt().withMessage('ID задачи должен быть целым числом'),
    body('tag_ids').isArray({ min: 1 }).withMessage('Должен быть указан хотя бы один тег'),
    body('tag_ids.*').isInt().withMessage('ID тега должен быть целым числом'),
  ],
  delete: [
    param('taskId').isInt().withMessage('ID задачи должен быть целым числом'),
    param('tagId').isInt().withMessage('ID тега должен быть целым числом'),
  ],
};

const eventSchema = {
  query: [
    query('userId').isInt().withMessage('ID пользователя должен быть целым числом'),
  ],
  create: [
    body('userId').isInt().withMessage('ID пользователя должен быть целым числом'),
    body('title').isString().trim().isLength({ min: 1 }).withMessage('Название события должно содержать минимум 1 символ'),
    body('description').optional().isString().withMessage('Описание должно быть строкой'),
    body('eventDate').isISO8601().withMessage('Дата события должна быть в формате ISO8601'),
    body('eventTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Время события должно быть в формате HH:MM'),
    body('color').isString().isHexColor().withMessage('Цвет должен быть в формате HEX'),
  ],
  update: [
    param('id').isInt().withMessage('ID события должен быть целым числом'),
    body('title').optional().isString().trim().isLength({ min: 1 }).withMessage('Название события должно содержать минимум 1 символ'),
    body('description').optional().isString().withMessage('Описание должно быть строкой'),
    body('eventDate').optional().isISO8601().withMessage('Дата события должна быть в формате ISO8601'),
    body('eventTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Время события должно быть в формате HH:MM'),
    body('color').optional().isString().isHexColor().withMessage('Цвет должен быть в формате HEX'),
  ],
  id: [
    param('id').isInt().withMessage('ID события должен быть целым числом'),
  ],
};

const authSchema = {
  register: [
    body('username').isString().trim().isLength({ min: 3 }).withMessage('Имя пользователя должно содержать минимум 3 символа'),
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
    body('role').optional().isIn(['manager', 'employee', 'admin']).withMessage('Недопустимая роль'),
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
  ],
};

export { userSchema, teamSchema, teamMemberSchema, projectSchema, taskSchema, tagSchema, taskTagSchema, eventSchema, authSchema };