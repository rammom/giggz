/**
 * 		/api/store
 */
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');

router.post('/', apiController.store.create);
router.post('/addemployee', apiController.store.addEmployee);

module.exports = router;