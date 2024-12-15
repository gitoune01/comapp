export const errorHandler = (err, req, res, next) => {
  err.message = err.message || 'Internal  Server Error';
  err.statusCode = err.statusCode || 500;

  console.log(err);
  if (err.code === 11000) {
    (err.message = `${Object.keys(err.keyValue)} already exists`),
      (err.statusCode = 400);
  }
  if (err.code === "CastError") {
    (err.message = `Invalid Id ${err.path}`),
      (err.statusCode = 400);
  }

  return res
    .status(err.statusCode)
    .json({ success: false, message: err.message });
};

export const asyncError = (passedFunc) => (req, res, next) => {
  Promise.resolve(passedFunc(req, res, next)).catch(next);
};
