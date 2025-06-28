const express = require('express');
const userController = require('../../controllers/user/userController');
const router = express.Router();


router.get('/',userController.loadHomepage);
router.get('/page-not-found',userController.pageNotFound);

module.exports = router;