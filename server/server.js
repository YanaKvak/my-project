const express = require('express');
const app = express();
const { body, param, validationResult } = require('express-validator');
const knex = require('knex')(require('../config/knexfile').development);
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors());
app.use(express.json());

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Base route
app.get('/api', (req, res) => {
  res.json({
    status: 'active',
    version: '1.0',
    available_endpoints: [
      'GET /api/users',
      'GET /api/users/:id',
      'POST /api/users',
      'PUT /api/users/:id',
      'DELETE /api/users/:id',
      'GET /api/projects',
      'POST /api/projects',
      'GET /api/tasks',
      'POST /api/tasks',
      'POST /api/tasks/:id/tags',
      'POST /api/teams',
      'GET /api/teams/:id',
      'PUT /api/teams/:id',
      'DELETE /api/teams/:id',
    ]
  });
});
// server.js
const corsOptions = {
  origin: 'http://localhost:3001', // URL вашего фронтенда
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// server.js (бэкенд)
app.get('/api/projects', async (req, res) => {
  try {
    // В реальном приложении используйте аутентификацию
    const userId = req.user?.id || 1; // Заглушка для теста
    
    const projects = await knex('projects')
      .select('projects.*')
      .leftJoin('project_members', 'projects.id', 'project_members.project_id')
      .where('project_members.user_id', userId)
      .orWhere('projects.owner_id', userId);

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// ====================== Users Endpoints ======================
// Get all users
app.get('/api/users/:id/profile', async (req, res) => {
  try {
    const user = await knex('users')
      .where({ id: req.params.id })
      .select('id', 'username', 'email', 'avatar_url')
      .first();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Get user by ID
app.get('/api/users/:id', 
  param('id').isInt().withMessage('ID must be an integer'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await knex('users')
        .where({ id: req.params.id })
        .select('id', 'username', 'email', 'role')
        .first();

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

// Create user
// Регистрация пользователя (исправленный endpoint)
app.post('/api/users', 
  [
    body('username').isString().trim().isLength({ min: 3 })
      .withMessage('Имя пользователя должно содержать минимум 3 символа'),
    body('email').isEmail().normalizeEmail()
      .withMessage('Введите корректный email'),
    body('password').isLength({ min: 6 })
      .withMessage('Пароль должен содержать минимум 6 символов'),
    body('role').optional().isIn(['manager', 'employee'])
      .withMessage('Недопустимая роль пользователя')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: "Ошибка валидации",
          errors: errors.array() 
        });
      }

      const { username, email, password, role = 'employee' } = req.body;

      // Проверка существования пользователя
      const existingUser = await knex('users')
        .where({ username })
        .orWhere({ email })
        .first();

      if (existingUser) {
        const conflicts = {};
        if (existingUser.username === username) conflicts.username = true;
        if (existingUser.email === email) conflicts.email = true;
        
        return res.status(409).json({ 
          error: "Пользователь уже существует",
          conflicts
        });
      }

      // Хеширование пароля
      const password_hash = await bcrypt.hash(password, 10);
      
      const [userId] = await knex('users')
        .insert({ username, email, password_hash, role })
        .returning('id');

      res.status(201).json({ 
        success: true,
        userId,
        message: "Пользователь успешно зарегистрирован" 
      });
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      res.status(500).json({ 
        error: "Внутренняя ошибка сервера",
        details: err.message 
      });
    }
  }
);
// Настройка Multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Обновление профиля пользователя
app.put('/api/users/:id/profile', 
  upload.single('avatar'), // Обработка загрузки файла
  async (req, res) => {
    try {
      const { id } = req.params;
      const { username } = req.body;
      
      const updates = {};
      if (username) updates.username = username;
      
      // Если загружен новый аватар
      if (req.file) {
        // Удаляем старый аватар, если он был
        const user = await knex('users').where({ id }).first();
        if (user.avatar_url) {
          const oldAvatarPath = path.join(__dirname, 'uploads/avatars', path.basename(user.avatar_url));
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
          }
        }
        
        updates.avatar_url = `/uploads/avatars/${req.file.filename}`;
        updates.updated_at = knex.fn.now();
      }
      
      await knex('users').where({ id }).update(updates);
      
      const updatedUser = await knex('users').where({ id }).first();
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar_url: updatedUser.avatar_url
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);
// Delete user
app.delete('/api/users/:id', 
  param('id').isInt(),
  async (req, res, next) => {
    try {
      const deletedCount = await knex('users')
        .where({ id: req.params.id })
        .del();

      if (deletedCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);
// ====================== Teams Endpoints ======================

app.post('/api/teams',
  [
    body('name').isString().trim().isLength({ min: 3 })
      .withMessage('Team name must be at least 3 characters'),
    body('description').optional().isString(),
    body('created_by').optional().isInt().withMessage('Creator ID must be an integer if provided')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: "Validation failed",
          errors: errors.array() 
        });
      }

      const { name, description, created_by } = req.body;

      // Проверка существования пользователя (если указан)
      if (created_by) {
        const userExists = await knex('users').where({ id: created_by }).first();
        if (!userExists) {
          return res.status(400).json({ error: "User with this ID not found" });
        }
      }

      // Проверка на уникальность имени команды
      const existingTeam = await knex('teams').where({ name }).first();
      if (existingTeam) {
        return res.status(409).json({ 
          error: "Team name already exists",
          existingTeamId: existingTeam.id
        });
      }

      // Вставка новой команды
      const insertedIds = await knex('teams')
        .insert({ 
          name, 
          description,
          created_by,
          created_at: knex.fn.now(),
        })
        .returning('id');

      const teamId = Array.isArray(insertedIds) ? insertedIds[0].id || insertedIds[0] : insertedIds;
      const newTeam = await knex('teams').where({ id: teamId }).first();

      res.status(201).json({
        message: "Team created successfully",
        team: newTeam
      });

    } catch (err) {
      if (err.code === '23505') { // PostgreSQL: ошибка уникальности
        return res.status(409).json({ error: "Team name already exists" });
      }
      next(err);
    }
  }
);


// GET All Teams
app.get('/api/teams', async (req, res, next) => {
  try {
    const teams = await knex('teams')
      .select('teams.*', 'users.username as creator_name')
      .leftJoin('users', 'teams.created_by', 'users.id');
    
    res.json(teams);
  } catch (err) {
    next(err);
  }
});

// GET Team by ID
app.get('/api/teams/:id',
  [
    param('id').isInt().withMessage('Team ID must be an integer')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const team = await knex('teams')
        .where('teams.id', req.params.id)
        .select('teams.*', 'users.username as creator_name')
        .leftJoin('users', 'teams.created_by', 'users.id')
        .first();

      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      res.json(team);
    } catch (err) {
      next(err);
    }
  }
);

// PUT Update Team
app.put('/api/teams/:id',
  [
    param('id').isInt().withMessage('Team ID must be an integer'),
    body('name').optional().isString().trim().isLength({ min: 3 }),
    body('description').optional().isString(),
    body('created_by').optional().isInt()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { name, description, created_by } = req.body;

      // Проверка существования команды
      const teamExists = await knex('teams').where({ id }).first();
      if (!teamExists) {
        return res.status(404).json({ error: "Team not found" });
      }

      // Проверка существования пользователя (если обновляется created_by)
      if (created_by) {
        const userExists = await knex('users').where({ id: created_by }).first();
        if (!userExists) {
          return res.status(400).json({ error: "User with this ID not found" });
        }
      }

      // Проверка уникальности имени (если name изменяется)
      if (name && name !== teamExists.name) {
        const nameExists = await knex('teams')
          .whereNot({ id })
          .where({ name })
          .first();
        
        if (nameExists) {
          return res.status(409).json({ 
            error: "Team name already exists",
            existingTeamId: nameExists.id
          });
        }
      }
      const updateData = {
        name,
        description,
        created_by
      };
  
      // Удаляем undefined поля
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      const updatedCount = await knex('teams')
        .where({ id })
        .update(updateData);

      if (updatedCount === 0) {
        return res.status(404).json({ error: "Team not found" });
      }

      const updatedTeam = await knex('teams').where({ id }).first();

      res.json({
        message: "Team updated successfully",
        team: updatedTeam
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE Team
app.delete('/api/teams/:id',
  [
    param('id').isInt().withMessage('Team ID must be an integer')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Проверка существования команды
      const teamExists = await knex('teams').where({ id: req.params.id }).first();
      if (!teamExists) {
        return res.status(404).json({ error: "Team not found" });
      }

      // Проверка на связанные проекты
      const hasProjects = await knex('projects')
        .where({ team_id: req.params.id })
        .first();
      
      if (hasProjects) {
        return res.status(400).json({ 
          error: "Cannot delete team with associated projects",
          projectCount: await knex('projects').where({ team_id: req.params.id }).count('*')
        });
      }

      const deletedCount = await knex('teams')
        .where({ id: req.params.id })
        .del();

      res.status(204).end();
    } catch (err) {
      if (err.code === '23503') {
        return res.status(400).json({ 
          error: "Cannot delete team with associated data",
          detail: err.detail
        });
      }
      next(err);
    }
  }
);

// ====================== Projects Endpoints ======================
app.get('/api/projects', async (req, res, next) => {
  try {
    const projects = await knex('projects')
      .select('projects.*', 'teams.name as team_name')
      .join('teams', 'projects.team_id', 'teams.id');
    
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

app.post('/api/projects', 
  [
    body('name').isString().trim().isLength({ min: 3 }),
    body('team_id').isInt(),
    body('status').isIn(['active', 'archived']),
    body('deadline').optional().isISO8601()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, team_id, status, description, deadline } = req.body;

      // Проверка существования команды
      const teamExists = await knex('teams').where({ id: team_id }).first();
      if (!teamExists) {
        return res.status(400).json({ error: "Team does not exist" });
      }

      const [projectId] = await knex('projects')
        .insert({ name, team_id, status, description, deadline })
        .returning('id');

      res.status(201).json({ id: projectId });
    } catch (err) {
      next(err);
    }
});
app.put('/api/projects/:id', 
  [
    param('id').isInt().withMessage('Project ID must be an integer'),
    body('name').optional().isString().trim().isLength({ min: 3 }),
    body('team_id').optional().isInt(),
    body('status').optional().isIn(['active', 'archived']),
    body('description').optional().isString(),
    body('deadline').optional().isISO8601()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { name, team_id, status, description, deadline } = req.body;

      // Проверка существования проекта
      const projectExists = await knex('projects').where({ id }).first();
      if (!projectExists) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Проверка существования команды (если обновляется team_id)
      if (team_id) {
        const teamExists = await knex('teams').where({ id: team_id }).first();
        if (!teamExists) {
          return res.status(400).json({ error: "Team does not exist" });
        }
      }

      const updateData = { name, team_id, status, description, deadline };

      // Удаляем undefined поля
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      // Проверяем, есть ли данные для обновления
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields provided for update" });
      }

      await knex('projects')
        .where({ id })
        .update(updateData);

      const updatedProject = await knex('projects').where({ id }).first();

      res.json({
        message: "Project updated successfully",
        project: updatedProject
      });
    } catch (err) {
      next(err);
    }
});

// ====================== Tasks Endpoints ======================
app.get('/api/tasks', async (req, res, next) => {
  try {
    const tasks = await knex('tasks')
      .select(
        'tasks.*',
        'projects.name as project_name',
        'task_status.name as status_name',
        'users.username as creator_name'
      )
      .join('projects', 'tasks.project_id', 'projects.id')
      .join('task_status', 'tasks.status_id', 'task_status.id')
      .join('users', 'tasks.creator_id', 'users.id');
    
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

app.post('/api/tasks', 
  [
    body('title').isString().trim().isLength({ min: 3 }),
    body('project_id').isInt(),
    body('status_id').isInt(),
    body('creator_id').isInt(),
    body('priority').isIn(['low', 'medium', 'high']),
    body('due_date').optional().isISO8601()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, project_id, status_id, creator_id, priority, due_date, description } = req.body;

      // Проверка существования связанных сущностей
      const [project, status, creator] = await Promise.all([
        knex('projects').where({ id: project_id }).first(),
        knex('task_status').where({ id: status_id }).first(),
        knex('users').where({ id: creator_id }).first()
      ]);

      if (!project || !status || !creator) {
        return res.status(400).json({ error: "Invalid project, status or user reference" });
      }

      const [taskId] = await knex('tasks')
        .insert({ title, project_id, status_id, creator_id, priority, due_date, description })
        .returning('id');

      res.status(201).json({ id: taskId });
    } catch (err) {
      next(err);
    }
});

app.put('/api/tasks/:id', 
  [
    param('id').isInt().withMessage('Task ID must be an integer'),
    body('title').optional().isString().trim().isLength({ min: 3 }),
    body('project_id').optional().isInt(),
    body('status_id').optional().isInt(),
    body('creator_id').optional().isInt(),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('due_date').optional().isISO8601(),
    body('description').optional().isString()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, project_id, status_id, creator_id, priority, due_date, description } = req.body;

      // Проверка существования задачи
      const taskExists = await knex('tasks').where({ id }).first();
      if (!taskExists) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Проверка существования связанных сущностей
      if (project_id || status_id || creator_id) {
        const [project, status, creator] = await Promise.all([
          project_id ? knex('projects').where({ id: project_id }).first() : null,
          status_id ? knex('task_status').where({ id: status_id }).first() : null,
          creator_id ? knex('users').where({ id: creator_id }).first() : null
        ]);

        if ((project_id && !project) || (status_id && !status) || (creator_id && !creator)) {
          return res.status(400).json({ error: "Invalid project, status or user reference" });
        }
      }

      const updateData = { title, project_id, status_id, creator_id, priority, due_date, description };

      // Удаление `undefined` значений
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields provided for update" });
      }

      await knex('tasks').where({ id }).update(updateData);
      const updatedTask = await knex('tasks').where({ id }).first();

      res.json({
        message: "Task updated successfully",
        task: updatedTask
      });
    } catch (err) {
      next(err);
    }
});

app.delete('/api/tasks/:id', 
  param('id').isInt().withMessage('Task ID must be an integer'),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Проверка существования задачи
      const taskExists = await knex('tasks').where({ id }).first();
      if (!taskExists) {
        return res.status(404).json({ error: "Task not found" });
      }

      await knex('tasks').where({ id }).del();

      res.json({ message: "Task deleted successfully" });
    } catch (err) {
      next(err);
    }
});

// ====================== Task-Tags Relationship ======================
app.post('/api/tasks/:id/tags', 
  [
    body('tag_ids').isArray({ min: 1 }),
    body('tag_ids.*').isInt()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const taskId = req.params.id;
      const { tag_ids } = req.body;

      // Проверка существования задачи
      const taskExists = await knex('tasks').where({ id: taskId }).first();
      if (!taskExists) return res.status(404).json({ error: "Task not found" });

      // Проверка существования тегов
      const existingTags = await knex('tags').whereIn('id', tag_ids);
      if (existingTags.length !== tag_ids.length) {
        return res.status(400).json({ error: "One or more tags not found" });
      }

      // Исключение уже существующих связей
      const existingRelations = await knex('task_tags')
        .where('task_id', taskId)
        .whereIn('tag_id', tag_ids);

      const existingTagIds = existingRelations.map(r => r.tag_id);
      const newTagIds = tag_ids.filter(id => !existingTagIds.includes(id));

      if (newTagIds.length === 0) {
        return res.status(200).json({ message: "All tags already assigned to this task" });
      }

      // Добавление новых связей
      const inserts = newTagIds.map(tag_id => ({
        task_id: taskId,
        tag_id
      }));

      await knex('task_tags').insert(inserts);
      res.status(201).json({ count: inserts.length });
    } catch (err) {
      next(err);
    }
});

app.delete('/api/tasks/:taskId/tags/:tagId', async (req, res, next) => {
  try {
    const { taskId, tagId } = req.params;

    // Проверка существования задачи
    const taskExists = await knex('tasks').where({ id: taskId }).first();
    if (!taskExists) return res.status(404).json({ error: "Task not found" });

    // Проверка существования тега
    const tagExists = await knex('tags').where({ id: tagId }).first();
    if (!tagExists) return res.status(404).json({ error: "Tag not found" });

    // Проверка связи задачи с тегом
    const relationExists = await knex('task_tags')
      .where({ task_id: taskId, tag_id: tagId })
      .first();

    if (!relationExists) {
      return res.status(400).json({ error: "Tag is not assigned to this task" });
    }

    // Удаление связи
    await knex('task_tags').where({ task_id: taskId, tag_id: tagId }).del();

    res.status(200).json({ message: "Tag removed from task successfully" });
  } catch (err) {
    next(err);
  }
});

app.put('/api/tags/:id', 
  [
    body('name').optional().isString().trim().isLength({ min: 1 }),
    body('color').optional().isString().isHexColor()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, color } = req.body;
      const { id } = req.params;

      // Проверка существования тега
      const tagExists = await knex('tags').where({ id }).first();
      if (!tagExists) return res.status(404).json({ error: "Tag not found" });

      // Обновление данных тега
      const updateData = {};
      if (name) updateData.name = name;
      if (color) updateData.color = color;

      await knex('tags').where({ id }).update(updateData);

      const updatedTag = await knex('tags').where({ id }).first();

      res.json({
        message: "Tag updated successfully",
        tag: updatedTag
      });
    } catch (err) {
      next(err);
    }
});
 
app.post('/api/tags', 
  [
    body('name').isString().trim().isLength({ min: 1 }),
    body('color').isString().isHexColor()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, color } = req.body;

      // Проверка существования тега с таким же именем
      const existingTag = await knex('tags').where({ name }).first();
      if (existingTag) {
        return res.status(409).json({ error: "Tag name already exists" });
      }

      const [tagId] = await knex('tags').insert({ name, color }).returning('id');

      res.status(201).json({ id: tagId });
    } catch (err) {
      next(err);
    }
});

// 1. GET-запрос для получения всех тегов
app.get('/api/tags', async (req, res, next) => {
  try {
    const tags = await knex('tags').select('*');
    res.json(tags);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/tags/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Проверка существования тега
    const tagExists = await knex('tags').where({ id }).first();
    if (!tagExists) {
      return res.status(404).json({ error: "Tag not found" });
    }

    // Удаление тега
    await knex('tags').where({ id }).del();

    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (err) {
    next(err);
  }
});
// ====================== РЕГИСТРАЦИЯ И АВТОРИЗАЦИЯ ======================
const jwt = require('jsonwebtoken');

// Регистрация пользователя
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Проверка, что роль корректная
    if (!['admin', 'employee'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // Добавление пользователя в базу данных
    const [userId] = await knex('users')
      .insert({ username, email, password_hash: passwordHash, role })
      .returning('id');

    res.status(201).json({ message: 'User registered successfully', userId });
  } catch (err) {
    next(err);
  }
});

// Добавьте секретный ключ для JWT
const JWT_SECRET = 'your-secret-key-here'; // В продакшене используйте переменные окружения

// Авторизация пользователя (исправленный endpoint)
app.post('/api/auth/login', 
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Находим пользователя по email
      const user = await knex('users')
        .where({ email })
        .first();

      if (!user) {
        return res.status(401).json({ 
          success: false,
          error: 'Пользователь с таким email не найден'
        });
      }

      // Проверяем пароль
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          error: 'Неверный пароль'
        });
      }

      // Создаем JWT токен
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Возвращаем токен и информацию о пользователе (без пароля)
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      res.json({
        success: true,
        token,
        user: userData,
        message: 'Авторизация успешна'
      });

    } catch (err) {
      console.error('Ошибка авторизации:', err);
      res.status(500).json({ 
        success: false,
        error: 'Внутренняя ошибка сервера'
      });
    }
  });

// Получение событий пользователя
app.get('/api/events', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const events = await knex('events')
      .where({ user_id: userId })
      .orderBy('event_date')
      .orderBy('event_time');
    
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Создание события
app.post('/api/events', async (req, res) => {
  try {
    const { userId, title, description, eventDate, eventTime, color } = req.body;
    
    if (!userId || !title || !eventDate || !eventTime || !color) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['userId', 'title', 'eventDate', 'eventTime', 'color']
      });
    }

    const [event] = await knex('events')
      .insert({ 
        user_id: userId,
        title,
        description,
        event_date: eventDate,
        event_time: eventTime,
        color
      })
      .returning('*');
    
    res.status(201).json(event);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
});

// Обновление события
app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, eventDate, eventTime, color } = req.body;
    
    // Проверка существования события
    const eventExists = await knex('events').where({ id }).first();
    if (!eventExists) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const [updatedEvent] = await knex('events')
      .where({ id })
      .update({
        title,
        description,
        event_date: eventDate,
        event_time: eventTime,
        color,
        updated_at: knex.fn.now()
      })
      .returning('*');
    
    res.json(updatedEvent);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
});

// Удаление события
app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCount = await knex('events').where({ id }).del();
    
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.status(204).end();
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
});

// Удаление тестовых данных
app.delete('/api/test/clear-users', async (req, res) => {
  try {
    await knex('users').where('email', 'test@example.com').del();
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear test data' });
  }
});

// Обработка 404 для несуществующих маршрутов
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
