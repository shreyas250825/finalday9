const express = require('express');
const app = express();

// 1. Critical middleware ordering - must come first
app.use((req, res, next) => {
  // Force all responses to be JSON
  res.setHeader('Content-Type', 'application/json');
  next();
});

// 2. Error handler middleware
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  
  const response = {
    success: false,
    message: err.message,
    status: err.status || 500
  };

  // Only show stack in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  // Ensure JSON is sent
  res.status(response.status).json(response);
};

// 3. Routes
app.get('/async-error', async (req, res, next) => {
  try {
    throw new Error('This is an async error!');
  } catch (err) {
    return next(err); // Explicit return
  }
});

// 4. Apply error handler last
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Test endpoint: http://localhost:3000/async-error');
});