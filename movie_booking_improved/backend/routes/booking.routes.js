const bookingController = require('../controllers/booking.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const routes = (app) => {
  app.post('/mba/api/v1/bookings', verifyToken, bookingController.createBooking);
  app.get('/mba/api/v1/bookings/:id', verifyToken, bookingController.getBooking);
  app.get('/mba/api/v1/bookings', verifyToken, bookingController.getBookings);
  app.patch('/mba/api/v1/bookings/:id/cancel', verifyToken, bookingController.cancelBooking);
  app.patch('/mba/api/v1/bookings/:id/pay', verifyToken, bookingController.payBooking);
};

module.exports = routes;
