import express from 'express';

import { isAdmin, isAuth } from '../middlewares/auth.js';
import { singleUpload } from '../middlewares/multer.js';
import { createOrder, getAdminOrders, getMyOrders, getOrderDetails, processOrder, processPayment } from '../controllers/orderController.js';

const router = express.Router()


router.post("/new",isAuth,createOrder)
router.get("/myorders",isAuth,getMyOrders)
router.get("/adminorders",isAuth,isAdmin,getAdminOrders)
router.get("/single/:id",isAuth,getOrderDetails)
router.put("/process",isAuth,isAdmin,processOrder)
router.post("/payment",isAuth,processPayment)





export default router