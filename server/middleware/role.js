import { errorResponse } from '../utils/response.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'User identity not found', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
        403
      );
    }

    next();
  };
};
