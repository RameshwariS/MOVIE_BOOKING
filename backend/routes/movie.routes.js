const movieController = require('../controllers/movie.controller');
const movieMiddlewares = require('../middlewares/movie.middlewares');

const routes = (app) =>{
    app.post(
        '/mba/api/v1/movies',
        movieMiddlewares.validateMovieCreateRequest,
        movieController.createMovie) // adding the mv
      app.delete(
        '/mba/api/v1/movies/:id',
      
        movieController.deleteMovie
    );
     app.get(
        '/mba/api/v1/movies/:id',
       
        movieController.getMovie
    );

    app.put(
        '/mba/api/v1/movies/:id',
        movieMiddlewares.validateMovieCreateRequest,
        movieController.updateMovie
    );

    app.get(
        '/mba/api/v1/movies',

        movieController.getMovies
    );

}

module.exports = routes;