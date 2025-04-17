const express = require('express');
const authenticate = require('../middleware/authenticate'); // Добавлено
const knex = require('knex')(require('../../config/knexfile').development);

const router = express.Router();

// Пример защищенного роута
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await knex('users').where({ id: req.userId }).first();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении данных' });
  }
});

module.exports = router;