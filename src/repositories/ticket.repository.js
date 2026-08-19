import { TicketDAO } from '../dao/ticket.dao.js';

export class TicketRepository {
  constructor(dao = new TicketDAO()) {
    this.dao = dao;
  }

  createTicket(data) {
    return this.dao.create(data);
  }

  getTicketById(id) {
    return this.dao.findById(id);
  }

  findActiveTicket(userId, eventId) {
    return this.dao.findOne({ user: userId, event: eventId, status: 'active' });
  }

  getTicketsByUser(userId) {
    return this.dao.findByUser(userId);
  }

  getTicketsByEvent(eventId) {
    return this.dao.findByEvent(eventId);
  }

  getOccupiedCapacity(eventId) {
    return this.dao.sumActiveQuantity(eventId);
  }

  updateTicket(id, data) {
    return this.dao.updateById(id, data);
  }
}
