const express = require('express');
const userController = require('../../controllers/user/userController');
const productController = require('../../controllers/user/productControler');
const passport = require('passport');
const router = express.Router();


router.get('/',userController.loadHomepage);
router.get('/page-not-found',userController.pageNotFound);
router.get('/register',userController.loadregisterPage);
router.post('/register',userController.registration);
router.post('/verifyOtp',userController.verifyOtp);
router.post('/resendOtp',userController.resendOtp);
router.get('/login',userController.loadLogin);
router.post('/login',userController.loginRegister);
router.get('/logout',userController.logout);
router.get('/forgot-password',userController.loadForgotPassword);
router.post('/forgot-password',userController.forgotPassword);
router.post('/verify-forgot-password-otp',userController.verifyForgotPasswordOtp);
router.post('/resend-forgot-password-otp',userController.resendForgotPasswordOtp);
router.get('/reset-password-with-otp',userController.loadResetPasswordWithOtp);
router.post('/reset-password-with-otp',userController.resetPasswordWithOtp);

router.get("/shop",productController.branding)
router.get('/product/:id',productController.getProductDetails)



router.get('/auth/google',passport.authenticate('google',{scope:['profile','email'],prompt: 'select_account'}));
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/register'}),(req,res)=>{
    res.redirect('/');
})
module.exports = router;