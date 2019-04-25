/**
 * 		/api/user
 */
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');
const passport = require('passport');

router.get('/', passport.authenticate('jwt-user'), apiController.user.getAuthenticatedUser);

module.exports = router;