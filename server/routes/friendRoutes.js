const express = require('express');
const friendController = require('../controllers/friendControllers');

const router = express.Router();

router.post('/addFriend', friendController.addFriend);

module.exports = router;
