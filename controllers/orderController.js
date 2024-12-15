import { asyncError, errorHandler } from '../middlewares/error.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { stripe } from '../server.js';

export const processPayment = asyncError(async (req, res, next) => {
  const { totalAmount } = req.body;
  const { client_secret } = await stripe.paymentIntents.create({
    amount: Number(totalAmount * 100),
    currency: 'EUR',
  });
  res.status(200).json({
    success: true,
    client_secret
  })
});

export const createOrder = asyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentMethod,
    paymentIfnfo,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
  } = req.body;

  await Order.create({
    user: req.user._id,
    shippingInfo,
    orderItems,
    paymentMethod,
    paymentIfnfo,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
  });

  for (let i = 0; i < orderItems.length; i++) {
    const product = await Product.findById(orderItems[i].product);
    product.stock -= orderItems[i].quantity;
    await product.save();
  }

  res.status(201).json({
    success: true,
    message: 'Order Place Successfull',
  });
});

export const getMyOrders = asyncError(async (req, res, next) => {
  console.log('USER', req.user);
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getAdminOrders = asyncError(async (req, res, next) => {
  console.log('USER', req.user);
  const orders = await Order.find({});

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getOrderDetails = asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new errorHandler('Order Not Found', 404));
  res.status(200).json({
    success: true,
    order,
  });
});
export const processOrder = asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new errorHandler('Order Not Found', 404));

  if (order.statusStatus === 'Preparing') order.orderStatus = 'Shipped';
  else if (order.orderStatus === 'Shipped') {
    order.orderStatus = 'Delivered';
    order.deliveredAt = new Date(Date.now());
  } else return next(new errorHandler('Order already delivered', 404));

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order processed successfully',
  });
});
