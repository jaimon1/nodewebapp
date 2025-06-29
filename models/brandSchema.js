const mongoose = require('mongoose');

const { Schema } = mongoose;

const brandSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    BrandImage: {
        type: [String],
        required:true
    },
    isBlocked: {
        type:Boolean,
        default:false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Brand = mongoose.model('Brand',brandSchema);

module.exports = Brand;