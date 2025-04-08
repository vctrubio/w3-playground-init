import { useState } from 'react';

function Game() {
    const [score, setScore] = useState(0);
    
    const handleClick = () => {
        setScore(score + 1);
    };
    
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Simple Clicker Game</h2>
            <p className="mb-4">Score: {score}</p>
            <button 
                onClick={handleClick}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Click Me!
            </button>
        </div>
    );
}

export default Game;