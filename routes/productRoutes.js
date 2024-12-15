import express from 'express';

import { isAdmin, isAuth } from '../middlewares/auth.js';
import { singleUpload } from '../middlewares/multer.js';
import { addCategory, addNewImage, createProduct, deleteCategory, deleteProduct, getAllCategories, getAllProducts, getProductDetails, productsForAdmin, removeImage, updateProduct } from '../controllers/productController.js';

const router = express.Router()


router.get('/all',getAllProducts)
router.get('/single/:id',getProductDetails)
router.post('/new',isAuth,isAdmin,singleUpload, createProduct)
router.put('/update/:id',isAuth,isAdmin,updateProduct)
router.post('/images/:id',isAuth,isAdmin,singleUpload,addNewImage)
router.delete('/images/delete/:id',isAuth,isAdmin,removeImage)
router.delete('/delete/:id',isAuth, deleteProduct)
router.post('/cats/add',isAuth,isAdmin, addCategory)
router.get('/cats/list',getAllCategories)
router.delete('/cats/delete/:id',isAuth,isAdmin,deleteCategory)
router.get('/admin',isAuth,isAdmin,productsForAdmin)







export default router