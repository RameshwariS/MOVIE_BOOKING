/**
 * Standardised API response helpers.
 */
const success = (res, data, msg = 'success', statusCode = 200) =>
    res.status(statusCode).json({ success: true, msg, data, err: {} });

const created = (res, data, msg = 'created') =>
    success(res, data, msg, 201);

const failure = (res, err, msg = 'something went wrong', statusCode = 500) =>
    res.status(statusCode).json({ success: false, msg, err, data: {} });

module.exports = { success, created, failure };
