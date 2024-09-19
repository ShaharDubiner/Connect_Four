import React, { useState, useEffect, useRef } from 'react';
import Game from './ConnectFour';
import { AIPlayer, RandomPlayer, HumanPlayer } from './Player';
import './App.css';

const PlayerOption = ({ label, selected, onClick }) => (
  <button 
    onClick={onClick}
    className={`button ${selected ? 'button-outline' : ''}`}
  >
    {label}
  </button>
);

const App = () => {
  const [gameConfig, setGameConfig] = useState({
    player1: 'human',
    player2: 'ai',
    difficulty: 4
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [gameStatus, setGameStatus] = useState(null);
  const boardRef = useRef(null);

  useEffect(() => {
    const calculateBoardSize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const maxWidth = windowWidth * 0.7;
      const maxHeight = windowHeight * 0.7;
      const aspectRatio = 7 / 6; // width / height
      const padding = 0.08; // 4% padding on top and bottom
    
      let width, height;
      if (maxWidth / aspectRatio <= maxHeight / (1 + padding)) {
        width = maxWidth;
        height = maxWidth / aspectRatio * (1 + padding);
      } else {
        height = maxHeight;
        width = (maxHeight / (1 + padding)) * aspectRatio;
      }
    
      setBoardSize({ width, height });
    };

    calculateBoardSize();
    window.addEventListener('resize', calculateBoardSize);

    return () => window.removeEventListener('resize', calculateBoardSize);
  }, []);

  const makePlayer = (name, num) => {
    switch (name) {
      case 'ai':
        return new AIPlayer(num, gameConfig.difficulty);
      case 'random':
        return new RandomPlayer(num);
      case 'human':
        return new HumanPlayer({ playerNumber: num });
      default:
        throw new Error(`Invalid player type: ${name}`);
    }
  };

  const handlePlayerChange = (player, type) => {
    setGameConfig(prev => ({ ...prev, [player]: type }));
  };

  const handleDifficultyChange = (e) => {
    setGameConfig(prev => ({ ...prev, difficulty: parseInt(e.target.value) }));
  };

  const startGame = () => {
    setGameStarted(true);
    setGameStatus(`Player 1:${gameConfig.player1}`);
  };

  const backToMenu = () => {
    setGameStarted(false);
    setGameStatus(null);
  };

  const resetGame = () => {
    setGameKey(prevKey => prevKey + 1);
    setGameStatus(`Player 1:${gameConfig.player1}`);
  };

  const updateGameStatus = (status) => {
    setGameStatus(status);
  };

  return (
    <div className="container">
      <h1>Connect Four</h1>
      {!gameStarted ? (
        <div>
          <div className="row">
            <div className="column">
              <h2>Player 1</h2>
              <div>
                {['human', 'ai', 'random'].map(type => (
                  <PlayerOption
                    key={type}
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    selected={gameConfig.player1 === type}
                    onClick={() => handlePlayerChange('player1', type)}
                  />
                ))}
              </div>
            </div>
            <div className="column">
              <h2>Player 2</h2>
              <div>
                {['human', 'ai', 'random'].map(type => (
                  <PlayerOption
                    key={type}
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    selected={gameConfig.player2 === type}
                    onClick={() => handlePlayerChange('player2', type)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="column">
              <label>
                AI Difficulty: {gameConfig.difficulty}
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={gameConfig.difficulty}
                  onChange={handleDifficultyChange}
                />
              </label>
            </div>
          </div>
          <button onClick={startGame} className="button button-primary">
            Start Game
          </button>
          <div className="ai-explanation">
            <h2>AI Strategy</h2>
            <p>The Connect Four AI uses two different algorithms for strategic gameplay:</p>
            <ul>
              <li><strong>Against AI and Human Players:</strong> Minimax with Alpha-Beta Pruning. It essentially looks ahead and tries to maximize it's score while minimizing it's opponent's score. It uses alpha-beta pruning to avoid going down recursive branches that are clearly undesireable, which in turn greatly speeds it up.</li>
              <li><strong>Against Random Players:</strong> Expectimax. This isn't the best showcase for expectimax, but I included it as an interesting counterpart to min-max. Expectimax runs the same as minimax, but multiplies each branch by the fraction of it's likelihood. It's the only way to apply this sort of logic to games with a random element like poker.</li>
            </ul>
            <h3>Difficulty Slider</h3>
            <p>Adjust how many moves ahead the AI looks:</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="row">
            <div className="column">
              <button onClick={backToMenu} className="button">
                ← Back
              </button>
            </div>
            <div className="column">
              <button onClick={resetGame} className="button">
                ↻ Reset
              </button>
            </div>
          </div>
          <div className="game-status">
            {gameStatus}
          </div>
          <div 
            ref={boardRef}
            className="board-frame"
            style={{
              width: `${boardSize.width}px`,
              height: `${boardSize.height}px`
            }}
          >
            <Game 
              key={gameKey}
              player1={makePlayer(gameConfig.player1, 1)} 
              player2={makePlayer(gameConfig.player2, 2)}
              updateGameStatus={updateGameStatus}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;