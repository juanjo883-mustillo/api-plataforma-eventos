import { Router } from 'express';
import { passportCall } from '../middlewares/auth.middleware.js';
import { getMyTickets, cancelTicket } from '../controllers/tickets.controller.js';

const router = Router();

router.get('/my-tickets', passportCall('current'), getMyTickets);
router.patch('/:tid/cancel', passportCall('current'), cancelTicket);

export default router;
