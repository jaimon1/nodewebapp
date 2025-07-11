const User = require('../../models/userSchema');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const loadLogin = (req, res) => {
    if (req.session.admin) {
        res.redirect('/admin');
    } else {
        res.render('adminLogin', { msg: null });
    }
}

const registerLogin = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, isAdmin: true });
        if (user) {
            const comparePassword = await bcrypt.compare(password, user.password);
            if (comparePassword) {
                req.session.admin = user._id;
                return res.redirect('/admin');
            } else {
                return res.redirect('/admin/login');
            }
        } else {
            return res.redirect('/admin/login');
        }
    } catch (error) {
        console.log(error);
        res.redirect('/pageError');
    }
}

const dashboard = (req, res) => {
    try {
        if (req.session.admin) {
            return res.render('dashboard');
        }
        return res.redirect('/admin/login');
    } catch (error) {
        res.redirect('/pageError');

    }
}

const pageError = (req, res) => {
    res.render('pageNotFound')
}

const logoutPage = (req, res) => {
    try {
        req.session.destroy(err => {
            if (err && err) {
                console.log(" An Error Occured While Logout");
                console.log(err);
                return res.redirect("pageError")
            }
            res.redirect('/admin/login');
        })
    } catch (error) {
        res.redirect('/pageError')
    }
}
module.exports = {
    loadLogin,
    registerLogin,
    dashboard,
    pageError,
    logoutPage
}
