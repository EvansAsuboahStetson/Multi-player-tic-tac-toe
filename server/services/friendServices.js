const db = require('../db/database');

// Add a new user
function addFriend(userId, friendId, callback) {
    const query = `INSERT INTO friends (user_id, friend_id) VALUES (?, ?)`;
    db.run(query, [userId, friendId], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null);
    });
}

// Get friends of a user
function getFriends(userId, callback) {
    const query = `SELECT u.* FROM users u JOIN friends f ON u.id = f.friend_id WHERE f.user_id = ?`;
    db.all(query, [userId], (err, rows) => {
        if (err) {
            return callback(err);
        }
        callback(null, rows);
    });
}

module.exports = {
    addFriend,
    getFriends
};
