import mongoose from 'mongoose';

const COLLECTION = 'tickets';

export const TICKET_STATUSES = ['active', 'cancelled'];

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: 'active',
    },
    reservationCode: {
      type: String,
      required: true,
      unique: true,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, collection: COLLECTION }
);

ticketSchema.index({ user: 1, event: 1 });

export const TicketModel = mongoose.model('Ticket', ticketSchema);
