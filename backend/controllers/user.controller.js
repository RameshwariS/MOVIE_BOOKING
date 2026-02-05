const userService = require('../services/user.service');

const registerUser = async (req, res) => {
  try {
    const response = await userService.registerUser(req.body);
    if (response.err) {
      return res.status(response.code).json({
        err: response.err,
        data: {},
        msg: 'something went wrong',
        success: false,
      });
    }

    return res.status(201).json({
      err: {},
      data: response,
      msg: 'user registered',
      success: true,
    });
  } catch (err) {
    console.log(err, 'in user registration');
    return res.status(500).json({
      err: err.message,
      data: {},
      msg: 'something went wrong',
      success: false,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const response = await userService.loginUser(req.body);
    if (response.err) {
      return res.status(response.code).json({
        err: response.err,
        data: {},
        msg: 'authentication failed',
        success: false,
      });
    }

    return res.status(200).json({
      err: {},
      data: response,
      msg: 'login successful',
      success: true,
    });
  } catch (err) {
    console.log(err, 'in user login');
    return res.status(500).json({
      err: err.message,
      data: {},
      msg: 'something went wrong',
      success: false,
    });
  }
};

const getUser = async (req, res) => {
  try {
    // allow only same user or admin
    if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ err: 'forbidden', data: {}, msg: 'not allowed', success: false });
    }

    const response = await userService.getUserById(req.params.id);
    if (response.err) {
      return res.status(response.code).json({
        err: response.err,
        data: {},
        msg: 'something went wrong',
        success: false,
      });
    }

    return res.status(200).json({ err: {}, data: response, msg: 'success!', success: true });
  } catch (err) {
    console.log(err, 'in user get');
    return res.status(500).json({ err: err.message, data: {}, msg: 'something went wrong', success: false });
  }
};

const getUsers = async (req, res) => {
  try {
    // only admin can fetch all users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ err: 'forbidden', data: {}, msg: 'not allowed', success: false });
    }

    const response = await userService.fetchUsers(req.query);
    if (response.err) {
      return res.status(response.code).json({
        err: response.err,
        data: {},
        msg: 'something went wrong',
        success: false,
      });
    }

    return res.status(200).json({ err: {}, data: response, msg: 'success!', success: true });
  } catch (err) {
    console.log(err, 'in fetching users');
    return res.status(500).json({ err: err.message, data: {}, msg: 'something went wrong', success: false });
  }
};

const updateUser = async (req, res) => {
  try {
    // allow only same user or admin
    if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ err: 'forbidden', data: {}, msg: 'not allowed', success: false });
    }

    const response = await userService.updateUser(req.params.id, req.body);
    if (response.err) {
      return res.status(response.code).json({
        err: response.err,
        data: {},
        msg: 'something went wrong',
        success: false,
      });
    }

    return res.status(200).json({ err: {}, data: response, msg: 'updated!', success: true });
  } catch (err) {
    console.log(err, 'in updating user');
    return res.status(500).json({ err: err.message, data: {}, msg: 'something went wrong', success: false });
  }
};

const deleteUser = async (req, res) => {
  try {
    // allow only same user or admin
    if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ err: 'forbidden', data: {}, msg: 'not allowed', success: false });
    }

    const response = await userService.deleteUser(req.params.id);
    if (response.err) {
      return res.status(response.code).json({
        err: response.err,
        data: {},
        msg: 'something went wrong',
        success: false,
      });
    }

    return res.status(200).json({ err: {}, data: response, msg: 'deleted!', success: true });
  } catch (err) {
    console.log(err, 'in deleting user');
    return res.status(500).json({ err: err.message, data: {}, msg: 'something went wrong', success: false });
  }
};

module.exports = { registerUser, loginUser, getUser, getUsers, updateUser, deleteUser };
