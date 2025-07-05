const express = require('express');
const userController = require('../../controllers/user/userController');
const router = express.Router();


router.get('/',userController.loadHomepage);
router.get('/page-not-found',userController.pageNotFound);
router.get('/register',userController.loadregisterPage);
router.post('/register',userController.registration);
router.post('/verifyOtp',userController.verifyOtp);
router.post('/resendOtp',userController.resendOtp);
module.exports = router;