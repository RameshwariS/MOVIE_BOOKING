const theaterController = require('../controllers/theater.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

const routes = (app) => {
    // Define theater-related routes here

    app.post('/mba/api/v1/theaters', verifyToken, requireAdmin, theaterController.createTheater);
    app.get('/mba/api/v1/theaters/:id', theaterController.getTheater);
    app.get('/mba/api/v1/theaters', theaterController.getTheaters);
    app.put('/mba/api/v1/theaters/:id', verifyToken, requireAdmin, theaterController.updateTheater);
    app.delete('/mba/api/v1/theaters/:id', verifyToken, requireAdmin, theaterController.deleteTheater);
    app.patch('/mba/api/v1/theaters/:id/movies', verifyToken, requireAdmin, theaterController.updateMoviesInTheater);
    app.get('/mba/api/v1/theaters/:id/movies', theaterController.getMoviesInTheater);
}   

module.exports = routes;
