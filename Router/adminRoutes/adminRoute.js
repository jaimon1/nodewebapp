const express = require('express');
const router = express.Router()
const adminController = require('../../controllers/admin/adminControl');
const { adminAuth, userAuth } = require('../../middilwares/auth');
const userController = require('../../controllers/admin/userController');
const categoryController = require('../../controllers/admin/categoryController');
const productController = require('../../controllers/admin/productControl');
const { uploadDisk, uploads } = require('../../helpers/multer');
const brandController = require('../../controllers/admin/brandController');


// adminRoutes
router.get('/pageError', adminController.pageError);
router.get('/login', adminController.loadLogin);
router.post('/login', adminController.registerLogin);
router.get('/', adminAuth, adminController.dashboard);
router.get('/logout', adminController.logoutPage);

// userRoutes
router.get('/users', adminAuth, userController.userPage);
router.get('/notFound', userController.notFound);
router.get('/blockCustomer', adminAuth, userController.blockUsers);
router.get('/unBlockCustomer', adminAuth, userController.unBlockUsers);

// categoryRoutes
router.get('/category', adminAuth, categoryController.categoryInfo);
router.get('/addCategory', adminAuth, categoryController.loadCategory);
router.post('/addCategory', adminAuth, categoryController.addCategory);
router.get('/List', adminAuth, categoryController.listCategory);
router.get('/unList', adminAuth, categoryController.unlistCategory);
router.get('/deleteCategory', adminAuth, categoryController.deleteCategory);
router.post('/addCatedoryOffer', adminAuth, categoryController.addCategoryOffer);
router.post('/removeCategoryOffer', adminAuth, categoryController.removeCategoryOffer);

// Brand Routes
router.get('/brands', adminAuth, brandController.loadBrand);
router.post('/createBrand', adminAuth, uploads.single('logo'), brandController.createBrand);
router.get('/createBrand', adminAuth, brandController.loadCreateBrand);
router.get('/blockBrand', adminAuth, brandController.blockBrand);
router.get('/unBlockBrand', adminAuth, brandController.unBlockBrand);
router.get('/deleteBrand', adminAuth, brandController.deleteBrand);

//Product Routes
router.get('/loadProduct', adminAuth, productController.loadProductList);
router.get("/addProduct", adminAuth, productController.loadAddProduct)
router.post('/addProduct', uploadDisk.array( 'productImages',5), productController.addProduct);
router.get('/blockProduct',adminAuth,productController.blockProduct);
router.get('/unblockProduct',adminAuth,productController.unblockProduct);
router.get("/deleteProduct",adminAuth,productController.deleteProduct);
router.get('/editProduct/:id',adminAuth,productController.loadeditProduct);
router.post('/editProduct/:id', uploadDisk.array('productImages', 5), productController.editProduct)
module.exports = router;




