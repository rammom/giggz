/**
 * 		/api/employee
 */

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');

router.put('/availability', apiController.employee.availability.update);
router.get('/availability',apiController.employee.availability.get);

router.post('/service',apiController.employee.service.add);
router.get('/service',apiController.employee.service.get);
router.delete('/service',apiController.employee.service.delete);

router.post('/appointment',apiController.employee.appointment.add);
router.put('/appointment',apiController.employee.appointment.update);
router.get('/appointment',apiController.employee.appointment.get);
module.exports = router;