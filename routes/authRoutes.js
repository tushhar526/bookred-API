const express = require('express');
const router = express.Router();
const passport = require("passport");
const auth = require('../controllers/authcontrollers');

router.post('/userExits',auth.checkUserExists);

router.post('/signIn',auth.signinuser)

router.post('/login', auth.loginUser);

router.post('/reset-password',auth.resetPassword);

// router.post('/forgetPassword',auth.forgotPassword);

module.exports = router;
