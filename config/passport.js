const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userSchema');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},

    async (accessToken, refreshToken, profile, done) => {
        try {
            user = await User.findOne({ googleId: profile.id });
            if (user) {
                // Check if user is blocked
                if (user.isBlocked) {
                    return done(null, false, { message: 'Your account has been blocked by the administrator.' });
                }
                return done(null, user)
            } else {

                user = await User.findOne({ email: profile.emails[0].value });
                if (user) {
                    // Check if user is blocked
                    if (user.isBlocked) {
                        return done(null, false, { message: 'Your account has been blocked by the administrator.' });
                    }
                    user.googleId = profile.id;
                    await user.save();
                    return done(null, user);
                } else {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id
                    });
                    await user.save();
                    return done(null, user);
                }
            }

        } catch (error) {
            return done(error, null)
        }
    }
))

passport.serializeUser((user, done) => {

    done(null, user.id)

})

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err, null);
        })
})

module.exports = passport