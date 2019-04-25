/**
 * 		/api/employee
 */

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');
const { isAuthenticated } = require('../utils/utils');

router.get('/', isAuthenticated, apiController.employee.get);

router.put('/availability', isAuthenticated, apiController.employee.availability.update);
router.get('/availability', isAuthenticated, apiController.employee.availability.get);

router.post('/service', isAuthenticated, apiController.employee.service.add);
router.get('/service', apiController.employee.service.get);
router.delete('/service', isAuthenticated, apiController.employee.service.delete);

router.post('/appointment', isAuthenticated, apiController.employee.appointment.add);
router.put('/appointment', isAuthenticated, apiController.employee.appointment.update);
router.get('/appointment',apiController.employee.appointment.get);
module.exports = router;