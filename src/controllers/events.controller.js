import { EventService } from '../services/event.service.js';
import { eventDTO, eventListDTO } from '../dto/event.dto.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const eventService = new EventService();

export const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.body, req.user);
  return sendSuccess(res, { statusCode: 201, payload: eventDTO(event), message: 'Evento creado con éxito' });
});

export const listEvents = asyncHandler(async (req, res) => {
  const { data, page, limit, total } = await eventService.listEvents(req.query);
  return sendPaginated(res, { data: eventListDTO(data), page, limit, total });
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await eventService.getEventOr404(req.params.eid);
  return sendSuccess(res, { payload: eventDTO(event) });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.params.eid, req.body, req.user);
  return sendSuccess(res, { payload: eventDTO(event), message: 'Evento actualizado con éxito' });
});

export const updateEventStatus = asyncHandler(async (req, res) => {
  const event = await eventService.updateEventStatus(req.params.eid, req.body.status, req.user);
  return sendSuccess(res, { payload: eventDTO(event), message: 'Estado del evento actualizado con éxito' });
});
