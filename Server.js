require('dotenv').config();
const express = require('express');
const router = require('./Router/UserRoutes');
const app = express();
const {dbConnect} = require('./config/db');

dbConnect();



const PORT = process.env.PORT || 3003;

app.listen(PORT,()=>{
    console.log(`Server Running at http://localhost:${PORT}`);
});