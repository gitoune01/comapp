import ErrorHandler from '../utils/errorCode.js';
import jwt from 'jsonwebtoken';
import { asyncError } from './error.js';
import User from '../models/userModel.js';

export const isAuth = asyncError(async (req, res, next) => {
  const { authToken } = req.cookies;
  if (!authToken)
    return next(new ErrorHandler('Not authorized access, Please login', 401));
  const jwtPayload = jwt.verify(authToken, process.env.JWT_SECRET);
  req.user = await User.findById(jwtPayload._id);

  next();
});
export const isAdmin = asyncError(async (req, res, next) => {
  if (req.user.role !== 'admin')
    return next(new ErrorHandler('Only Admin allowed', 401));

  next();
});
