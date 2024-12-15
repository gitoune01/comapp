import { asyncError, errorHandler } from '../middlewares/error.js';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import ErrorHandler from '../utils/errorCode.js';
import { getDataUri } from '../utils/features.js';
import cloudinary from 'cloudinary';

export const getAllProducts = asyncError(async (req, res, next) => {
  //search and Category query

  const { keyword, category } = req.query;
  const products = await Product.find({
    name: {
      $regex: keyword ? keyword : '',
      $options: 'i',
    },
    category: category ? category : undefined,
  })

  res.status(200).json({
    success: true,
    products,
  });
});
export const productsForAdmin = asyncError(async (req, res, next) => {
   const products = await Product.find({}).populate('category')

   const outOfStock = products.filter(p=> p.stock===0)

  

  res.status(200).json({
    success: true,
    products,
    outOfStock:outOfStock.length,
    inStock:products.length - outOfStock.length
  });
});

export const getProductDetails = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('category');

  if (!product) return next(new ErrorHandler('Product not found', 400));

  res.status(200).json({
    success: true,
    product,
  });
});

export const createProduct = asyncError(async (req, res, next) => {
  const { name, description, category, price, stock } = req.body;

  if (!req.file) return next(new ErrorHandler('Please image', 400));

  const file = getDataUri(req.file);
  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  const image = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  await Product.create({
    name,
    description,
    category,
    price,
    stock,
    images: [image],
  });

  res.status(200).json({
    success: true,
    message: 'Product created successfully',
  });
});

export const updateProduct = asyncError(async (req, res, next) => {
  const { name, description, category, price, stock } = req.body;

  console.log(name, description, category, price, stock);

  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler('Product not found'));
  if (name) product.name = name;
  if (description) product.description = description;
  if (category) product.category = category;
  if (price) product.price = price;
  if (stock) product.stock = stock;

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
  });
});

export const addNewImage = asyncError(async (req, res, next) => {
  if (!req.file) return next(new ErrorHandler('Please image', 400));

  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler('No product found', 400));

  const file = getDataUri(req.file);
  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  const image = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
  product.images.push(image);
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Image added successfully',
  });
});

export const removeImage = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler('No product found', 404));

  const imageId = req.query.id;
  if (!imageId) return next(new ErrorHandler('No image found', 404));

  let isExist = -1;
  product.images.forEach((item, index) => {
    if (item._id.toString() === imageId.toString()) isExist = index;
  });

  if (isExist < 0) return next(new ErrorHandler('Image not found', 404));

  await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);

  product.images.splice(isExist, 1);
  await product.save();

  res.status(201).json({
    success: true,
    message: 'Image deleted successfully',
  });
});

export const deleteProduct = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) return next(new ErrorHandler('Product not found', 404));

  for (let index = 0; index < product.images.length; index++) {
    await cloudinary.v2.uploader.destroy(product.images[index].public_id);
  }

  await Product.deleteOne({ _id: product._id });

  res.status(201).json({
    success: true,
    message: 'Product Deleted Successfully',
  });
});

export const addCategory = asyncError(async (req, res, next) => {
  const { category } = req.body;

  await Category.create({ category });

  res.status(201).json({
    success: true,
    message: 'Category added successfully',
  });
});

export const getAllCategories = asyncError(async (req, res, next) => {
  const categories = await Category.find({});
  res.status(201).json({
    success: true,
    categories,
  });
});
export const deleteCategory = asyncError(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorHandler('Category not found', 404));

  const products = await Product.find({
    category: category._id,
  });

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    product.category = undefined;
    await product.save();
  }

  await Category.deleteOne({ _id: req.params.id });

  res.status(201).json({
    success: true,
    message: 'Category deleted successfully',
  });
});
