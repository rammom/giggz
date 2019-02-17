/**
 * 		/api/store
 */
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');
const { isAuthenticated } = require('../utils/utils');

router.post('/', isAuthenticated, apiController.store.create);
router.post('/employee', isAuthenticated, apiController.store.employee.add);

module.exports = router;