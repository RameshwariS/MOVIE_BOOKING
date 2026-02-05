const Theater = require('../models/theater.model');

const createTheater = async (body) => {
  try {
    const theater = await Theater.create(body);
    return theater;
  } catch (error) {
    console.log("error in theater creation service", error);
    throw error;
  }
};

const getTheater = async (id) => {
  try {
    const theater = await Theater.findById(id);
    if (!theater) return { err: "Theater not found", code: 404 };
    return theater;
  } catch (error) {
    console.log("error in theater fetching service", error);
    throw error;
  }
};

const updateTheater = async (id, body) => {
  try {
    const theater = await Theater.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!theater) return { err: "Theater not found", code: 404 };
    return theater;
  } catch (error) {
    console.log("error in theater update service", error);
    throw error;
  }
};

const deleteTheater = async (id) => {
  try {
    const response = await Theater.findByIdAndDelete(id);
    if (!response) return { err: "Theater not found", code: 404 };
    return { code: 200 };
  } catch (error) {
    console.log("error in theater deletion service", error);
    throw error;
  }
};

const fetchTheaters = async (filter) => {
  try {
    const query = {};
    if (filter && filter.city) query.city = filter.city;
    if (filter && filter.name) query.name = filter.name;
    const theaters = await Theater.find(query);
    return theaters;
  } catch (error) {
    console.log("error in theater fetching service", error);
    throw error;
  }
};

const getMoviesInTheater = async (theaterId) => {
  try {
    const theater = await Theater.findById(theaterId).populate("movies");
    return theater.movies;
  } catch (err) {
    if (err.name == "TypeError") {
      return {
        code: 404,
        err: "No theatre found for the given id",
      };
    }
    else {
      console.log("Error is", err);
      throw err;
    }
  }
};

const updateMoviesInTheater = async (theaterId, movieIds, insert) => {
  try {
    let theater;

    if (insert) {
      theater = await Theater.findByIdAndUpdate(
        { _id: theaterId },
        { $addToSet: { movies: { $each: movieIds } } },
        { new: true }
      );
    } else {
      theater = await Theater.findByIdAndUpdate(
        { _id: theaterId },
        { $pull: { movies: { $in: movieIds } } },
        { new: true }
      );
    }

    if (!theater) {
      return { code: 404, err: "No theatre found for the given id" };
    }
    return await theater.populate("movies");
  } catch (err) {
    console.log("Error is", err);
    throw err;
  }
};

const checkMovie = async (theaterId) => {
  try {
    const mvs = await Theater.findById(theaterId).populate("movies");
    if (!mvs) return false;
    return mvs.movies.length > 0;
  } catch (err) {
    console.log("Error is", err);
    throw err;
  }
};

module.exports = {
  createTheater,
  getTheater,
  updateTheater,
  deleteTheater,
  fetchTheaters,
  updateMoviesInTheater,
  getMoviesInTheater,
  checkMovie,
};
