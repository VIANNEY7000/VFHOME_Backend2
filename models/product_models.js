import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
{
    name:{type:String, required:true},
    price:{type:Number, required:true},
    discription:{type:String, required:true},
    image:{type:String},
    stock:{type:Number},
    category:{type:String},    
},

{timestamps:true}

)

export const product = mongoose.model( 'product', productSchema )