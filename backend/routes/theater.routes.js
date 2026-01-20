const theaterController = require('../controllers/theater.controller');

const routes = (app) => {
    // Define theater-related routes here

    app.post('/mba/api/v1/theaters', theaterController.createTheater);
    app.get('/mba/api/v1/theaters/:id', theaterController.getTheater);
    app.put('/mba/api/v1/theaters/:id', theaterController.updateTheater);
    app.delete('/mba/api/v1/theaters/:id', theaterController.deleteTheater);
}

module.exports = routes;