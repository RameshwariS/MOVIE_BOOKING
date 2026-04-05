const showService = require('../services/show.service');

const createShow = async (req, res) => {
  try {
    const response = await showService.createShow(req.body);
    if (response.err) {
      return res.status(response.code).json({ err: response.err, data: {}, msg: 'something went wrong', success: false });
    }
    return res.status(201).json({ err: {}, data: response, msg: 'show created', success: true });
  } catch (err) {
    console.log(err, 'in show creation');
    return res.status(500).json({ err: err.message, data: {}, msg: 'something went wrong', success: false });
  }
};

const getShow = async (req, res) => {
  try {
    const response = await showService.getShowById(req.params.id);
    if (response.err) {
      return res.status(response.code).json({ err: response.err, data: {}, msg: 'something went wrong', success: false });
    }
    return res.status(200).json({ err: {}, data: response, msg: 'success!', success: true });
  } catch (err) {
    console.log(err, 'in show get');
    return res.status(500).json({ err: err.message, data: {}, msg: 'something went wrong', success: false });
  }
};

const getShows = async (req, res) => {
  try {
    const response = await showService.fetchShows(req.query);
    if (response.err) {
      return res.status(response.code).json({ err: response.err, data: {}, msg: 'something went wrong', success: false });
    }
    return res.status(200).json({ err: {}, data: response, msg: 'success!', success: true });
  } catch (err) {
    console.log(err, 'in show fetch');
    return res.status(500).json({ err: err.message, data: {}, msg: 'something went wrong', success: false });
  }
};

const updateShow = async (req, res) => {
  try {
    const response = await showService.updateShow(req.params.id, req.body);
    if (response.err) {
      return res.status(response.code).json({ err: response.err, data: {}, msg: 'something went wrong', success: false });
    }
    return res.status(200).json({ err: {}, data: response, msg: 'updated!', success: true });
  } catch (err) {
    console.log(err, 'in show update');
    return res.status(500).json({ err: err.message, data: {}, msg: 'something went wrong', success: false });
  }
};

const deleteShow = async (req, res) => {
  try {
    const response = await showService.deleteShow(req.params.id);
    if (response.err) {
      return res.status(response.code).json({ err: response.err, data: {}, msg: 'something went wrong', success: false });
    }
    return res.status(200).json({ err: {}, data: response, msg: 'deleted!', success: true });
  } catch (err) {
    console.log(err, 'in show delete');
    return res.status(500).json({ err: err.message, data: {}, msg: 'something went wrong', success: false });
  }
};

const getShowSeats = async (req, res) => {
  try {
    const response = await showService.getShowSeats(req.params.id);
    if (response.err) {
      return res.status(response.code).json({ err: response.err, data: {}, msg: 'something went wrong', success: false });
    }
    return res.status(200).json({ err: {}, data: response, msg: 'success!', success: true });
  } catch (err) {
    console.log(err, 'in show seats');
    return res.status(500).json({ err: err.message, data: {}, msg: 'something went wrong', success: false });
  }
};

module.exports = { createShow, getShow, getShows, updateShow, deleteShow, getShowSeats };
