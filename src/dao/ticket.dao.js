import { TicketModel } from '../models/ticket.model.js';

export class TicketDAO {
  create(data) {
    return TicketModel.create(data);
  }

  findById(id) {
    return TicketModel.findById(id);
  }

  findOne(filter) {
    return TicketModel.findOne(filter);
  }

  findByUser(userId) {
    return TicketModel.find({ user: userId }).populate('event', 'title date location price status');
  }

  findByEvent(eventId) {
    return TicketModel.find({ event: eventId }).populate('user', 'first_name last_name email');
  }

  async sumActiveQuantity(eventId) {
    const result = await TicketModel.aggregate([
      { $match: { event: eventId, status: 'active' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  updateById(id, data) {
    return TicketModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
}
