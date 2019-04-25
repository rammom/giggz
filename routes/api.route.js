/**
 * 		/api
 */

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');
const passport = require('passport');

/* GET */
router.get('/status', apiController.index.status);
router.get('/authenticated', passport.authenticate('jwt-user'), apiController.index.authenticated)

module.exports = router;