const showController = require('../controllers/show.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

const routes = (app) => {
  app.post('/mba/api/v1/shows', verifyToken, requireAdmin, showController.createShow);
  app.get('/mba/api/v1/shows/:id', showController.getShow);
  app.get('/mba/api/v1/shows', showController.getShows);
  app.put('/mba/api/v1/shows/:id', verifyToken, requireAdmin, showController.updateShow);
  app.delete('/mba/api/v1/shows/:id', verifyToken, requireAdmin, showController.deleteShow);
  app.get('/mba/api/v1/shows/:id/seats', showController.getShowSeats);
};

module.exports = routes;
