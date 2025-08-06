
const User = require('../../models/userSchema');
const Order = require('../../models/orderSchema');
const loadProfile = async (req, res) => {
    try {
        let { _id } = req.session.user || req.user
        const userData = await User.findById(_id);

        if (!userData) {
            return res.status(404).render('pageNotFound');
        }

        const totalOrders = await Order.countDocuments({ userId: _id });

        res.render('userProfile', {

            user: userData,
            totalOrders

        })
    } catch (error) {

    }
}

const loadEditProfile = async (req, res) => {
    try {

        let { _id } = req.session.user || req.user
        const userData = await User.findById(_id);
        const dateOfBirth = userData.dateOfBirth ? new Date(userData.dateOfBirth) : null;
        
        res.render('editProfile',{ user: userData,dateOfBirth });
    } catch (error) {

    }
}

const editprofile = async (req, res) => {
    try {
        const { _id } = req.session.user || req.user;
        const userId = _id;
        const { firstName, email, phone, dateOfBirth, gender } = req.body;

        if (!firstName || !email || !phone || !dateOfBirth || !gender) {
            console.log("required fields are empty");
            return res.status(400).json({ status: false, message: "Please Fill All Required Fields" });
        }
        const isHasemail = await User.findOne({ email });
        if (isHasemail) {
            return res.status(400).json({ status: false, message: "Email Already Exists" });
        }
        const user = await User.findByIdAndUpdate(userId, {
            name: firstName,
            email: email,
            phone: phone,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender: gender
        })

    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    loadProfile,
    loadEditProfile,
    editprofile
}