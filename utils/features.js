import DataUriParser from 'datauri/parser.js';
import path from 'path';
import nodemailer from 'nodemailer';

export const getDataUri = (file) => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};

export const sendToken = (user, res, message, statusCode) => {
  const token = user.generateToken();

  res
    .status(statusCode)
    .cookie('authToken', token, {
      ...cookieOptions,
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    })
    .json({ success: true, message });
};

export const cookieOptions = {
  secure: process.env.NODE_ENV === 'development' ? false : true, //cookies over http-https
  httpOnly: process.env.NODE_ENV === 'development' ? false : true, //read-only cookies
  sameSite: process.env.NODE_ENV === 'development' ? false : 'none',
};

// export const sendEmail = async (subject, to, text) => {
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.mailtrap.io',
//     port: 2525,
//     auth: {
//       user: '95d4406586c7cd',
//       pass: '********7ee2',
//     },
//   });

//   await transporter.sendMail({
//     to,
//     subject,
//     text,
//   });
// }

 export const sendEmail = async (subject, to, text) => {
   const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
        user: 'eileen.gleason21@ethereal.email',
        pass: 'FWsME1dStc1rHthpue'
    },
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates
  },

   });

   await transporter.sendMail({
     to,
     subject,
     text,  });
 }


