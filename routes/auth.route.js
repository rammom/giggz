/*
	/auth
*/
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const passport = require('passport');
const { isAuthenticated, isDevelopment } = require('../utils/utils');

router.post('/register', authController.register);
router.post('/login', passport.authenticate('local'), authController.login);

router.get('/logout', isAuthenticated, authController.logout);


/*
		DEVELOPMENT
*/
router.delete('/register', isDevelopment, authController.deleteUser);

module.exports = router;