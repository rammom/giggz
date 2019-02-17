/**
 * 		/api/employee
 */

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');

router.put('/availability', apiController.employee.availability.update);


module.exports = router;