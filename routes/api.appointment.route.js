/**
 * 		/api/appointment
 */

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');
const { isAuthenticated } = require('../utils/utils');


router.get('/:appointmentid', isAuthenticated, apiController.appointment.get);


module.exports = router;