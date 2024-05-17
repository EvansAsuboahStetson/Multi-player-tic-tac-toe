const userService = require('../services/userServices');

// Register a new user
function register(req, res) {
    const { email, username, password } = req.body;
    userService.registerUser(email, username, password, (err, user) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        res.status(201).send(user);
    });
}

// Check username availability
function checkUsername(req, res) {
    const { username } = req.query;
    userService.checkUsernameAvailability(username, (err, isAvailable) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        res.status(200).send({ available: isAvailable });
    });
}

// Login a user
function login(req, res) {
    const { email, password } = req.body;
    userService.loginUser(email, password, (err, user) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!user) {
            return res.status(401).send({ error: 'Invalid email or password' });
        }
        res.status(200).send(user);
    });
}

module.exports = {
    register,
    checkUsername,
    login
};
