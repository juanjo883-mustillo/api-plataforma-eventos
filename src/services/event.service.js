import { EventRepository } from '../repositories/event.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { EVENT_STATUSES } from '../utils/constants.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export class EventService {
  constructor(eventRepository = new EventRepository()) {
    this.eventRepository = eventRepository;
  }

  validateEventInput({ date, capacity, price }, { partial = false } = {}) {
    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        throw ApiError.badRequest('La fecha del evento no es válida');
      }
      if (parsedDate.getTime() < Date.now()) {
        throw ApiError.badRequest('La fecha del evento no puede ser en el pasado');
      }
    } else if (!partial) {
      throw ApiError.badRequest('La fecha del evento es obligatoria');
    }

    if (capacity !== undefined) {
      if (!Number.isFinite(capacity) || capacity <= 0) {
        throw ApiError.badRequest('La capacidad debe ser un número mayor a 0');
      }
    } else if (!partial) {
      throw ApiError.badRequest('La capacidad es obligatoria');
    }

    if (price !== undefined) {
      if (!Number.isFinite(price) || price < 0) {
        throw ApiError.badRequest('El precio debe ser un número mayor o igual a 0');
      }
    } else if (!partial) {
      throw ApiError.badRequest('El precio es obligatorio');
    }
  }

  async createEvent(data, organizer) {
    this.validateEventInput(data);

    const { title, description, category, date, location, capacity, price, status } = data;

    if (!title || !description || !category || !location) {
      throw ApiError.badRequest('Faltan campos obligatorios del evento');
    }

    return this.eventRepository.createEvent({
      title,
      description,
      category,
      date,
      location,
      capacity,
      price,
      status: status && EVENT_STATUSES.includes(status) ? status : 'draft',
      organizer: organizer._id,
    });
  }

  async getEventOr404(eventId) {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw ApiError.notFound('Evento no encontrado');
    }
    return event;
  }

  assertOwnerOrAdmin(event, user) {
    const isOwner = event.organizer.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('Solo el organizador dueño del evento o un admin pueden realizar esta acción');
    }
  }

  async updateEvent(eventId, data, user) {
    const event = await this.getEventOr404(eventId);
    this.assertOwnerOrAdmin(event, user);

    if (event.status === 'cancelled') {
      throw ApiError.conflict('No se puede modificar un evento cancelado');
    }

    this.validateEventInput(data, { partial: true });

    const allowedFields = ['title', 'description', 'category', 'date', 'location', 'capacity', 'price'];
    const updates = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) updates[field] = data[field];
    }

    return this.eventRepository.updateEvent(eventId, updates);
  }

  async updateEventStatus(eventId, status, user) {
    if (!EVENT_STATUSES.includes(status)) {
      throw ApiError.badRequest(`El estado debe ser uno de: ${EVENT_STATUSES.join(', ')}`);
    }

    const event = await this.getEventOr404(eventId);
    this.assertOwnerOrAdmin(event, user);

    if (event.status === 'cancelled') {
      throw ApiError.conflict('No se puede modificar un evento cancelado');
    }

    return this.eventRepository.updateEvent(eventId, { status });
  }

  async listEvents(query) {
    const filter = {};

    if (query.status) {
      if (!EVENT_STATUSES.includes(query.status)) {
        throw ApiError.badRequest(`El estado debe ser uno de: ${EVENT_STATUSES.join(', ')}`);
      }
      filter.status = query.status;
    }

    if (query.category) filter.category = query.category;
    if (query.location) filter.location = new RegExp(query.location, 'i');

    if (query.dateFrom || query.dateTo) {
      filter.date = {};
      if (query.dateFrom) filter.date.$gte = new Date(query.dateFrom);
      if (query.dateTo) filter.date.$lte = new Date(query.dateTo);
    }

    const page = Math.max(parseInt(query.page, 10) || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);

    let sort = { date: 1 };
    if (query.sort) {
      const [field, direction] = query.sort.split(':');
      sort = { [field]: direction === 'desc' ? -1 : 1 };
    }

    const { data, total } = await this.eventRepository.getPaginatedEvents({ filter, page, limit, sort });

    return { data, page, limit, total };
  }
}
