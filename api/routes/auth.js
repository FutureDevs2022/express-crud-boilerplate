const express = require('express');
const router = express.Router();
const Auth = require('../middlewares/auth');

// controller
const GuardController = require("../controllers/user/guard");

// ******* AUTH ROUTES ******** //
// admin registers new admin user
router.post('/register', GuardController.user_sign_up);

// login
router.post('/login', GuardController.user_login);

module.exports = router;