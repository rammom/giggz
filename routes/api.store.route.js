/**
 * 		/api/store
 */
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');

router.post('/', apiController.store.create);


module.exports = router;