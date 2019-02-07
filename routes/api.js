const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api');

/* GET home page. */
router.get('/status', apiController.status);

module.exports = router;