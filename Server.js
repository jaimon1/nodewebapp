require('dotenv').config();
const express = require('express');
const path = require('path');
const router = require('./Router/userRoutes/userRoute');
const app = express();
const { dbConnect } = require('./config/db');

dbConnect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, 'views/users'), path.join(__dirname, 'views/admin')]);
app.use(express.static(path.join(__dirname, "public")));

app.use('/', router);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`Server Running at http://localhost:${PORT}`);
});