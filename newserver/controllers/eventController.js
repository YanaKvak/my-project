import eventService from '../services/eventService.js';

const getAllEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents(req.query.userId);
    res.json(events);
  } catch (err) {
    next(err);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json({ message: 'Событие успешно создано', event });
  } catch (err) {
    next(err);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    res.json({ message: 'Событие успешно обновлено', event });
  } catch (err) {
    next(err);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id);
    res.status(204).json({ message: 'Событие успешно удалено' });
  } catch (err) {
    next(err);
  }
};

export default { getAllEvents, createEvent, updateEvent, deleteEvent };