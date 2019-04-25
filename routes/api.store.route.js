/**
 * 		/api/store
 */
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');
const passport = require('passport');

router.post('/', passport.authenticate('jwt-user'), apiController.store.create);
router.get('/bunch', apiController.store.getBunch);
router.get('/:slug', apiController.store.getBySlug);

router.post('/employee', passport.authenticate('jwt-employee'), apiController.store.employee.add);

router.post('/service', passport.authenticate('jwt-employee'), apiController.store.service.add);
router.get('/service', passport.authenticate('jwt-user'), apiController.store.service.get);
router.delete('/service', passport.authenticate('jwt-employee'), apiController.store.service.delete);

module.exports = router;