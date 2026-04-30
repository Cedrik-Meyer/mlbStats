const express = require('express');
const router = express.Router();
const standingsController = require('../controllers/standingsController');

router.get('/', standingsController.getStandings);

module.exports = router;