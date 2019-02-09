/**
 * 		/api/store
 */
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');
const { isAuthenticated } = require('../utils/utils');

router.post('/', isAuthenticated, apiController.store.create);


module.exports = router;