const express = require('express');
const router = express.Router();
const auth = require('../controllers/authcontrollers');

router.post('/userExits',auth.checkUserExists);

router.post('/signIn',auth.signinuser)

router.post('/login', auth.loginUser);

router.post('/reset-password',auth.resetPassword);

module.exports = router;
