import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Enter Name'],
  },
  description: {
    type: String,
    required: [true, 'Please Enter Description'],
  },
  price: {
    type: Number,
    required: [true, 'Please Enter Price'],
  },
  stock:{
    type: String,
    required: [true, 'Please Enter Stock'],
  },
  images:[
    {
      public_id:String,
      url:String,
    }
  ],
  category:{
     type:mongoose.Schema.Types.ObjectId,
     ref:"Category"
  },
  createdAt:{
    type: Date,
    default: Date.now()
  }

});

export default mongoose.model('Product', productSchema);
