/*
	/auth
*/
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const passport = require('passport');
const { isAuthenticated } = require('../utils/utils');

router.post('/register', authController.register);
router.post('/login', passport.authenticate('user-local'), authController.login);
router.post('/employee-login', passport.authenticate('employee-local'), authController.login);

router.post('/checkAuthentication', passport.authenticate('user-local'), authController.checkAuthentication);

router.get('/logout', isAuthenticated, authController.logout);

module.exports = router;