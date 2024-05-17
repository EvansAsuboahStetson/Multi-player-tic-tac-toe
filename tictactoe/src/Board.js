import React, { useState } from 'react';
import Square from './Square'; // Adjust the import path according to your project structure

function Board({ squares, onPlay }) {
    const size = Math.sqrt(squares.length);
    const [movingIndex, setMovingIndex] = useState(null);  // State to track the moving tile

    function findBlankSquare() {
        return squares.indexOf(null);
    }

    function handleClick(index) {
        const blankIndex = findBlankSquare();
        const validMoves = [
            blankIndex - size, // Up
            blankIndex + size, // Down
            blankIndex - 1, // Left
            blankIndex + 1 // Right
        ];

        if (
            validMoves.includes(index) &&
            (Math.floor(index / size) === Math.floor(blankIndex / size) ||
                index % size === blankIndex % size)
        ) {
            const newSquares = [...squares];
            newSquares[blankIndex] = newSquares[index];
            newSquares[index] = null;
            setMovingIndex(index);  
            setTimeout(() => {
                onPlay(newSquares);
                setMovingIndex(null);  
            }, 300);  
        }
    }

    function renderSquare(i) {
        const isMoving = i === movingIndex;
        return (
            <Square 
                value={squares[i]} 
                onSquareClick={() => handleClick(i)}
                className={isMoving ? "moving" : ""}
            />
        );
    }

    let rows = [];
    for (let i = 0; i < size; i++) {
        let row = [];
        for (let j = 0; j < size; j++) {
            row.push(renderSquare(i * size + j));
        }
        rows.push(
            <div key={i} className="board-row">
                {row}
            </div>
        );
    }

    return <div>{rows}</div>;
}

export default Board;
