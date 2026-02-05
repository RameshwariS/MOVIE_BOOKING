const movieController = require('../controllers/movie.controller');
const movieMiddlewares = require('../middlewares/movie.middlewares');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

const routes = (app) =>{
    app.post(
        '/mba/api/v1/movies',
        verifyToken,
        requireAdmin,
        movieMiddlewares.validateMovieCreateRequest,
        movieController.createMovie) // adding the mv
      app.delete(
        '/mba/api/v1/movies/:id',
        verifyToken,
        requireAdmin,
        movieController.deleteMovie
    );
     app.get(
        '/mba/api/v1/movies/:id',
       
        movieController.getMovie
    );

    app.put(
        '/mba/api/v1/movies/:id',
        verifyToken,
        requireAdmin,
        movieMiddlewares.validateMovieCreateRequest,
        movieController.updateMovie
    );

    app.get(
        '/mba/api/v1/movies',

        movieController.getMovies
    );

}

module.exports = routes;
