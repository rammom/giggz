/**
 * 		/api/employee
 */

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');

/* POST REQUEST*/
router.post('/add', apiController.employee.create);
//router.post('/update', apiController.employee.create);
module.exports = router;