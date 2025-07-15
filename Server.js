require('dotenv').config();
const express = require('express');
const path = require('path');
const router = require('./Router/userRoutes/userRoute');
const adminRouter = require('./Router/adminRoutes/adminRoute')
const app = express();
const session = require('express-session');
const passport = require('./config/passport');
const { dbConnect } = require('./config/db');
const MongoStore = require('connect-mongo');
const nocache = require('nocache');


dbConnect();
app.use(nocache());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000
    }
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, 'views/users'), path.join(__dirname, 'views/admin')]);
app.use(express.static(path.join(__dirname, "public")));

app.use('/', router);
app.use('/admin',adminRouter);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`Server Running at http://localhost:${PORT}`);
});