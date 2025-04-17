const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Обновление профиля (включая аватар)
router.put('/', auth, async (req, res) => {
  try {
    const { username, avatar_data } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (avatar_data) updates.avatar_data = avatar_data;

    await knex('users').where({ id: req.user.id }).update(updates);

    const updatedUser = await knex('users').where({ id: req.user.id }).first();
    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar_data: updatedUser.avatar_data, // Возвращаем Base64
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Получение профиля
router.get('/', auth, async (req, res) => {
  try {
    const user = await knex('users').where({ id: req.user.id }).first();
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_data: user.avatar_data, // Отправляем Base64 клиенту
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;