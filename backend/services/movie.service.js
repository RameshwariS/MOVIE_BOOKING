const Movie = require('../models/movie.model')

async function getMovieById(id) {
    const movie = await Movie.findById(id);
    if (!movie) {
        return { err: "Movie not found", code: 404 };
    }
    return movie;
}

const deleteMovie = async (id) => {
    const res = await Movie.findByIdAndDelete(id);
    if (!res) {
        return { err: "Movie not found", code: 404 };
    }
    return { code: 200 };
}

const createMovie = async (body) => {
    const res = await Movie.create(body);
    if (!res) {
        return { err: "Movie not created", code: 500 };
    }
    return { code: 200 };
}

module.exports = { getMovieById, deleteMovie, createMovie }
