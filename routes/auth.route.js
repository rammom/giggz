/*
	/auth
*/
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const passport = require('passport');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/employee-login', authController.employee_login);


//router.get('/logout', isAuthenticated, authController.logout);

module.exports = router;


//passport.authenticate('jwt-user', { session: false })