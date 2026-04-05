const Movie = require('../models/movie.model');
const mongoose = require('mongoose');

const getMovieById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return { err: 'Invalid movie id', code: 400 };
    }
    const movie = await Movie.findById(id);
    if (!movie) {
        return { err: 'Movie not found', code: 404 };
    }
    return movie;
};

const deleteMovie = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return { err: 'Invalid movie id', code: 400 };
    }
    const res = await Movie.findByIdAndDelete(id);
    if (!res) {
        return { err: 'Movie not found', code: 404 };
    }
    return { code: 200 };
};

const createMovie = async (body) => {
    const res = await Movie.create(body);
    return res;
};

const updateMovie = async (id, body) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return { err: 'Invalid movie id', code: 400 };
    }
    const res = await Movie.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!res) {
        return { err: 'Movie not found', code: 404 };
    }
    return res;
};

const fetchMovies = async (filter) => {
    const query = {};

    // Case-insensitive partial name search
    if (filter.name) {
        query.name = new RegExp(filter.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
    if (filter.genre) {
        query.genre = { $in: Array.isArray(filter.genre) ? filter.genre : [filter.genre] };
    }
    if (filter.language) {
        query.language = { $in: Array.isArray(filter.language) ? filter.language : [filter.language] };
    }
    if (filter.releaseStatus) {
        query.releaseStatus = filter.releaseStatus;
    }

    const movies = await Movie.find(query).sort({ releaseDate: -1 });
    return movies;
};

module.exports = { getMovieById, deleteMovie, createMovie, updateMovie, fetchMovies };
