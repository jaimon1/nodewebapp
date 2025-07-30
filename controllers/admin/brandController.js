const { name } = require('ejs');
const Brand = require('../../models/brandSchema');
const sharp = require('sharp');
const Product = require('../../models/productSchema');
const path = require('path');

const loadBrand = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 3;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const brandData = await Brand.find({
            name: { $regex: ".*" + search + ".*", $options: 'i' }
        }).sort({ createdAt: 1 }).skip(skip).limit(limit);
        const totalBrand = await Brand.countDocuments({
            name: { $regex: ".*" + search + ".*", $options: 'i' }
        })
        const totalPage = Math.ceil(totalBrand / limit);
        const reversedBrand = brandData.reverse()
        res.render('brand', {
            currentPages: page,
            brandData: reversedBrand,
            totalBrandCount: totalBrand,
            totalPage: totalPage,
            search
        })
    } catch (error) {
        console.log(error)
        res.redirect('/admin/pageError');
    }
}

const createBrand = async (req, res) => {
    try {

        const brandName = req.body.name;
        const ishas = await Brand.findOne({ name: brandName });
        if (!ishas) {

            const fileName = Date.now() + "-" + req.file.originalname.split(" ").join("-");
            const outputPath = path.join(__dirname, "../../public/uploads/re-images", fileName);

            await sharp(req.file.buffer)
                .resize(250, 250, {
                    fit: "contain",
                    background: { r: 255, g: 255, b: 255, alpha: 1 }
                })
                .toFormat('webp', { quality: 80 })
                .toFile(outputPath);
            const newData = new Brand({ name: brandName, BrandImage: fileName });
            await newData.save();
            return res.redirect("/admin/createBrand?brandadded=success");
        } else {
            return res.redirect("/admin/createBrand?brandadded=exists");
        }

    } catch (error) {
        console.log(error)
        res.redirect("/admin/pageError");
    }
}

const loadCreateBrand = (req, res) => {
    try {
        res.render("createBrand")
    } catch (error) {
        res.redirect("/admin/pageError")
    }
}

const blockBrand = async (req, res) => {
    try {
        const id = req.query.id;
        const page = req.query.page || 1
        await Brand.updateOne({ _id: id }, { $set: { isBlocked: false } });
        res.redirect(`/admin/brands?page=${page}`)
    } catch (error) {
        res.redirect("/admin/pageError")
    }
}

const unBlockBrand = async (req, res) => {
    try {
        const id = req.query.id;
        const page = req.query.page || 1
        await Brand.updateOne({ _id: id }, { $set: { isBlocked: true } });
        res.redirect(`/admin/brands?page=${page}`)
    } catch (error) {
        res.redirect("/admin/pageError")
    }
}

const deleteBrand = async (req, res) => {
    try {
        const id = req.query.id;
        const page = req.query.page;
        await Brand.deleteOne({ _id: id });
        res.redirect(`/admin/brands?page=${page}`)

    } catch (error) {
        res.redirect('/admin/pageError');
    }
}

module.exports = {
    loadBrand,
    createBrand,
    loadCreateBrand,
    blockBrand,
    unBlockBrand,
    deleteBrand
}