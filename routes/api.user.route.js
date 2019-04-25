/**
 * 		/api/user
 */
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');
const passport = require('passport');

router.get('/', passport.authenticate('jwt-user'), apiController.user.getAuthenticatedUser);
router.get('/getDetailedUser', passport.authenticate('jwt-user'), apiController.user.getDetailedUser);

module.exports = router;