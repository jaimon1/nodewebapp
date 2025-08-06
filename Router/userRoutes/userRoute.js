const express = require('express');
const userController = require('../../controllers/user/userController');
const productController = require('../../controllers/user/productControler');
const passport = require('passport');
const { checkUserBlocked } = require('../../middilwares/auth');
const { errorHandler } = require('../../middilwares/auth');
const router = express.Router();
const profileController = require('../../controllers/user/profileControler')

router.use(checkUserBlocked);


router.get('/', userController.loadHomepage);
router.get('/page-not-found', userController.pageNotFound);
router.get('/register', userController.loadregisterPage);
router.post('/register', userController.registration);
router.post('/verifyOtp', userController.verifyOtp);
router.post('/resendOtp', userController.resendOtp);
router.get('/login', userController.loadLogin);
router.post('/login', userController.loginRegister);
router.get('/logout', userController.logout);
router.get('/forgot-password', userController.loadForgotPassword);
router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-forgot-password-otp', userController.verifyForgotPasswordOtp);
router.post('/resend-forgot-password-otp', userController.resendForgotPasswordOtp);
router.get('/reset-password-with-otp', userController.loadResetPasswordWithOtp);
router.post('/reset-password-with-otp', userController.resetPasswordWithOtp);

router.get("/shop", productController.branding)
router.get('/product/:id', productController.getProductDetails)



router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login?error=google_blocked' }), (req, res) => {
    if (req.user) {
        res.redirect('/');
    } else {
        
        res.redirect('/login?error=google_blocked');
    }
})

router.get('/profile',profileController.loadProfile);
router.get('/editProfile',profileController.loadEditProfile);
router.post('/editProfile',profileController.editprofile);


router.use(errorHandler);
module.exports = router;