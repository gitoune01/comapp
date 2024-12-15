import express from 'express';
import dotenv from 'dotenv';
import userRoute from './routes/userRoutes.js';
import productRoute from './routes/productRoutes.js';
import orderRoute from './routes/orderRoutes.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error.js';
import Cloudinary from 'cloudinary';
import Stripe from 'stripe';
import cors from 'cors';

const app = express();
dotenv.config();

app.use(express.json());
app.use(
  cors({
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: [process.env.FRONTEND_URI_1,process.env.FRONTEND_URI_2]
    
  })
);
app.use(cookieParser());

export const stripe = new Stripe(process.env.STRIPE_API_SECRET);

Cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//routes
app.use('/api/v1/user', userRoute);
app.use('/api/v1/product', productRoute);
app.use('/api/v1/order', orderRoute);

app.get('/', (req, res, next) => {
  res.send('Welcome to Server');
});

//using error middleware

app.use(errorHandler);

// DB connection

mongoose
  .connect(process.env.CONNECTION_URL)
  .then(() =>
    app.listen(process.env.PORT, () =>
      console.log(
        `Server listening on port ${process.env.PORT}, in ${process.env.NODE_ENV} mode, connected to mongoDB ${mongoose.connection.host}`
      )
    )
  )
  .catch((err) => console.log(err.message));
