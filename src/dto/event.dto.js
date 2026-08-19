import { userDTO } from './user.dto.js';

export function eventDTO(event) {
  if (!event) return null;

  const plain = typeof event.toObject === 'function' ? event.toObject() : event;

  const organizer =
    plain.organizer && typeof plain.organizer === 'object' && plain.organizer.email
      ? userDTO(plain.organizer)
      : plain.organizer?.toString();

  return {
    id: plain._id?.toString() ?? plain.id,
    title: plain.title,
    description: plain.description,
    category: plain.category,
    date: plain.date,
    location: plain.location,
    capacity: plain.capacity,
    price: plain.price,
    status: plain.status,
    organizer,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

export function eventListDTO(events) {
  return events.map(eventDTO);
}
