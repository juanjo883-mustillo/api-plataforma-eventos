import { EventModel } from '../models/event.model.js';

export class EventDAO {
  create(data) {
    return EventModel.create(data);
  }

  findById(id) {
    return EventModel.findById(id);
  }

  async findPaginated({ filter, page, limit, sort }) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      EventModel.find(filter).sort(sort).skip(skip).limit(limit),
      EventModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  updateById(id, data) {
    return EventModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
}
