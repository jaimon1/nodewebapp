const User = require('../../models/userSchema');
const Product = require('../../models/productSchema');
const nodemailer = require('nodemailer');
const Brand = require('../../models/brandSchema');
const Category = require('../../models/categorySchema');
require('dotenv').config();
const bcrypt = require('bcrypt');
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
        const limit = 6
        const skip = (page - 1) * limit;
        const existsProducts = await Product.find({
            isBlocked: false,
            category:{$in:categoryData.map(category=>category._id)},quantity:{$gt:0}
        }).skip(skip).limit(limit).sort({ createdAt: -1 });

        if(!existsProducts || existsProducts.length === 0 ){
            console.log("No More Product Available");
        }

        const totalCount = await Product.countDocuments({
            isBlocked: false,
            $or: [{ productName: { $regex: ".*" + search + ".*", $options: "i" } }]
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
        console.log(`Error Veryfying OTP ${error} `);
        res.status(500).json({ success: false, mag: "An Error Occured" });
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
            res.render('login', { msg: "" })
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
            return res.render('login', { msg: "User Not Exists" })
        }
        if (findUser.isBlocked) {
            return res.render('login', { msg: "User Blocked by Jaimon" })
        }
        const comparePassword = await bcrypt.compare(password, findUser.password)
        if (!comparePassword) {
            return res.render('login', { msg: "Password Not Match" });
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
    loadShopPage
}