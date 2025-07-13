const express = require('express');
const router = express.Router()
const adminController = require('../../controllers/admin/adminControl');
const { adminAuth, userAuth } = require('../../middilwares/auth');
const userController = require('../../controllers/admin/userController');
const categoryController = require('../../controllers/admin/categoryController')


// adminRoutes
router.get('/pageError', adminController.pageError);
router.get('/login', adminController.loadLogin);
router.post('/login', adminController.registerLogin);
router.get('/',adminAuth, adminController.dashboard);
router.get('/logout',adminController.logoutPage);

// userRoutes
router.get('/users',adminAuth,userController.userPage);
router.get('/notFound',userController.notFound);
router.get('/blockCustomer',adminAuth,userController.blockUsers);
router.get('/unBlockCustomer',adminAuth,userController.unBlockUsers);

// categoryRoutes
router.get('/category',adminAuth,categoryController.categoryInfo);
router.get('/addCategory',adminAuth,categoryController.loadCategory);
router.post('/addCategory',adminAuth,categoryController.addCategory);
router.get('/List',adminAuth,categoryController.listCategory);
router.get('/unList',adminAuth,categoryController.unlistCategory);
router.get('/deleteCategory',adminAuth,categoryController.deleteCategory)

module.exports = router