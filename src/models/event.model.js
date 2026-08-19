import mongoose from 'mongoose';
import { EVENT_STATUSES } from '../utils/constants.js';

const COLLECTION = 'events';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: EVENT_STATUSES,
      default: 'draft',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true, collection: COLLECTION }
);

eventSchema.index({ status: 1, category: 1, location: 1, date: 1 });

export const EventModel = mongoose.model('Event', eventSchema);
