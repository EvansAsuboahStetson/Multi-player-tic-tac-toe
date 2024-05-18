function socketController(io) {
    let count = 0;
    let games = {};
    let availablePlayers = [];

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
        count++;
        console.log('Number of clients connected:', count);
        console.log('New client connected:', socket.id);

        availablePlayers.push(socket.id);
        io.emit('updateLobby', availablePlayers);  // Ensure this is emitted correctly
        console.log('emitted Available players:', availablePlayers);

        socket.on('searchPlayer', (playerId) => {
            if (availablePlayers.includes(playerId)) {
                const room = `${socket.id}-${playerId}`;
                socket.join(room);
                console.log(`Player ${socket.id} invited ${playerId} to room ${room}`);
                io.to(playerId).emit('gameInvite', { roomId: room, from: socket.id });
            }
        });

        socket.on('acceptInvite', (roomId) => {
            socket.join(roomId);
            const players = [...io.sockets.adapter.rooms.get(roomId)];
            console.log(`Player ${socket.id} accepted invite to room ${roomId}`);

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
            io.emit('updateLobby', availablePlayers.filter(id => !players.includes(id)));
        });

        socket.on('makeMove', ({ roomId, index }) => {
            console.log(`Player ${socket.id} made move ${index} in room ${roomId}`);
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
                console.log(`Invalid move attempted by ${socket.id} in room ${roomId}`);
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
            console.log('Client disconnected:', socket.id);
            availablePlayers = availablePlayers.filter(id => id !== socket.id);
            io.emit('updateLobby', availablePlayers);
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
