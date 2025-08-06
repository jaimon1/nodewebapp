const { name } = require('ejs');
const Category = require('../../models/categorySchema');
const Product = require('../../models/productSchema');

const categoryInfo = async (req, res) => {
    try {
        let page = Number(req.query.page) || 1;
        let limit = 8;
        let skip = (page - 1) * limit;
        let search = req.query.search || '';

        let categoryData = await Category.find({
            $or: [
                { slug: { $regex: ".*" + search + ".*", $options: "i" } },
                { name: { $regex: ".*" + search + ".*", $options: "i" } }
            ]
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

        let totalCategories = await Category.countDocuments({
            $or: [
                { slug: { $regex: ".*" + search + ".*", $options: "i" } },
                { name: { $regex: ".*" + search + ".*", $options: "i" } }
            ]
        });
        let totalPages = Math.ceil(totalCategories / limit);
        res.render('category', {
            cat: categoryData,
            currentPage: page,
            totalPages: totalPages,
            totalCategories: totalCategories,
            search
        })

    } catch (error) {
        console.log(error);
        res.redirect('/admin/pageError');
    }
}

const loadCategory = async (req, res) => {
    try {
        const id = req.query.id;
        let category = null
        if (id) {
            category = await Category.findById(id)
        }
        res.render('addCategory', { category });
    } catch (error) {
        res.redirect('/admin/pageError')
    }
}

const addCategory = async (req, res) => {

    const { id, categoryName, description } = req.body;
    console.log(id, categoryName, description)
    try {
        if (id) {
            let isHas = await Category.findOne({ name: categoryName });
            if (isHas) {
                return res.status(400).json({ message: 'Category Already Exists' });
            }
            await Category.findByIdAndUpdate(id, { name: categoryName, description: description }, { new: true });
            return res.json({ message: "Category Updated Successfully" });
        }

        let validResponce = await Category.findOne({ name: categoryName });
        if (validResponce) {
            return res.status(400).json({ message: 'Category Already Exists' });
        }
        const newCategory = new Category({ name: categoryName,description: description });
        await newCategory.save();
        return res.json({ message: "category Added Successfully" });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }

}

const listCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const page = req.query.page
        await Category.updateOne({ _id: id }, { $set: { isListed: false } })
        res.redirect(`/admin/category?page=${page}`);
    } catch (error) {
        res.redirect('/admin/pageError');
    }
}

const unlistCategory = async (req, res) => {

    try {
        const page = req.query.page
        const id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isListed: true } });
        res.redirect(`/admin/category?page=${page}`);

    } catch (error) {
        console.log(error)
        res.redirect('/admin/pageError');
    }
}

const deleteCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const page = req.query.page
        await Category.deleteOne({ _id: id });
        res.redirect(`/admin/category?page=${page}`);

    } catch (error) {
        res.redirect('/admin/pageError');
    }
}
const addCategoryOffer = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;
        const percentage = parseInt(req.body.percentage);

        let category = await Category.findOne({ _id: categoryId });
        if (!category) {
            return res.status(404).json({ status: false, message: "Category Not Exists" });
        }
        const products = await Product.find({ category: categoryId });
        if (!products || !Array.isArray(products)) {
            return res.status(404).json({ status: false, message: "No products found in this category." });
        }
        const productHas = products.some((product) => product.productOffer > percentage);
        if (productHas) {
            return res.json({ status: false, message: "in the category Products Already has Product Offer" })
        }
        await Category.updateOne({ _id: categoryId }, { $set: { categoryOffer: percentage } });

        for (const product of products) {
            product.productOffer = 0,
                product.salePrice = product.regularPrice,
                await product.save();
        }

        res.status(200).json({ status: true });


    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

const removeCategoryOffer = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;
        const category = await Category.findById(categoryId);
        if (!category) {
            res.status(400).json({ status: false, message: "Catogory Not Exists" });
        }
        const percentage = category.categoryOffer;
        const products = await Product.find({ category: categoryId });
        if (products.length > 0) {
            for (const product of products) {
                product.salePrice += Math.floor(product.regularPrice * (percentage / 100));
                product.productOffer = 0;
                await product.save();
            }
        }

        category.categoryOffer = 0;
        await category.save();
        res.status(200).json({ status: true });


    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error" });
    }
}

module.exports = {
    categoryInfo,
    addCategory,
    loadCategory,
    listCategory,
    unlistCategory,
    deleteCategory,
    addCategoryOffer,
    removeCategoryOffer,
}