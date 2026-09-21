// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    error: {
      message: err.message,
      details: err.details || null,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    },
  });
};

module.exports = errorHandler;
