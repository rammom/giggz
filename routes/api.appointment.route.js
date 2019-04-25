/**
 * 		/api/appointment
 */

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');
const passport = require('passport');


router.get('/:appointmentid', passport.authenticate('jwt-user'), apiController.appointment.get);


module.exports = router;