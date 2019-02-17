/**
 * 		/api/user
 */
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');
const { isAuthenticated } = require('../utils/utils');

router.get('/', isAuthenticated, apiController.user.getAuthenticatedUser);

module.exports = router;