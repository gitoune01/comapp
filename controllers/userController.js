import { asyncError, errorHandler } from '../middlewares/error.js';
import User from '../models/userModel.js';
import ErrorHandler from '../utils/errorCode.js';
import {
  cookieOptions,
  getDataUri,
  sendEmail,
  sendToken,
} from '../utils/features.js';
import cloudinary from 'cloudinary';

export const login = asyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  //handle error

  const isMatched = await user.comparePassword(password);

  if (!isMatched) return next(new ErrorHandler('Invalid password', 402));

  //send jwt token

  sendToken(user, res, `Welcome back,${user.name}`, 200);
});

// REGISTER

export const register = asyncError(async (req, res, next) => {
  const { name, email, password, address, city, country, pinCode } = req.body;
  let userExists = await User.findOne({ email });

  if (userExists) return next(new ErrorHandler('User already registered', 400));

  let avatar = undefined;
  if (req.file) {
    const file = getDataUri(req.file);
    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const user = await User.create({
    name,
    avatar,
    email,
    password,
    address,
    city,
    country,
    pinCode,
  });

  sendToken(user, res, 'Registered successfully', 201);
});

export const getMyProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

//logout

export const logout = asyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie('authToken', '', {
      ...cookieOptions,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: 'User logged out',
    });
});

//update profile

export const updateProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const { name, email, address, city, country, pinCode } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (address) user.address = address;
  if (city) user.city = city;
  if (country) user.country = country;
  if (pinCode) user.pinCode = pinCode;

  await user.save();

  res.status(201).json({ success: 'Updated profile successfully' });
});
export const updatePassword = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return next(new ErrorHandler('Provide all passwords'), 400);

  const isMatched = await user.comparePassword(oldPassword);
  if (!isMatched) return next(new ErrorHandler('Password mismatch', 400));

  user.password = newPassword;
  await user.save();

  res
    .status(200)
    .json({ success: true, message: 'Password updated successfully' });
});

//update pictures

export const updatePicture = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  console.log('REQFILE', req.file);
  const file = getDataUri(req.file);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  user.avatar = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
  await user.save();
  res.status(200).json({
    success: true,
    message: 'Successfully updated picture',
  });
});

export const forgetPassword = asyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  console.log('USER===========>', user.email);
  if (!user) return next(new errorHandler('Incorrect Email', 404));

  const randomNumber = Math.random() * (999999 - 100000) + 100000;

  const otp = Math.floor(randomNumber);
  const otp_expire = 15 * 60 * 1000;

  user.otp = otp;
  user.otp_expire = new Date(Date.now() + otp_expire);
  await user.save();
  console.log(otp);

  const message = `Your OTP  For Reseting Password is ${otp}.Ignore if You Haven't request`;
  try {
    await sendEmail('OTP For Reset Password', user.email, message);
  } catch (error) {
    user.otp = null;
    user.otp_expire = null;
    await user.save();
    return next(error);
  }

  res.status(200).json({
    success: true,
    message: `Email Sent to ${user.email}`,
  });
});
export const resetPassword = asyncError(async (req, res, next) => {
  const { otp, password } = req.body;

  const user = await User.findOne({
    otp,
    otp_expire: {
      $gt: Date.now(),
    },
  });
  if (!user)
    return next(new ErrorHandler('Incorrect OTP or has been expired', 400));
 if(!password) return next(new ErrorHandler('Please enter a new password',400))
  user.password = password;
  user.otp=undefined;
  user.otp_expire=undefined;
  
  await user.save();

  res.status(200).json({
    success: true,
    message:'Password Changed Successfully, You can login now'
  });
});
