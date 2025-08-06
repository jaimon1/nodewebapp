const User = require('../../models/userSchema');
const Product = require('../../models/productSchema');
const nodemailer = require('nodemailer');
const Brand = require('../../models/brandSchema');
const Category = require('../../models/categorySchema');
require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const pageNotFound = async (req, res) => {
    try {
        res.render('pageNotFound');
    } catch (error) {
        res.redirect('/page-not-found');
    }
}

const loadHomepage = async (req, res) => {
    try {
        const brandData = await Brand.find({
            isBlocked: false,
        })
        const categoryData = await Category.find({
            isListed : true,
        })
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = 8
        const skip = (page - 1) * limit;
        const existsProducts = await Product.find({
            isBlocked: false,
        }).skip(skip).limit(limit).sort({ createdAt: -1 });

        if(!existsProducts || existsProducts.length === 0 ){
            console.log("No More Product Available");
        }

        const totalCount = await Product.countDocuments({
            isBlocked: false
        });

        let totalPages = Math.ceil(totalCount / limit);


        if (req.session.user || req.user) {
            res.render('index', {
                user: req.session.user || req.user,
                totalPages: totalPages,
                currentPage: page,
                brandData:brandData,
                categoryData: categoryData,
                productData: existsProducts,
                search: search

            });
        } else {
            res.render('index', {
                user: false,
                brandData:brandData,
                categoryData: categoryData,
                totalPages: totalPages,
                currentPage: page,
                productData: existsProducts,
                search: search
            });
        }
    } catch (error) {
        console.log('Home page not found');
        res.status(500).send('Server not Found');
    }
};
const loadregisterPage = async (req, res) => {
    try {
        if (!req.session.user) {
            res.render('Signup', { msg: null });
        }
    } catch (error) {
        console.log('Error occured on register page');
        res.status(500).send("Server not found");
    }
}

function genarateOtp() {
    return Math.floor(100000 + Math.random() * 900000);
}

async function sendMailVerification(email, otp, name) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        const info = await transporter.sendMail({
            from: process.env.EMAIL_ADDRESS,
            to: email,
            subject: "Email Verification",
            text: `Your OTP is ${otp}`,
            html: `Hi <b>${name} I'm a Proffessional Web Developer <b>JAIMON A A</b> </b> <b>Your One Time Password is ${otp}</b>`
        });

        return info.accepted.length > 0;

    } catch (error) {
        console.log("Something went wrong while sending email to the user");
        return false;
    }
}

const registration = async (req, res) => {

    try {
        const { username, phone, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.render('Signup', { msg: "Password do not match" })
        }

        const emailAlreadyExists = await User.findOne({ email });

        if (emailAlreadyExists) {
            return res.render('Signup', { msg: "Email Already Exists" });
        }

        let otp = genarateOtp();

        let emailSend = sendMailVerification(email, otp, username);
        if (!emailSend) {
            res.json("email Error");
        }
        req.session.userOtp = otp;
        req.session.userData = { username, phone, email, password };

        res.render('otpVerify');
        console.log(`otp Sent Successfully ${otp}`);
    } catch (error) {
        console.log(`An Error occured ${error}`);
        res.redirect('/page-not-found');
    }

}

async function secretPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
}
const verifyOtp = async function (req, res) {
    try {
        const { otp } = req.body;
        console.log(req.session.userOtp);
        console.log(otp);
        if (req.session.userOtp == otp) {
            const user = req.session.userData;
            const hashedPassword = await secretPassword(user.password);
            const newUser = new User({
                name: user.username,
                password: hashedPassword,
                email: user.email,
                phone: user.phone
            });
            await newUser.save();
            req.session.user = newUser;
            res.status(200).json({ success: true, message: "OTP Verifyied", redirectUrl: "/" });
        } else {
            res.status(400).json({ success: false, msg: "Invalid OTP" });
        }
    } catch (error) {
        console.log(`Error Veryfying OTP ${error}`);
        res.status(500).json({ success: false, mag: "An Error Occured"});
    }
}

const resendOtp = async function (req, res) {
    try {
        const { email, username } = req.session.userData;

        if (!email) {
            res.json({ success: false, msg: "Email not Found in the session" });
        }

        const otp = genarateOtp();

        const resendEmail = sendMailVerification(email, otp, username);

        if (resendEmail) {
            req.session.userOtp = otp;
            res.status(200).json({ success: true, msg: "email resend successfully" });
            console.log("Otp Resend", otp);

        } else {
            res.status(400).json({ success: false, msg: "Otp Not Send Invalid Email Address" });
            console.log("Otp Resinding unsuccessfull");
        }
    } catch (error) {
        res.status(400).json({ success: false, msg: "Server Not Found" });
        console.log("An error Occured", error);
    }
}

const loadLogin = async (req, res) => {
    try {
        if (!req.session.user && !req.user) {
            let msg = "";
            if (req.query.error === 'blocked') {
                msg = "Your account has been blocked by the administrator.";
            } else if (req.query.error === 'google_blocked') {
                msg = "User blocked by admin";
            }
            res.render('login', { msg: msg, success: null })
        } else {
            res.redirect('/');
        }
    } catch (error) {
        res.redirect('/page-not-found')
    }
}

const loginRegister = async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ isAdmin: 0, email: email });

        if (!findUser) {
            return res.render('login', { msg: "User Not Exists", success: null })
        }
        if (findUser.isBlocked) {
            return res.render('login', { msg: "User Blocked by Jaimon", success: null })
        }
        const comparePassword = await bcrypt.compare(password, findUser.password)
        if (!comparePassword) {
            return res.render('login', { msg: "Password Not Match", success: null });
        }

        req.session.user = findUser;
        res.redirect('/');
    } catch (error) {
        console.error('Login Error', error);
        res.redirect('/page-not-found');
    }
}
const logout = (req, res, next) => {
    try {
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
            req.session.destroy(function (err) {
                return next(err);
            })
            res.clearCookie('connect.sid');
            res.redirect('/login');
        })
    } catch (error) {

        console.log(error)
    }
}

const loadShopPage = async (req, res) => {
    try {

        res.render("shop")

    } catch (error) {

    }
}
async function sendForgotPasswordOtp(email, otp, name) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        const info = await transporter.sendMail({
            from: process.env.EMAIL_ADDRESS,
            to: email,
            subject: "Password Reset OTP",
            text: `Your password reset OTP is ${otp}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset OTP</h2>
                    <p>Hi <strong>${name}</strong>,</p>
                    <p>You requested to reset your password. Use the OTP below to proceed:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; display: inline-block;">
                            <h1 style="color: #d10024; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                        </div>
                    </div>
                    <p><strong>This OTP will expire in 10 minutes.</strong></p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">This email was sent by LapTique - Your Premium Laptop Store</p>
                </div>
            `
        });

        return info.accepted.length > 0;

    } catch (error) {
        console.log("Error sending forgot password OTP:", error);
        return false;
    }
}

const loadForgotPassword = async (req, res) => {
    try {
        if (req.session.user || req.user) {
            return res.redirect('/');
        }
        res.render('forgotPassword', { msg: null, success: null });
    } catch (error) {
        console.log('Error loading forgot password page:', error);
        res.redirect('/page-not-found');
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email, isAdmin: 0 });
        
    if (!user) {
            return res.render('forgotPassword', { 
                msg: "No account found with this email address", 
                success: null 
            });
        }

        if (user.isBlocked) {
            return res.render('forgotPassword', { 
                msg: "Your account has been blocked. Please contact support.", 
                success: null 
            });
        }


    const otp = genarateOtp();


        req.session.forgotPasswordOtp = otp;
        req.session.forgotPasswordEmail = email;
        req.session.forgotPasswordOtpExpiry = Date.now() + 600000; // 10 minutes


        const emailSent = await sendForgotPasswordOtp(email, otp, user.name);
        
        if (emailSent) {
            console.log(`Forgot Password OTP sent: ${otp}`); // For development
            res.render('forgotPasswordOtp');
        } else {
            res.render('forgotPassword', { 
                msg: "Failed to send OTP. Please try again later.", 
                success: null 
            });
        }

    } catch (error) {
        console.log('Error in forgot password:', error);
        res.render('forgotPassword', { 
            msg: "An error occurred. Please try again later.", 
            success: null 
        });
    }
}

const verifyForgotPasswordOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        
    if (!req.session.forgotPasswordOtp || !req.session.forgotPasswordEmail) {
            return res.status(400).json({ 
                success: false, 
                msg: "Session expired. Please start the process again." 
            });
        }
        if (Date.now() > req.session.forgotPasswordOtpExpiry) {
            return res.status(400).json({ 
                success: false, 
                msg: "OTP has expired. Please request a new one." 
            });
        }
    if (req.session.forgotPasswordOtp == otp) {
            req.session.forgotPasswordVerified = true;
            res.status(200).json({ 
                success: true, 
                message: "OTP verified successfully", 
                redirectUrl: "/reset-password-with-otp" 
            });
        } else {
            res.status(400).json({ 
                success: false, 
                msg: "Invalid OTP. Please try again." 
            });
        }

    } catch (error) {
        console.log('Error verifying forgot password OTP:', error);
        res.status(500).json({ 
            success: false, 
            msg: "An error occurred. Please try again." 
        });
    }
}

const resendForgotPasswordOtp = async (req, res) => {
    try {
        if (!req.session.forgotPasswordEmail) {
            return res.status(400).json({ 
                success: false, 
                msg: "Session expired. Please start the process again." 
            });
        }

        const email = req.session.forgotPasswordEmail;
        const user = await User.findOne({ email: email, isAdmin: 0 });

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                msg: "User not found." 
            });
        }
        const otp = genarateOtp();

        req.session.forgotPasswordOtp = otp;
        req.session.forgotPasswordOtpExpiry = Date.now() + 600000; // 10 minutes

        const emailSent = await sendForgotPasswordOtp(email, otp, user.name);

        if (emailSent) {
            console.log(`Forgot Password OTP resent: ${otp}`); // For development
            res.status(200).json({ 
                success: true, 
                msg: "OTP resent successfully" 
            });
        } else {
            res.status(400).json({ 
                success: false, 
                msg: "Failed to resend OTP. Please try again." 
            });
        }

    } catch (error) {
        console.log('Error resending forgot password OTP:', error);
        res.status(500).json({ 
            success: false, 
            msg: "An error occurred. Please try again." 
        });
    }
}

const loadResetPasswordWithOtp = async (req, res) => {
    try {
        // Check if user has verified OTP
        if (!req.session.forgotPasswordVerified || !req.session.forgotPasswordEmail) {
            return res.redirect('/forgot-password');
        }

        res.render('resetPassword', { 
            msg: null, 
            success: null 
        });

    } catch (error) {
        console.log('Error loading reset password page:', error);
        res.redirect('/page-not-found');
    }
}

const resetPasswordWithOtp = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;

        // Check if user has verified OTP
        if (!req.session.forgotPasswordVerified || !req.session.forgotPasswordEmail) {
            return res.render('resetPassword', { 
                msg: "Session expired. Please start the process again.", 
                success: null 
            });
        }
        if (password !== confirmPassword) {
            return res.render('resetPassword', { 
                msg: "Passwords do not match", 
                success: null 
            });
        }
        if (password.length < 8) {
            return res.render('resetPassword', { 
                msg: "Password must be at least 8 characters long", 
                success: null 
            });
        }

        const user = await User.findOne({ 
            email: req.session.forgotPasswordEmail, 
            isAdmin: 0 
        });

        if (!user) {
            return res.render('resetPassword', { 
                msg: "User not found.", 
                success: null 
            });
        }

        const hashedPassword = await secretPassword(password);

        user.password = hashedPassword;
        await user.save();

        delete req.session.forgotPasswordOtp;
        delete req.session.forgotPasswordEmail;
        delete req.session.forgotPasswordOtpExpiry;
        delete req.session.forgotPasswordVerified;

        res.render('login', { 
            msg: null,
            success: "Password has been reset successfully. Please login with your new password."
        });

    } catch (error) {
        console.log('Error resetting password:', error);
        res.render('resetPassword', { 
            msg: "An error occurred. Please try again later.", 
            success: null 
        });
    }
}

module.exports = {
    loadHomepage,
    pageNotFound,
    loadregisterPage,
    registration,
    verifyOtp,
    resendOtp,
    loadLogin,
    loginRegister,
    logout,
    loadShopPage,
    loadForgotPassword,
    forgotPassword,
    verifyForgotPasswordOtp,
    resendForgotPasswordOtp,
    loadResetPasswordWithOtp,
    resetPasswordWithOtp
}