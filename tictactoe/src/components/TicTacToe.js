import { useState } from "react";
import "./TicTacToe.css";
function Square({ value, onSquareClick, className }) {
    return (
        <button
            className={`square ${value === null ? "blank" : ""} ${className}`}
            onClick={onSquareClick}
            aria-label={value ? `Tile number ${value}` : "Blank tile"}
        >
            {value}
        </button>
    );
}

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

export default function Game() {
  const size = 3;
  const solvedState = [1, 2, 3, 8, null, 4, 7, 6, 5];

  const [squares, setSquares] = useState([...solvedState]);
  const [history, setHistory] = useState([{ squares: [...solvedState] }]);

  const [movingIndex, setMovingIndex] = useState(null);  // Correctly initialized here



  function handlePlay(nextSquares) {
    
    const newHistory = history.slice(0, history.length); // Copy the existing history
    newHistory.push({ squares: nextSquares });
    console.log(newHistory);
    setHistory(newHistory);
    setSquares(nextSquares);
    if (nextSquares.every((val, idx) => val === solvedState[idx])) {
      alert("Congratulations! You solved the puzzle!");
    }
  }
  function jumpTo(moveIndex) {
    setSquares(history[moveIndex].squares);
}
function scramble() {
    const size = Math.sqrt(solvedState.length);
    let currentSquares = [...solvedState];
    let blankIndex = 4;  // Middle index for a 3x3 grid
    let moveCount = 0;

    function makeMove() {
        if (moveCount >= 100) {
            setSquares(currentSquares);
            return;
        }
        const moves = [
            blankIndex - size,
            blankIndex + size,
            blankIndex % size !== 0 ? blankIndex - 1 : -1,
            blankIndex % size !== size - 1 ? blankIndex + 1 : -1,
        ].filter((x) => x >= 0 && x < currentSquares.length);

        const move = moves[Math.floor(Math.random() * moves.length)];
        currentSquares[blankIndex] = currentSquares[move];
        currentSquares[move] = null;
        setMovingIndex(blankIndex);  
        setTimeout(() => {
            setSquares([...currentSquares]); 
            blankIndex = move;  
            setMovingIndex(null);  // Reset moving index
            moveCount++;
            makeMove();  // Recursively continue scrambling
        }, 5);  // Delay between moves
    }

    makeMove();  
}

  return (
    <div className="game">
        <div className="game-board">
            <Board squares={squares} onPlay={handlePlay} />
            <button onClick={scramble}>Scramble</button>
        </div>
        <div className="game-info">
            <ol>
                {history.map((step, move) => {
                    const desc = move ? 'Go to move #' + move : 'Go to game start';
                    return (
                        <li key={move}>
                            <button onClick={() => jumpTo(move)}>{desc}</button>
                        </li>
                    );
                })}
            </ol>
        </div>
    </div>
);

}
