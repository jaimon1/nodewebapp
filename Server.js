require('dotenv').config();
const express = require('express');
const path = require('path');
const router = require('./Router/userRoutes/userRoute');
const app = express();
const session = require('express-session');
const { dbConnect } = require('./config/db');

dbConnect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000
    }
}))
app.use((req, res, next) => {
    res.set('cache-control', 'no-store');
    next();
})
app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, 'views/users'), path.join(__dirname, 'views/admin')]);
app.use(express.static(path.join(__dirname, "public")));

app.use('/', router);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`Server Running at http://localhost:${PORT}`);
});