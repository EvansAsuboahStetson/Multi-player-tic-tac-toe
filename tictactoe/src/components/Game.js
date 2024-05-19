import React, { useEffect } from 'react';
import Board from './Board';
import Lobby from './Lobby';
import Invites from './Invites';
import './Game.css';
import useSocket from './useSocket';
import { useAuth } from '../context/authenticated';

const Game = () => {
    const { socket, isSocketInitialized } = useAuth();
    const {
        squares, xIsNext, player, waiting, winner, gameOver, availablePlayers, invites, currentRoom,
        handleClick, handleRestart, handleInvite, handleAcceptInvite, status
    } = useSocket(socket, isSocketInitialized);

    useEffect(() => {

        if (isSocketInitialized && socket) {

            socket.emit('updateLobby',availablePlayers);
            console.log('Game useEffect socket initialized');
            console.log('Game useEffect socket initialized', availablePlayers);
        }
    }, [socket, isSocketInitialized, availablePlayers]);

    if (!isSocketInitialized) {
        return <div>Loading...</div>;
    }

    console.log('Game render availablePlayers', availablePlayers);

    return (
        <div className="game">
            <div className="status">{status}</div>
            {player && <div className="player">You are player: {player}</div>}
            <Board squares={squares} onClick={handleClick} />
            <button className="restart" onClick={handleRestart}>Restart Game</button>
            <Lobby availablePlayers={availablePlayers} onInvite={handleInvite} />
            <Invites invites={invites} onAcceptInvite={handleAcceptInvite} />
        </div>
    );
};

export default Game;
