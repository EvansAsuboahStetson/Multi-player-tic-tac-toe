const db = require('../db/database');
const bcrypt = require('bcrypt');

// Add a new user (registration)
function registerUser(email, username, password, callback) {
    // Hash the password before storing it
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return callback(err);
        }
        const query = `INSERT INTO users (email, username, password) VALUES (?, ?, ?)`;
        db.run(query, [email, username, hash], function(err) {
            if (err) {
                return callback(err);
            }
            callback(null, { id: this.lastID });
        });
    });
}


function checkUsernameAvailability(username, callback) {
    const query = `SELECT * FROM users WHERE username = ?`;
    db.get(query, [username], (err, user) => {
        if (err) {
            return callback(err);
        }
        callback(null, !user); // If user is null, username is available
    });
}

// Authenticate a user (login)
function loginUser(email, password, callback) {
    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], (err, user) => {
        if (err) {
            return callback(err);
        }
        if (!user) {
            return callback(null, false); // User not found
        }
        // Compare the hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return callback(err);
            }
            if (isMatch) {
                callback(null, user); // Password matches
            } else {
                callback(null, false); // Password does not match
            }
        });
    });
}

module.exports = {
    registerUser,
    checkUsernameAvailability,
    loginUser
};
