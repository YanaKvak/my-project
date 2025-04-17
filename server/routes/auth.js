const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// Смена пароля
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Получаем пользователя
    const user = await knex('users').where({ id: req.user.id }).first();
    
    // Проверяем текущий пароль
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Current password is incorrect' }] });
    }
    
    // Хешируем новый пароль
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    
    // Обновляем пароль
    await knex('users').where({ id: req.user.id }).update({ password_hash });
    
    res.json({ msg: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;