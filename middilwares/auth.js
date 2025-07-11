const User = require('../models/userSchema');

const userAuth = async (req, res, next) => {
    if (req.session.user) {
        User.findById(req.session.user)
            .then(data => {
                if (data && !data.isBlocked) {
                    next();
                } else {
                    return res.redirect('/login');
                }
            })
            .catch(data => {
                console.log("An Error Occured on the userAuth Middilware");
                return res.status(500).send("Internal Server Error");
            })
    } else {
        res.redirect('/login');
    }
}

const adminAuth = async (req, res, next) => {
    if (req.session.admin) {
        next();
    } else {
        return res.redirect('/admin/login');
    }
}

module.exports = {
    userAuth,
    adminAuth
}