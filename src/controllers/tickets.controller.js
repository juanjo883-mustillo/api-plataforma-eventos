import { TicketService } from '../services/ticket.service.js';
import { ticketDTO, ticketListDTO } from '../dto/ticket.dto.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const ticketService = new TicketService();

export const createTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.createTicket(req.params.eid, req.user, req.body);
  return sendSuccess(res, { statusCode: 201, payload: ticketDTO(ticket), message: 'Inscripción confirmada' });
});

export const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await ticketService.getMyTickets(req.user._id);
  return sendSuccess(res, { payload: ticketListDTO(tickets) });
});

export const getEventTickets = asyncHandler(async (req, res) => {
  const tickets = await ticketService.getEventTickets(req.params.eid, req.user);
  return sendSuccess(res, { payload: ticketListDTO(tickets) });
});

export const cancelTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.cancelTicket(req.params.tid, req.user);
  return sendSuccess(res, { payload: ticketDTO(ticket), message: 'Ticket cancelado con éxito' });
});
