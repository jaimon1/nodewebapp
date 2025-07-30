const Product = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const Brand = require('../../models/brandSchema');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');


const loadProductList = async (req, res) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const query = {
            productName: { $regex: ".*" + search + ".*", $options: "i" }
        }

        const productData = await Product.find(query)
            .populate("category", 'name')
            .populate("brand", "name")
            .sort({ createdAt: -1 }).skip(skip).limit(limit);

        const productTotal = await Product.countDocuments(query);

        const totalPages = Math.ceil(productTotal / limit);

        res.render('product', {
            currentPage: page,
            totalPages: totalPages,
            productData: productData,
            search,

        });
    } catch (error) {
        res.redirect('/admin/pageError')
    }
}

const loadAddProduct = async (req, res) => {
    try {
        const categoryData = await Category.find({});
        const brandData = await Brand.find({});

        res.render("adminProduct", {
            categoryData: categoryData,
            brandData: brandData,
            id: false
        })

    } catch (error) {

    }
}
const addProduct = async (req, res) => {
    try {

        const { productName, brand, category, description } = req.body;
        const variants = JSON.parse(req.body.variants)

        const paths = req.files.map(file => file.filename);

        const categoryData = await Category.findOne({ name: category });
        if (!categoryData) {
            return res.status(400).json({ success: false, message: "Category Is Required" });
        }

        const brandData = await Brand.findOne({ name: brand });
        if (!brandData) {
            return res.status(400).json({ success: false, message: "Brand Is required" });
        }

        const ishas = await Product.findOne({ productName: productName });
        if (ishas) {
            return res.status(400).json({ success: false, message: "Product Already Exists" });
        }

        const newProduct = new Product({
            productName: productName, brand: brandData._id, category: categoryData._id,
            shortDescription: description, ProductImages: paths, variants
        });
        await newProduct.save();

        res.json({
            success: true,
            message: "Data received successfully",
            body: req.body,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const blockProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const page = req.query.page;
        await Product.updateOne({ _id: id }, { $set: { isBlocked: true } });
        res.redirect(`/admin/loadProduct?page=${page}`);
    } catch (error) {
        res.redirect('/admin/pageError');
    }
}

const unblockProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const page = req.query.page;
        await Product.updateOne({ _id: id }, { $set: { isBlocked: false } });
        res.redirect(`/admin/loadProduct?page=${page}`);
    } catch (error) {
        res.redirect('/admin/pageError');
    }
}

const deleteProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const page = req.query.page;
        await Product.deleteOne({ _id: id });
        res.redirect(`/admin/loadProduct?page=${page}`);
    } catch (error) {
        res.redirect('/admin/pageError');
    }
}

const loadeditProduct = async (req, res) => {
    try {

        const id = req.params.id;
        const productData = await Product.findById(id).populate("brand", "name").populate("category", "name");
        const brandData = await Brand.find({}, 'name')
        const categoryData = await Category.find({}, 'name')

        if (!productData) {
            res.redirect("/admin/pageError");
            console.log("Cannot Find Products");
        }

        res.render('adminProduct', {
            productData: productData,
            brandData: brandData,
            categoryData: categoryData,
            id: id
        })



    } catch (error) {
        res.redirect('/admin/pageError');
    }
}

const editProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { productName, brand, category, description } = req.body;
        let variants;z
        try {
            variants = JSON.parse(req.body.variants);
        } catch (e) {
            return res.status(400).json({ success: false, message: "Invalid variants data" });
        }

        if (!productName || !brand || !category || !description || !variants || !Array.isArray(variants) || variants.length === 0) {
            return res.status(400).json({ success: false, message: "All fields are required and at least one variant must be provided." });
        }

        const categoryData = await Category.findOne({ name: category });
        if (!categoryData) {
            return res.status(400).json({ success: false, message: "Category is required." });
        }
        const brandData = await Brand.findOne({ name: brand });
        if (!brandData) {
            return res.status(400).json({ success: false, message: "Brand is required." });
        }

        let images = [];
        if (req.body.existingImages) {
            try {
                images = JSON.parse(req.body.existingImages);
            } catch (e) {

                if (typeof req.body.existingImages === 'string') {
                    images = [req.body.existingImages];
                }
            }
        }
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.filename);
            images = images.concat(newImages);
        }
        if (!images || images.length === 0) {
            return res.status(400).json({ success: false, message: "At least one product image is required." });
        }

        for (const v of variants) {
            if (!v.storage || typeof v.storage !== 'string' || !v.regularPrice || isNaN(v.regularPrice) || v.regularPrice < 0 || !v.quantity || isNaN(v.quantity) || v.quantity < 0) {
                return res.status(400).json({ success: false, message: "Invalid variant data." });
            }
        }

        await Product.findByIdAndUpdate(id, {
            productName,
            shortDescription: description,
            brand: brandData._id,
            category: categoryData._id,
            variants,
            ProductImages: images
        });


        res.json({ success: true, message: "Product updated successfully." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
module.exports = {
    loadProductList,
    loadAddProduct,
    addProduct,
    blockProduct,
    unblockProduct,
    deleteProduct,
    loadeditProduct,
    editProduct
}