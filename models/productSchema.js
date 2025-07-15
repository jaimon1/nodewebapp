const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({

    productName: {
        type: String,
        required: true
    },
    productDescription: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    regularPrice: {
        type:Number,
        required:true
    },
    salePrice:{
        type: Number,
        required:true
    },
    productOffer: {
        type:Number,
        default: 0
    },
    quantity:{
        type: Number,
        default: true
    },
    color:{
        type:String,
        required: true
    },
    ProductImage:{
        type:[String],
        required:true
    },
    isBlocked:{
        type:Boolean,
        required:true
    },
    status: {
        type:String,
        enum: ["Available","Out of Stock","Discontinued"],
        require:true,
        default:"Available"
    }
},{timestamps:true});

const Product = mongoose.model('Product',productSchema);

module.exports = Product;