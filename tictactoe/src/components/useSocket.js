import { useState, useEffect, useRef } from 'react';

const useSocket = (authSocket, isSocketInitialized) => {
    console.log('useSocket before useRef:', authSocket, isSocketInitialized);
    const [squares, setSquares] = useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);
    const [player, setPlayer] = useState(null);
    const [waiting, setWaiting] = useState(true);
    const [winner, setWinner] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [invites, setInvites] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);

    const socket = useRef(null);

    useEffect(() => {
        if (isSocketInitialized && authSocket) {
            socket.current = authSocket;
            console.log('Socket connected:', socket.current.id);

            socket.current.on('gameState', (game) => {
                console.log('Game state:', game);
                setSquares(game.squares);
                setXIsNext(game.xIsNext);
                setPlayer(game.players[0] === socket.current.id ? 'X' : 'O');
                setWaiting(!game.full);
                setWinner(game.winner);
                setGameOver(game.gameOver);
            });

            socket.current.on('updateLobby', (players) => {
                console.log('updateLobby event received:', players);
                setAvailablePlayers(players.filter(id => id !== socket.current.id));
            });

            socket.current.on('gameInvite', (invite) => {
                setInvites(prevInvites => [...prevInvites, invite]);
            });

            socket.current.on('roomJoined', (roomId) => {
                setCurrentRoom(roomId);
            });

            return () => {
                if (socket.current) {
                    socket.current.off('gameState');
                    socket.current.off('updateLobby');
                    socket.current.off('gameInvite');
                    socket.current.off('roomJoined');
                }
            };
        }
    }, [authSocket, isSocketInitialized]);

    const handleClick = (i) => {
        if (currentRoom && !waiting && !gameOver && squares[i] === null && ((xIsNext && player === 'X') || (!xIsNext && player === 'O'))) {
            socket.current.emit('makeMove', { roomId: currentRoom, index: i });
        }
    };

    const handleRestart = () => {
        if (currentRoom) {
            socket.current.emit('restartGame', currentRoom);
            setWinner(null);
            setGameOver(false);
        }
    };

    const handleInvite = (playerId) => {
        console.log('Invite player:', playerId);
        socket.current.emit('searchPlayer', playerId);
    };

    const handleAcceptInvite = (invite) => {
        console.log('Accept invite:', invite);

        setCurrentRoom(invite.roomId);
        socket.current.emit('acceptInvite', invite.roomId);
        setInvites(invites.filter(i => i.roomId !== invite.roomId));
    };

    const status = winner ? `Winner: ${winner}` :
                  gameOver ? 'Game Over: Draw' :
                  waiting ? 'Waiting for another player...' :
                  `Next player: ${xIsNext ? 'X' : 'O'}`;

    return {
        squares, xIsNext, player, waiting, winner, gameOver, availablePlayers, invites, currentRoom,
        handleClick, handleRestart, handleInvite, handleAcceptInvite, status
    };
};

export default useSocket;
