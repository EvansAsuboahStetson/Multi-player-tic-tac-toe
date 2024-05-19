import { useState, useEffect } from 'react';
import { useAuth } from '../context/authenticated';

const useSocket = (initialSocket, isSocketInitialized) => {
    const [squares, setSquares] = useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);
    const [player, setPlayer] = useState(null);
    const [waiting, setWaiting] = useState(true);
    const [winner, setWinner] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [invites, setInvites] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const socketRef = initialSocket;
    const { user } = useAuth();

    useEffect(() => {
        if (!isSocketInitialized) {
            return;
        }

        if (socketRef && !socketRef.connected) {
            socketRef.connect();
        }

        socketRef.on('gameState', (game) => {
            setSquares(game.squares);
            setXIsNext(game.xIsNext);
            setPlayer(game.players[0] === socketRef.id ? 'X' : 'O');
            setWaiting(!game.full);
            setWinner(game.winner);
            setGameOver(game.gameOver);
        });

        socketRef.on('updateLobby', (players) => {
            setAvailablePlayers(players.filter(player => player !== user.username));
        });

        socketRef.on('gameInvite', (invite) => {
            setInvites(prevInvites => [...prevInvites, invite]);
        });

        socketRef.on('roomJoined', (roomId) => {
            setCurrentRoom(roomId);
        });

        return () => {
            if (socketRef) {
                socketRef.off('gameState');
                socketRef.off('updateLobby');
                socketRef.off('gameInvite');
                socketRef.off('roomJoined');
            }
        };
    }, [socketRef, isSocketInitialized, user]);

    const handleClick = (i) => {
        if (currentRoom && !waiting && !gameOver && squares[i] === null && ((xIsNext && player === 'X') || (!xIsNext && player === 'O'))) {
            socketRef.emit('makeMove', { roomId: currentRoom, index: i });
        }
    };

    const handleRestart = () => {
        if (currentRoom) {
            socketRef.emit('restartGame', currentRoom);
            setWinner(null);
            setGameOver(false);
        }
    };

    const handleInvite = (playerId) => {
        socketRef.emit('searchPlayer', playerId);
    };

    const handleAcceptInvite = (invite) => {
        setCurrentRoom(invite.roomId);
        socketRef.emit('acceptInvite', invite.roomId);
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
