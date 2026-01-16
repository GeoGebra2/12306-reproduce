const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot/check-user', userController.checkUserExists);
router.post('/forgot/verify-code', userController.verifyCode);
router.post('/forgot/reset-password', userController.resetPassword);


module.exports = router;
