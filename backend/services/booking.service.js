const Booking = require('../models/booking.model');
const Show = require('../models/show.model');

const normalizeSeats = (seats) => Array.from(new Set(seats.map((s) => String(s).trim()))).filter((s) => s);

const validateSeatNumbers = (seats, totalSeats) => {
  const numericSeats = seats.filter((s) => /^\d+$/.test(s)).map((s) => parseInt(s, 10));
  if (numericSeats.length > 0) {
    const invalid = numericSeats.some((n) => n < 1 || n > totalSeats);
    if (invalid) return { err: 'Seat number out of range', code: 400 };
  }
  return null;
};

const createBooking = async (userId, body) => {
  if (!body.showId) return { err: 'showId is required', code: 400 };
  if (!body.seats || !(body.seats instanceof Array) || body.seats.length === 0) {
    return { err: 'seats array is required', code: 400 };
  }

  const show = await Show.findById(body.showId);
  if (!show) return { err: 'Show not found', code: 404 };
  if (show.status !== 'SCHEDULED') return { err: 'Show not available for booking', code: 409 };

  const seats = normalizeSeats(body.seats);
  if (seats.length === 0) return { err: 'seats array is required', code: 400 };

  const seatValidation = validateSeatNumbers(seats, show.totalSeats);
  if (seatValidation) return seatValidation;

  const alreadyBooked = new Set(show.bookedSeats || []);
  const conflicts = seats.filter((s) => alreadyBooked.has(s));
  if (conflicts.length > 0) {
    return { err: 'Some seats are already booked', code: 409, data: { conflicts } };
  }

  await Show.findByIdAndUpdate(
    show._id,
    { $addToSet: { bookedSeats: { $each: seats } } },
    { new: true }
  );

  const totalPrice = show.price * seats.length;
  const booking = await Booking.create({
    user: userId,
    show: show._id,
    movie: show.movie,
    theater: show.theater,
    seats,
    totalPrice,
  });

  return booking;
};

const getBookingById = async (id) => {
  const booking = await Booking.findById(id).populate('show movie theater user', '-password');
  if (!booking) return { err: 'Booking not found', code: 404 };
  return booking;
};

const fetchBookings = async (filter) => {
  const query = {};
  if (filter && filter.user) query.user = filter.user;
  if (filter && filter.show) query.show = filter.show;
  if (filter && filter.status) query.status = filter.status;

  const bookings = await Booking.find(query).populate('show movie theater user', '-password');
  return bookings;
};

const cancelBooking = async (id) => {
  const booking = await Booking.findById(id);
  if (!booking) return { err: 'Booking not found', code: 404 };
  if (booking.status === 'CANCELLED') return booking;

  booking.status = 'CANCELLED';
  if (booking.paymentStatus === 'PAID') {
    booking.paymentStatus = 'REFUNDED';
  }
  await booking.save();

  await Show.findByIdAndUpdate(booking.show, { $pull: { bookedSeats: { $in: booking.seats } } });

  return booking;
};

const payBooking = async (id) => {
  const booking = await Booking.findById(id);
  if (!booking) return { err: 'Booking not found', code: 404 };
  if (booking.status === 'CANCELLED') return { err: 'Cannot pay for cancelled booking', code: 409 };

  booking.paymentStatus = 'PAID';
  booking.status = 'CONFIRMED';
  await booking.save();

  return booking;
};

module.exports = { createBooking, getBookingById, fetchBookings, cancelBooking, payBooking };
