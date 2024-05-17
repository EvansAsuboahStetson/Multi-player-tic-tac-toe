const express = require('express');
const scoreController = require('../controllers/scoreController');

const router = express.Router();

router.post('/addScore', scoreController.addScore);
router.get('/getScores/:userId', scoreController.getScores);

module.exports = router;
