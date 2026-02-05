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
    return res;
}

const updateMovie = async (id, body) => {
    const res = await Movie.findByIdAndUpdate(id, body, { new: true ,runValidators :true}); // new:true to return the updated document
    if (!res) {
        return { err: "Movie not found", code: 404 };
    }
    return res;
}

const fetchMovies = async (filter) => {
    let query = {};
    if(filter.name){
        query.name = filter.name;
    }
    let movies = await Movie.find(query);
   if(!movies){
        return { err: "No movies found", code: 404 };
    }
    return movies;
}

module.exports = { getMovieById, deleteMovie, createMovie,updateMovie, fetchMovies }
