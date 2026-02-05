const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    totalSeats: { type: Number, required: true, min: 1 },
    bookedSeats: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['SCHEDULED', 'CANCELLED', 'COMPLETED'],
      default: 'SCHEDULED',
    },
  },
  { timestamps: true }
);

const Show = mongoose.model('Show', showSchema);

module.exports = Show;
