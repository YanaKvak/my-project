import authService from '../services/authService.js';

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    res.status(201).json({ message: 'Пользователь успешно зарегистрирован', userId: user.id, token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    res.json({ message: 'Вход успешно выполнен', userId: user.id, token });
  } catch (err) {
    next(err);
  }
};

export default { register, login };