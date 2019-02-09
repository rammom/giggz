/**
 * 		/api
 */

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');
const { isAuthenticated } = require('../utils/utils');

/* GET */
router.get('/status', apiController.index.status);
router.get('/authenticated', isAuthenticated, apiController.index.authenticated)

module.exports = router;