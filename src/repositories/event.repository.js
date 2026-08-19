import { EventDAO } from '../dao/event.dao.js';

export class EventRepository {
  constructor(dao = new EventDAO()) {
    this.dao = dao;
  }

  createEvent(data) {
    return this.dao.create(data);
  }

  getEventById(id) {
    return this.dao.findById(id);
  }

  getPaginatedEvents(options) {
    return this.dao.findPaginated(options);
  }

  updateEvent(id, data) {
    return this.dao.updateById(id, data);
  }
}
