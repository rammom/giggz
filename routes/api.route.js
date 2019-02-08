/**
 * 		/api
 */

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');

/* GET */
router.get('/status', apiController.index.status);

module.exports = router;