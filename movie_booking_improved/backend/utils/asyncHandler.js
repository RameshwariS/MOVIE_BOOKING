/**
 * Wraps an async route handler and forwards any thrown errors to Express's next()
 * so the global error handler catches them — removes the need for repetitive try-catch blocks.
 *
 * Usage: app.get('/route', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
