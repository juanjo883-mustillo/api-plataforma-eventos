import { Router } from 'express';
import { passportCall } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';
import {
  createEvent,
  listEvents,
  getEventById,
  updateEvent,
  updateEventStatus,
} from '../controllers/events.controller.js';
import { createTicket, getEventTickets } from '../controllers/tickets.controller.js';

const router = Router();

router.get('/', listEvents);
router.get('/:eid', getEventById);

router.post('/', passportCall('current'), authorize('organizer', 'admin'), createEvent);
router.put('/:eid', passportCall('current'), authorize('organizer', 'admin'), updateEvent);
router.patch('/:eid/status', passportCall('current'), authorize('organizer', 'admin'), updateEventStatus);

// Inscripciones anidadas bajo el evento
router.post('/:eid/tickets', passportCall('current'), authorize('user', 'organizer', 'admin'), createTicket);
router.get('/:eid/tickets', passportCall('current'), authorize('organizer', 'admin'), getEventTickets);

export default router;
