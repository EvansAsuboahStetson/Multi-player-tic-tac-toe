const friendService = require('../services/friendServices');

function addFriend(req, res) {
    const { userId, friendId } = req.body;
    friendService.addFriend(userId, friendId, (err) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        res.status(201).send({ message: 'Friend added successfully' });
    });
}

module.exports = {
    addFriend
};
