const express = require('express');
const router = express.Router()
const adminController = require('../../controllers/admin/adminControl');
const { adminAuth, userAuth } = require('../../middilwares/auth')
const nocache = require('nocache')


router.use(nocache())
router.get('/pageError', adminController.pageError)
router.get('/login', adminController.loadLogin);
router.post('/login', adminController.registerLogin);
router.get('/',adminAuth, adminController.dashboard);
router.get('/logout',adminController.logoutPage);

module.exports = router