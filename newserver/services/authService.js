import { Op } from 'sequelize';
import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

const register = async ({ username, email, password, role }) => {
  const existingUser = await User.findOne({
    where: { [Op.or]: [{ username }, { email }] },
  });
  if (existingUser) {
    const conflicts = {};
    if (existingUser.username === username) conflicts.username = true;
    if (existingUser.email === email) conflicts.email = true;
    const err = new Error('Пользователь уже существует');
    err.status = 409;
    err.conflicts = conflicts;
    throw err;
  }

  const password_hash = await hashPassword(password);
  const user = await User.create({ username, email, password_hash, role });

  const token = generateToken({ userId: user.id, role: user.role });
  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const err = new Error('Неверный email или пароль');
    err.status = 401;
    throw err;
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    const err = new Error('Неверный email или пароль');
    err.status = 401;
    throw err;
  }

  const token = generateToken({ userId: user.id, role: user.role });
  return { user, token };
};

export default { register, login };