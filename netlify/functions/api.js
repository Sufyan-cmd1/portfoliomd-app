const serverless = require('serverless-http');
const { app, connectToDatabase } = require('../../server');

// Initialize database connection on cold start
connectToDatabase().catch(err => {
  console.warn('Netlify function initial DB connection notice:', err.message);
});

module.exports.handler = serverless(app, {
  binary: ['image/*', 'image/png', 'image/jpeg', 'image/gif', 'image/webp']
});
