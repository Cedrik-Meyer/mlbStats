const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.get('/schedule', teamController.getSchedule);
router.get('/stats', teamController.getStats);

module.exports = router;