import Event from '../models/Event.js';
import User from '../models/User.js';

const getAllEvents = async (userId) => {
  if (!userId) {
    const err = new Error('ID пользователя обязателен');
    err.status = 400;
    throw err;
  }

  const events = await Event.findAll({
    where: { user_id: userId },
    order: [['event_date', 'ASC'], ['event_time', 'ASC']],
    include: [{ model: User, as: 'user', attributes: ['username'] }],
  });

  return events;
};

const createEvent = async ({ userId, title, description, eventDate, eventTime, color }) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Пользователь не найден');
    err.status = 400;
    throw err;
  }

  const event = await Event.create({
    user_id: userId,
    title,
    description,
    event_date: eventDate,
    event_time: eventTime,
    color,
  });

  return event;
};

const updateEvent = async (id, { title, description, eventDate, eventTime, color }) => {
  const event = await Event.findByPk(id);
  if (!event) {
    const err = new Error('Событие не найдено');
    err.status = 404;
    throw err;
  }

  const updates = { title, description, event_date: eventDate, event_time: eventTime, color };
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  if (Object.keys(updates).length === 0) {
    const err = new Error('Нет допустимых полей для обновления');
    err.status = 400;
    throw err;
  }

  await event.update(updates);
  return event;
};

const deleteEvent = async (id) => {
  const event = await Event.findByPk(id);
  if (!event) {
    const err = new Error('Событие не найдено');
    err.status = 404;
    throw err;
  }

  await event.destroy();
};

export default { getAllEvents, createEvent, updateEvent, deleteEvent };