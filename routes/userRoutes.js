import express from 'express';
import {forgetPassword, getMyProfile, login,logout,register, resetPassword, updatePassword, updatePicture, updateProfile } from '../controllers/userController.js';
import { isAuth } from '../middlewares/auth.js';
import { singleUpload } from '../middlewares/multer.js';

const router = express.Router()

router.post('/login',login)
router.get('/logout', isAuth,logout)
router.post('/register',singleUpload,register)
router.get('/me', isAuth,getMyProfile)
router.put('/updateprofile',isAuth,updateProfile)
router.put('/updatepassword',isAuth,updatePassword)
router.put("/updatepicture", isAuth,singleUpload,updatePicture)
router.post('/forgetpassword',isAuth,forgetPassword)
router.put('/resetpassword',isAuth,resetPassword)






export default router