const Show = require('../models/show.model');
const Movie = require('../models/movie.model');
const Theater = require('../models/theater.model');

const createShow = async (body) => {
  const movie = await Movie.findById(body.movie);
  if (!movie) return { err: 'Movie not found', code: 404 };

  const theater = await Theater.findById(body.theater);
  if (!theater) return { err: 'Theater not found', code: 404 };

  if (body.startTime && body.endTime && new Date(body.endTime) <= new Date(body.startTime)) {
    return { err: 'endTime must be after startTime', code: 400 };
  }

  const show = await Show.create(body);
  return show;
};

const getShowById = async (id) => {
  const show = await Show.findById(id).populate('movie theater');
  if (!show) return { err: 'Show not found', code: 404 };
  return show;
};

const fetchShows = async (filter) => {
  const query = {};
  if (filter && filter.movie) query.movie = filter.movie;
  if (filter && filter.theater) query.theater = filter.theater;
  if (filter && filter.status) query.status = filter.status;

  const shows = await Show.find(query).populate('movie theater');
  return shows;
};

const updateShow = async (id, body) => {
  if (body.movie) {
    const movie = await Movie.findById(body.movie);
    if (!movie) return { err: 'Movie not found', code: 404 };
  }
  if (body.theater) {
    const theater = await Theater.findById(body.theater);
    if (!theater) return { err: 'Theater not found', code: 404 };
  }
  if (body.startTime && body.endTime && new Date(body.endTime) <= new Date(body.startTime)) {
    return { err: 'endTime must be after startTime', code: 400 };
  }

  const show = await Show.findByIdAndUpdate(id, body, { new: true, runValidators: true }).populate('movie theater');
  if (!show) return { err: 'Show not found', code: 404 };
  return show;
};

const deleteShow = async (id) => {
  const show = await Show.findByIdAndDelete(id);
  if (!show) return { err: 'Show not found', code: 404 };
  return { code: 200 };
};

const getShowSeats = async (id) => {
  const show = await Show.findById(id);
  if (!show) return { err: 'Show not found', code: 404 };

  const booked = show.bookedSeats || [];
  return {
    totalSeats: show.totalSeats,
    bookedSeats: booked,
    availableCount: Math.max(show.totalSeats - booked.length, 0),
  };
};

module.exports = { createShow, getShowById, fetchShows, updateShow, deleteShow, getShowSeats };
