import { errorResponse } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[Unhandled Error]', err);

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    return errorResponse(res, `Resource not found with id of ${err.value}`, 404);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    return errorResponse(res, `Duplicate value entered for ${field}: '${value}'. Must be unique.`, 409);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return errorResponse(res, messages.join(', '), 400);
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File size too large. Maximum limit is 5MB.', 400);
    }
    return errorResponse(res, err.message, 400);
  }

  return errorResponse(
    res,
    err.message || 'Internal Server Error',
    err.statusCode || 500
  );
};
