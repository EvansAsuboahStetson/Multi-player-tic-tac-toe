const express = require('express');
const userController = require('../controllers/userControllers');

const router = express.Router();

// Register a new user
router.post('/register', userController.register);

// Check username availability
router.get('/checkUsername', userController.checkUsername);

// Login a user
router.post('/login', userController.login);

module.exports = router;
