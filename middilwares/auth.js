const User = require('../models/userSchema');

const userAuth = async (req, res, next) => {
    try {
        let userId = null;
        if (req.session.user) {
            userId = req.session.user._id || req.session.user;
        }
        else if (req.user) {
            userId = req.user._id;
        }

        if (userId) {
            const user = await User.findById(userId);
            if (user && !user.isBlocked) {
                next();
            } else {
                req.session.destroy((err) => {
                    if (err) {
                        console.log("Error destroying session:", err);
                    }
                });
                res.clearCookie('connect.sid');
                if (user && user.googleId) {
                    return res.redirect('/login?error=google_blocked');
                } else {
                    return res.redirect('/login?error=blocked');
                }
            }
        } else {
            res.redirect('/login');
        }
        if(req.session.admin){
            next();
        }
    } catch (error) {
        console.log("An Error Occurred in the userAuth Middleware:", error);
        return res.status(500).send("Internal Server Error");
    }
}

const adminAuth = async (req, res, next) => {
    if (req.session.admin) {
        next();
    } else {
        return res.redirect('/admin/login');
    }
}

const checkUserBlocked = async (req, res, next) => {
    try {
        let userId = null;

        if (req.session.user) {
            userId = req.session.user._id || req.session.user;
        }

        else if (req.user) {
            userId = req.user._id;
        }

        if (userId) {
            const user = await User.findById(userId);
            if (user && user.isBlocked) {

                req.session.destroy((err) => {
                    if (err) {
                        console.log("Error destroying session:", err);
                    }
                });
                res.clearCookie('connect.sid');
                if (user.googleId) {
                    return res.redirect('/login?error=google_blocked');
                } else {
                    return res.redirect('/login?error=blocked');
                }
            }
        }

        next();
    } catch (error) {
        console.log("An Error Occurred in the checkUserBlocked Middleware:", error);
        next();
    }
}


const errorHandler = (err, req, res, next) => {
    console.error(" Error:", err.stack || err);

    // Customize based on environment
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};



module.exports = {
    userAuth,
    adminAuth,
    checkUserBlocked,
    errorHandler
}