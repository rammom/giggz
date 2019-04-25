/**
 * 		/api/appointment
 */

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');
const passport = require('passport');


router.get('/getUserAppointments', passport.authenticate('jwt-user'), apiController.appointment.getUserAppointments);
router.get('/:appointmentid', passport.authenticate('jwt-user'), apiController.appointment.get);

router.delete('/:appointmentid', passport.authenticate('jwt-user'), apiController.appointment.delete);

module.exports = router;