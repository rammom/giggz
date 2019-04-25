/**
 * 		/api/employee
 */

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');
const passport = require('passport');

router.get('/', passport.authenticate('jwt-employee'), apiController.employee.get);

router.put('/availability', passport.authenticate('jwt-employee'), apiController.employee.availability.update);
router.get('/availability', passport.authenticate('jwt-user'), apiController.employee.availability.get);

router.post('/service', passport.authenticate('jwt-employee'), apiController.employee.service.add);
router.get('/service', apiController.employee.service.get);
router.delete('/service', passport.authenticate('jwt-employee'), apiController.employee.service.delete);

router.post('/appointment', passport.authenticate('jwt-user'), apiController.employee.appointment.add);
router.put('/appointment', passport.authenticate('jwt-user'), apiController.employee.appointment.update);
router.get('/appointment', apiController.employee.appointment.get);
module.exports = router;