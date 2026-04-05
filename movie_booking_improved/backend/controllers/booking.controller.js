const bookingService = require('../services/booking.service');

const createBooking = async (req, res) => {
  try {
    const response = await bookingService.createBooking(req.user.id, req.body);
    if (response.err) {
      return res.status(response.code).json({ err: response.err, data: response.data || {}, msg: 'something went wrong', success: false });
    }
    return res.status(201).json({ err: {}, data: response, msg: 'booking created', success: true });
  } catch (err) {
    console.log(err, 'in booking creation');
    return res.status(500).json({ err: err.message, data: {}, msg: 'something went wrong', success: false });
  }
};

const getBooking = async (req, res) => {
  try {
    const response = await bookingService.getBookingById(req.params.id);
    if (response.err) {
      return res.status(response.code).json({ err: response.err, data: {}, msg: 'something went wrong', success: false });
    }

    // allow only same user or admin
    if (req.user.role !== 'ADMIN' && String(response.user._id) !== String(req.user.id)) {
      return res.status(403).json({ err: 'forbidden', data: {}, msg: 'not allowed', success: false });
    }

    return res.status(200).json({ err: {}, data: response, msg: 'success!', success: true });
  } catch (err) {
    console.log(err, 'in booking get');
    return res.status(500).json({ err: err.message, data: {}, msg: 'something went wrong', success: false });
  }
};

const getBookings = async (req, res) => {
  try {
    const query = { ...req.query };
    if (req.user.role !== 'ADMIN') {
      query.user = req.user.id;
    }
    const response = await bookingService.fetchBookings(query);
    return res.status(200).json({ err: {}, data: response, msg: 'success!', success: true });
  } catch (err) {
    console.log(err, 'in bookings fetch');
    return res.status(500).json({ err: err.message, data: {}, msg: 'something went wrong', success: false });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    if (booking.err) {
      return res.status(booking.code).json({ err: booking.err, data: {}, msg: 'something went wrong', success: false });
    }

    if (req.user.role !== 'ADMIN' && String(booking.user._id) !== String(req.user.id)) {
      return res.status(403).json({ err: 'forbidden', data: {}, msg: 'not allowed', success: false });
    }

    const response = await bookingService.cancelBooking(req.params.id);
    if (response.err) {
      return res.status(response.code).json({ err: response.err, data: {}, msg: 'something went wrong', success: false });
    }
    return res.status(200).json({ err: {}, data: response, msg: 'cancelled', success: true });
  } catch (err) {
    console.log(err, 'in booking cancel');
    return res.status(500).json({ err: err.message, data: {}, msg: 'something went wrong', success: false });
  }
};

const payBooking = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    if (booking.err) {
      return res.status(booking.code).json({ err: booking.err, data: {}, msg: 'something went wrong', success: false });
    }

    if (req.user.role !== 'ADMIN' && String(booking.user._id) !== String(req.user.id)) {
      return res.status(403).json({ err: 'forbidden', data: {}, msg: 'not allowed', success: false });
    }

    const response = await bookingService.payBooking(req.params.id);
    if (response.err) {
      return res.status(response.code).json({ err: response.err, data: {}, msg: 'something went wrong', success: false });
    }
    return res.status(200).json({ err: {}, data: response, msg: 'payment successful', success: true });
  } catch (err) {
    console.log(err, 'in booking pay');
    return res.status(500).json({ err: err.message, data: {}, msg: 'something went wrong', success: false });
  }
};

module.exports = { createBooking, getBooking, getBookings, cancelBooking, payBooking };
