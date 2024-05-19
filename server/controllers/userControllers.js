const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../services/userServices');
const { SECRET_KEY } = require('../config/config');

// Register a new user
function register(req, res) {
    const { email, username, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send({ error: err.message });
        }

        userService.registerUser(email, username, hash, (err, user) => {
            if (err) {
                console.error('Error registering user:', err);
                return res.status(500).send({ error: err.message });
            }
            const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
            console.log('User registered:', user, "token:", token);
            res.status(200).send({ user, token });
        });
    });
}

// Check username availability
function checkUsername(req, res) {
    const { username } = req.query;
    userService.checkUsernameAvailability(username, (err, isAvailable) => {
        if (err) {
            console.error('Error checking username availability:', err);
            return res.status(500).send({ error: err.message });
        }
        res.status(200).send({ available: isAvailable });
    });
}

// Login a user
function login(req, res) {
    const { email, password } = req.body;
    console.log('Login request:', email, password);
    userService.loginUser(email, (err, user) => {
        if (err) {
            console.error('Error fetching user for login:', err);
            return res.status(500).send({ error: err.message });
        }
        if (!user) {
            return res.status(401).send({ error: 'Invalid email or password' });
        }

        console.log('Fetched user:', user);

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).send({ error: err.message });
            }
            if (!result) {
                return res.status(401).send({ error: 'Invalid email or password' });
            }

            const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
            console.log('User logged in:', user, "token:", token);
            res.status(200).send({ user, token });
        });
    });
}

// Validate token
function validateToken(req, res) {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: 'Invalid token' });
        }
        userService.getUserById(decoded.id, (err, user) => {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
            res.status(200).send({ user });
        });
    });
}

module.exports = {
    register,
    checkUsername,
    login,
    validateToken
};
