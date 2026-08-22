// Wraps an async route handler so a thrown error or rejected promise is
// forwarded to Express's error handler (returns a clean 500) instead of
// becoming an unhandledRejection that crashes the whole server process.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
