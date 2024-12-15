import mongoose, { Schema } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'

const userSchema =  mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name'],
  },
  email: {
    type: String,
    required: [true, 'Please enter an email address'],
    unique: [true, 'Email is already taken'],
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  pinCode: {
    type: Number,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  avatar: {
    public_id: String,
    url: String,
  },
  otp: Number,
  otp_expire: Date,
});

userSchema.pre('save', async function (next) {
  if(!this.isModified("password")) return next()
  this.password =  await bcrypt.hash(this.password, 10);
});


userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

//create jwt token at login
userSchema.methods.generateToken = function(){
  console.log('SECRET', process.env.JWT_SECRET)
  return jwt.sign({_id:this._id}, process.env.JWT_SECRET,{
    expiresIn:"15d"
   })
}



export default mongoose.model('User', userSchema);
