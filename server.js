require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5002;

// Final safety net: a stray async error should never kill the whole server
// (which would log every user out on their next click). Log it and stay up.
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection] server kept alive:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException] server kept alive:', err);
});

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Social Media server on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }
})();
