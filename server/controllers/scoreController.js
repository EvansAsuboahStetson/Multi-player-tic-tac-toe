const scoreService = require('../services/scoreServices');

function addScore(req, res) {
    const { userId, opponentId, score, gameDate } = req.body;
    scoreService.addScore(userId, opponentId, score, gameDate, (err) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        res.status(201).send({ message: 'Score added successfully' });
    });
}

function getScores(req, res) {
    const userId = req.params.userId;
    scoreService.getScores(userId, (err, scores) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        res.status(200).send(scores);
    });
}

module.exports = {
    addScore,
    getScores
};
