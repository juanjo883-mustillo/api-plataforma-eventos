import { TicketRepository } from '../repositories/ticket.repository.js';
import { EventRepository } from '../repositories/event.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { generateReservationCode } from '../utils/reservationCode.js';
import { sendTicketConfirmationEmail } from './mail.service.js';

export class TicketService {
  constructor(
    ticketRepository = new TicketRepository(),
    eventRepository = new EventRepository()
  ) {
    this.ticketRepository = ticketRepository;
    this.eventRepository = eventRepository;
  }

  async createTicket(eventId, user, { quantity = 1 } = {}) {
    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      throw ApiError.badRequest('La cantidad debe ser un número mayor a 0');
    }

    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw ApiError.notFound('Evento no encontrado');
    }

    if (event.status !== 'published') {
      throw ApiError.conflict('Solo se puede inscribir a eventos publicados');
    }

    const existingActiveTicket = await this.ticketRepository.findActiveTicket(user._id, eventId);
    if (existingActiveTicket) {
      throw ApiError.conflict('Ya tenés una inscripción activa a este evento');
    }

    const occupied = await this.ticketRepository.getOccupiedCapacity(event._id);
    const available = event.capacity - occupied;

    if (available < parsedQuantity) {
      throw ApiError.conflict(`No hay cupo suficiente. Cupo disponible: ${available}`);
    }

    const ticket = await this.ticketRepository.createTicket({
      user: user._id,
      event: event._id,
      quantity: parsedQuantity,
      status: 'active',
      reservationCode: generateReservationCode(),
    });

    try {
      await sendTicketConfirmationEmail({
        to: user.email,
        userName: `${user.first_name} ${user.last_name}`,
        event,
        reservationCode: ticket.reservationCode,
        quantity: ticket.quantity,
      });
    } catch (error) {
      // El fallo de envío de email no debe frustrar la inscripción ya confirmada.
      console.error('No se pudo enviar el email de confirmación:', error.message);
    }

    return ticket;
  }

  getMyTickets(userId) {
    return this.ticketRepository.getTicketsByUser(userId);
  }

  async getEventTickets(eventId, user) {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw ApiError.notFound('Evento no encontrado');
    }

    const isOwner = event.organizer.toString() === user._id.toString();
    if (!isOwner && user.role !== 'admin') {
      throw ApiError.forbidden('Solo el organizador dueño del evento o un admin pueden ver las inscripciones');
    }

    return this.ticketRepository.getTicketsByEvent(eventId);
  }

  async cancelTicket(ticketId, user) {
    const ticket = await this.ticketRepository.getTicketById(ticketId);
    if (!ticket) {
      throw ApiError.notFound('Ticket no encontrado');
    }

    const isOwner = ticket.user.toString() === user._id.toString();
    if (!isOwner && user.role !== 'admin') {
      throw ApiError.forbidden('Solo el dueño del ticket o un admin pueden cancelarlo');
    }

    if (ticket.status === 'cancelled') {
      throw ApiError.conflict('El ticket ya está cancelado');
    }

    return this.ticketRepository.updateTicket(ticketId, {
      status: 'cancelled',
      cancelledAt: new Date(),
    });
  }
}
