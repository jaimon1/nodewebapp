const { name } = require('ejs');
const Category = require('../../models/categorySchema');

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
            totalCategories: totalCategories
        })

    } catch (error) {
        console.log(error);
        res.redirect('/admin/pageError');
    }
}

const loadCategory = (req, res) => {
    try {
        res.render('addCategory')
    } catch (error) {
        res.redirect('/admin/pageError')
    }
}

const addCategory = async (req, res) => {

    try {
        const { categoryName, slug, description } = req.body;
        let validResponce = await Category.findOne({ name: categoryName });
        if (validResponce) {
            return res.status(400).json({ message: 'Category Already Exists' });
        }
        const newCategory = new Category({ name: categoryName, slug: slug, description: description });
        await newCategory.save();
        return res.json({ message: "category Added Successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }

}

const listCategory = async (req, res) => {
    try {
        const id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isListed: false } })
        res.redirect('/admin/category');
    } catch (error) {
        res.redirect('/admin/pageError');
    }
}

const unlistCategory = async (req, res) => {

    try {
        const id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isListed: true } });
        res.redirect('/admin/category');
    } catch (error) {
        console.log(error)
        res.redirect('/admin/pageError');
    }
}

const deleteCategory = async(req,res)=>{
    try {
        const id = req.query.id;
        await Category.deleteOne({_id:id});
        res.redirect('/admin/category');

    } catch (error) {
        res.redirect('/admin/pageError')
    }
}


module.exports = {
    categoryInfo,
    addCategory,
    loadCategory,
    listCategory,
    unlistCategory,
    deleteCategory
}