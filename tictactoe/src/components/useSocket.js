import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const useSocket = () => {
    let count = 0;
    const [squares, setSquares] = useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);
    const [player, setPlayer] = useState(null);
    const [waiting, setWaiting] = useState(true);
    const [winner, setWinner] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [invites, setInvites] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);

    const socketRef = useRef();

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io('http://localhost:4000');

            socketRef.current.on('gameState', (game) => {
                setSquares(game.squares);
                setXIsNext(game.xIsNext);
                setPlayer(game.players[0] === socketRef.current.id ? 'X' : 'O');
                setWaiting(!game.full);
                setWinner(game.winner);
                setGameOver(game.gameOver);
            });
            

            socketRef.current.on('updateLobby', (players) => {
                console.log('updateLobby called :', count);
                count++;
                console.log('Update lobby:', players);
                console.log('updateLobby called :', count);
                setAvailablePlayers(players.filter(id => id !== socketRef.current.id));
            });

            socketRef.current.on('gameInvite', (invite) => {
                setInvites(prevInvites => [...prevInvites, invite]);
            });

            socketRef.current.on('roomJoined', (roomId) => {
                setCurrentRoom(roomId);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const handleClick = (i) => {
        if (currentRoom && !waiting && !gameOver && squares[i] === null && ((xIsNext && player === 'X') || (!xIsNext && player === 'O'))) {
            socketRef.current.emit('makeMove', { roomId: currentRoom, index: i });
        }
    };

    const handleRestart = () => {
        if (currentRoom) {
            socketRef.current.emit('restartGame', currentRoom);
            setWinner(null);
            setGameOver(false);
        }
    };

    const handleInvite = (playerId) => {
        socketRef.current.emit('searchPlayer', playerId);
    };

    const handleAcceptInvite = (invite) => {
        setCurrentRoom(invite.roomId);
        socketRef.current.emit('acceptInvite', invite.roomId);
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
