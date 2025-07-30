const Product = require('../../models/productSchema');
const Brand = require('../../models/brandSchema');
const Category = require('../../models/categorySchema');

const branding = async(req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        
        
        const search = req.query.search || '';
        const sortBy = req.query.sort || 'newest';
        const category = req.query.category || '';
        const brand = req.query.brand || '';
        const minPrice = parseFloat(req.query.minPrice) || 0;
        const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_VALUE;
        
        
        const categories = await Category.find({ isListed: true });
        const brands = await Brand.find({ isBlocked: false });
        
        let query = {
            isBlocked: false
        };
        
        
        if (search) {
            query.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } }
            ];
        }
        
        
        if (category) {
            query.category = category;
        }
        
        
        if (brand) {
            query.brand = brand;
        }
        
        
        const totalProducts = await Product.countDocuments(query);
        
        
        let products = await Product.find(query)
            .populate('category')
            .populate('brand')
            .sort({ createdAt: -1 });
        
        
        products = products.map(product => {
            const productObj = product.toObject();
            if (product.variants && product.variants.length > 0) {
                productObj.minVariantPrice = Math.min(...product.variants.map(v => v.salePrice));
                productObj.maxVariantPrice = Math.max(...product.variants.map(v => v.salePrice));
                productObj.totalQuantity = product.variants.reduce((sum, v) => sum + v.quantity, 0);
            } else {
                productObj.minVariantPrice = 0;
                productObj.maxVariantPrice = 0;
                productObj.totalQuantity = 0;
            }
            productObj.avgRating = productObj.avgRating || 0;
            return productObj;
        });
        
        
        if (minPrice > 0 || maxPrice < Number.MAX_VALUE) {
            products = products.filter(product => 
                product.minVariantPrice >= minPrice && product.minVariantPrice <= maxPrice
            );
        }
        
        
        switch (sortBy) {
            case 'price_asc':
                products.sort((a, b) => a.minVariantPrice - b.minVariantPrice);
                break;
            case 'price_desc':
                products.sort((a, b) => b.minVariantPrice - a.minVariantPrice);
                break;
            case 'name_asc':
                products.sort((a, b) => a.productName.localeCompare(b.productName));
                break;
            case 'name_desc':
                products.sort((a, b) => b.productName.localeCompare(a.productName));
                break;
            case 'rating':
                products.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
                break;
            case 'newest':
                products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            default:
                products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        
        const paginatedProducts = products.slice(skip, skip + limit);
        const totalPages = Math.ceil(products.length / limit);
        
        
        const isAjax = req.xhr || 
                      (req.headers.accept && req.headers.accept.indexOf('json') > -1) || 
                      req.headers['x-requested-with'] === 'XMLHttpRequest';
        
       
        if (isAjax) {
            return res.json({
                success: true,
                products: paginatedProducts,
                currentPage: page,
                totalPages,
                totalProducts: products.length,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            });
        }
        
       
        res.render('shop', {
            user: req.session.user || req.user || null,
            products: paginatedProducts,
            categories,
            brands,
            currentPage: page,
            totalPages,
            totalProducts: products.length,
            search,
            sortBy,
            category,
            brand,
            minPrice: minPrice === 0 ? '' : minPrice,
            maxPrice: maxPrice === Number.MAX_VALUE ? '' : maxPrice,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        });
        
    } catch (error) {
        console.error('Error in product listing:', error);
        
        
        const isAjax = req.xhr || 
                      (req.headers.accept && req.headers.accept.indexOf('json') > -1) || 
                      req.headers['x-requested-with'] === 'XMLHttpRequest';
        
        if (isAjax) {
            return res.status(500).json({
                success: false,
                message: 'Error loading products. Please try again.',
                error: error.message
            });
        }
        
        res.status(500).render('pageNotFound');
    }
}

const getProductDetails = async (req, res) => {
    try {
        const productId = req.params.id;
        
        const product = await Product.findById(productId)
            .populate('category')
            .populate('brand');
            
        if (!product || product.isBlocked) {
            return res.status(404).render('pageNotFound');
        }
        
        
        const relatedProducts = await Product.find({
            category: product.category._id,
            _id: { $ne: productId },
            isBlocked: false,
            status: { $ne: 'Discontinued' }
        }).limit(4);
        
        res.render('productDetails', {
            user: req.session.user || req.user || null,
            product,
            relatedProducts
        });
        
    } catch (error) {
        console.error('Error getting product details:', error);
        res.status(500).render('pageNotFound');
    }
}



module.exports = {
    branding,
    getProductDetails
}