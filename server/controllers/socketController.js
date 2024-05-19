const db = require('../db/database');

function socketController(io) {
    let count = 0;
    let games = {};
    let availablePlayers = new Map(); // Map to store socket IDs and usernames

    function calculateWinner(squares) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let line of lines) {
            const [a, b, c] = line;
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    }

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('register', (username) => {
            console.log('Register event received:', socket.id, 'Username:', username);
            if (!availablePlayers.has(socket.id)) {
                count++;
                availablePlayers.set(socket.id, username);
                console.log('Number of clients connected:', count);
            }

            // Emit updateLobby to the newly connected client excluding the current player
            socket.emit('updateLobby', Array.from(availablePlayers.values()).filter(player => player !== username));

            // Emit updateLobby to all other clients excluding the newly connected client
            socket.broadcast.emit('updateLobby', Array.from(availablePlayers.values()));

            console.log('Emitted available players:', Array.from(availablePlayers.values()));
        });

        socket.on('searchPlayer', (username) => {
            const playerSocketId = Array.from(availablePlayers.entries()).find(([id, name]) => name === username)?.[0];
            if (playerSocketId) {
                const room = `${socket.id}-${playerSocketId}`;
                socket.join(room);
                console.log(`Player ${availablePlayers.get(socket.id)} invited ${username} to room ${room}`);
                io.to(playerSocketId).emit('gameInvite', { roomId: room, from: availablePlayers.get(socket.id) });
            }
        });

        socket.on('acceptInvite', (roomId) => {
            socket.join(roomId);
            const players = [...io.sockets.adapter.rooms.get(roomId)];
            console.log(`Player ${availablePlayers.get(socket.id)} accepted invite to room ${roomId}`);

            if (!games[roomId]) {
                games[roomId] = {
                    players: players,
                    squares: Array(9).fill(null),
                    xIsNext: true,
                    full: true
                };
            } else {
                games[roomId].players = players;
                games[roomId].full = true;
            }

            io.to(roomId).emit('gameState', games[roomId]);
            players.forEach(playerId => io.to(playerId).emit('roomJoined', roomId));
            io.emit('updateLobby', Array.from(availablePlayers.values()).filter(username => !players.includes(username)));
        });

        socket.on('makeMove', ({ roomId, index }) => {
            console.log(`Player ${availablePlayers.get(socket.id)} made move ${index} in room ${roomId}`);
            const game = games[roomId];
            if (game && game.full && game.squares[index] === null && game.players[game.xIsNext ? 0 : 1] === socket.id) {
                game.squares[index] = game.xIsNext ? 'X' : 'O';
                game.xIsNext = !game.xIsNext;
                const winner = calculateWinner(game.squares);
                if (winner || game.squares.every(square => square !== null)) {
                    game.winner = winner;
                    game.gameOver = true;
                }
                console.log(`Game state updated for room ${roomId}`, game);
                io.to(roomId).emit('gameState', game);
            } else {
                console.log(`Invalid move attempted by ${availablePlayers.get(socket.id)} in room ${roomId}`);
            }
        });

        socket.on('restartGame', (roomId) => {
            const game = games[roomId];
            if (game && game.players.includes(socket.id)) {
                game.squares = Array(9).fill(null);
                game.xIsNext = true;
                game.gameOver = false;
                game.winner = null;
                io.to(roomId).emit('gameState', game);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id, 'Username:', availablePlayers.get(socket.id));
            availablePlayers.delete(socket.id);
            io.emit('updateLobby', Array.from(availablePlayers.values()));
            for (const room in games) {
                const game = games[room];
                if (game.players.includes(socket.id)) {
                    game.players = game.players.filter(id => id !== socket.id);
                    if (game.players.length === 0) {
                        delete games[room];
                    }
                }
                socket.leave(room);
            }
            count--;
            console.log('Number of clients connected:', count);
        });
    });
}

module.exports = socketController;
