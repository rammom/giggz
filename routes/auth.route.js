/*
	/auth
*/
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const passport = require('passport');
const { isAuthenticated } = require('../utils/utils');

router.post('/register', authController.register);
router.post('/login', passport.authenticate('local'), authController.login);

router.get('/logout', isAuthenticated, authController.logout);

module.exports = router;