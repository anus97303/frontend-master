import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/response.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return errorResponse(res, formattedErrors[0]?.message || 'Validation failed', 400, formattedErrors);
  }
  next();
};
