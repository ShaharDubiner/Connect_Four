import React from 'react';
import { AIPlayer } from './Player';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.players = [props.player1, props.player2];
    this.initialState = {
      currentTurn: 0,
      board: Array(6)
        .fill()
        .map(() => Array(7).fill(0)),
      gameOver: false,
      winner: null,
      player1Score: 0,
      player2Score: 0,
    };
    this.state = { ...this.initialState };
    this.moveDelay = 500;
  }

  componentDidMount() {
    this.checkAndMakeMove();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentTurn !== this.state.currentTurn) {
      this.checkAndMakeMove();
    }
  }

  checkAndMakeMove = () => {
    const currentPlayer = this.players[this.state.currentTurn];
    if (currentPlayer.type !== 'human' && !this.state.gameOver) {
      setTimeout(() => this.makeMove(), this.moveDelay);
    }
  };

  isValidMove(col) {
    return this.state.board[0][col] === 0;
  }
  
  makeMove = async (col = null) => {
    if (this.state.gameOver) return;
  
    const currentPlayer = this.players[this.state.currentTurn];
    let move, score;
  
    if (currentPlayer.type === 'human') {
      if (col === null) return;
      if (!this.isValidMove(col)) {
        console.log("Invalid move, column is full");
        return; // Don't change turn, just return
      }
      move = col;
      // Use the opponent's AI player for evaluation
      const aiPlayer = this.players[1 - this.state.currentTurn];
      const newBoard = this.applyMove(this.state.board, move, currentPlayer.playerNumber);
      if (aiPlayer.type === 'ai') {
        score = aiPlayer.evaluateBoard(newBoard);
      } else {
        // If opponent is not AI, create a temporary AI player for evaluation
        const tempAI = new AIPlayer(3 - currentPlayer.playerNumber, 5);
        score = tempAI.evaluateBoard(newBoard);
      }
    } else if (currentPlayer.type === 'ai') {
      const result = currentPlayer.getAlphaBetaMove(this.state.board);
      move = result.move;
      score = result.score;
      if (!this.isValidMove(move)) {
        console.error(`AI attempted invalid move: ${move}`);
        return;
      }
    } else if (currentPlayer.type === 'random') {
      let attempts = 0;
      const maxAttempts = 100; // Prevent infinite loop
      do {
        move = currentPlayer.getMove(this.state.board);
        attempts++;
        if (attempts >= maxAttempts) {
          console.error("Random player failed to find a valid move");
          return;
        }
      } while (!this.isValidMove(move));
      
      // Use the opponent's AI player for evaluation
      const aiPlayer = this.players[1 - this.state.currentTurn];
      const newBoard = this.applyMove(this.state.board, move, currentPlayer.playerNumber);
      if (aiPlayer.type === 'ai') {
        score = aiPlayer.evaluateBoard(newBoard);
      } else {
        // If opponent is not AI, create a temporary AI player for evaluation
        const tempAI = new AIPlayer(3 - currentPlayer.playerNumber, 5);
        score = tempAI.evaluateBoard(newBoard);
      }
    } else {
      console.error(`Unknown player type: ${currentPlayer.type}`);
      return;
    }
  
    if (move !== null && move !== undefined && this.isValidMove(move)) {
      this.updateBoard(move, currentPlayer.playerNumber, score);
    } else {
      console.error(`Invalid move by player ${currentPlayer.playerNumber}`);
      return;
    }
  };

  applyMove(board, move, playerNum) {
    const newBoard = board.map(row => [...row]);
    for (let row = newBoard.length - 1; row >= 0; row--) {
      if (newBoard[row][move] === 0) {
        newBoard[row][move] = playerNum;
        break;
      }
    }
    return newBoard;
  }

  updateBoard(move, playerNum, score) {
    const newBoard = this.applyMove(this.state.board, move, playerNum);
    const gameCompleted = this.gameCompleted(newBoard, playerNum);
    const nextTurn = 1 - this.state.currentTurn;
  
    // Smooth out score transitions
    const smoothingFactor = 0.3; // Adjust this value to control smoothing (0.1 to 0.5 range)
    let newPlayer1Score = playerNum === 1 ? score : -score;
    let newPlayer2Score = playerNum === 2 ? score : -score;
    
    if (gameCompleted) {
      // Set max score for winner, min score for loser
      const maxScore = 400;
      newPlayer1Score = playerNum === 1 ? maxScore : -maxScore;
      newPlayer2Score = playerNum === 2 ? maxScore : -maxScore;
    } else {
      // Apply smoothing only if the game is not completed
      newPlayer1Score = this.state.player1Score * (1 - smoothingFactor) + newPlayer1Score * smoothingFactor;
      newPlayer2Score = this.state.player2Score * (1 - smoothingFactor) + newPlayer2Score * smoothingFactor;
    }
  
    this.setState(
      {
        board: newBoard,
        currentTurn: nextTurn,
        gameOver: gameCompleted,
        winner: gameCompleted ? playerNum : null,
        player1Score: newPlayer1Score,
        player2Score: newPlayer2Score,
      },
      () => {
        const nextPlayer = this.players[this.state.currentTurn];
        this.props.updateGameStatus(nextPlayer.playerString);
  
        if (this.isBoardFull() && !gameCompleted) {
          this.setState(
            {
              gameOver: true,
              winner: 'Tie',
            },
            () => {
              this.props.updateGameStatus('Game Over: Tie!');
            }
          );
        } else if (gameCompleted) {
          this.props.updateGameStatus(
            `Game Over: Player ${playerNum} Wins!`
          );
        }
      }
    );
  }

  updateFinalScore(winningPlayer, finalScore) {
    this.setState({
      player1Score: winningPlayer === 1 ? finalScore : -finalScore,
      player2Score: winningPlayer === 2 ? finalScore : -finalScore,
    });
  }

  gameCompleted(board, playerNum) {
    const rows = board.length;
    const cols = board[0].length;

    const checkFour = (a, b, c, d) => {
      return (
        a === playerNum && b === playerNum && c === playerNum && d === playerNum
      );
    };

    // Check horizontal, vertical, and both diagonals
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (
          col <= 3 &&
          checkFour(
            board[row][col],
            board[row][col + 1],
            board[row][col + 2],
            board[row][col + 3]
          )
        )
          return true;
        if (
          row <= 2 &&
          checkFour(
            board[row][col],
            board[row + 1][col],
            board[row + 2][col],
            board[row + 3][col]
          )
        )
          return true;
        if (
          row <= 2 &&
          col <= 3 &&
          checkFour(
            board[row][col],
            board[row + 1][col + 1],
            board[row + 2][col + 2],
            board[row + 3][col + 3]
          )
        )
          return true;
        if (
          row >= 3 &&
          col <= 3 &&
          checkFour(
            board[row][col],
            board[row - 1][col + 1],
            board[row - 2][col + 2],
            board[row - 3][col + 3]
          )
        )
          return true;
      }
    }

    return false;
  }

  isBoardFull() {
    return this.state.board.every((row) => row.every((cell) => cell !== 0));
  }

  render() {
    const currentPlayer = this.players[this.state.currentTurn];
    const isHumanTurn = currentPlayer.type === 'human' && !this.state.gameOver;
  
    // Adjusted code for bar rendering
    const maxScore = 600;
    const scoreDifference = this.state.player1Score - this.state.player2Score;
    const cappedScoreDifference = Math.min(Math.abs(scoreDifference), maxScore);
    const percentage = (cappedScoreDifference / maxScore) * 100;
  
    const player1Height = scoreDifference >= 0 ? percentage : 0;
    const player2Height = scoreDifference < 0 ? percentage : 0;
  
    return (
      <div className="game-container">
        {/* Player 1 Score Bar */}
        <div className="score-bar-container player1-bar-container">
          <div className="score-bar-perimeter player1-bar-perimeter"></div>
          <div className="score-bar player1-bar">
            <div
              className="score-fill player1-fill"
              style={{ height: `${player1Height}%` }}
            />
          </div>
        </div>
  
        {/* Game Board */}
        <div className="board">
          {[0, 1, 2, 3, 4, 5, 6].map((col) => (
            <div
              key={col}
              className="board-column"
              onClick={() => isHumanTurn && this.makeMove(col)}
            >
              {this.state.board.map((row, rowIndex) => (
                <div
                  key={`${rowIndex}-${col}`}
                  className={`cell ${
                    row[col] === 1
                      ? 'player1'
                      : row[col] === 2
                      ? 'player2'
                      : ''
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
  
        {/* Player 2 Score Bar */}
        <div className="score-bar-container player2-bar-container">
          <div className="score-bar-perimeter player2-bar-perimeter"></div>
          <div className="score-bar player2-bar">
            <div
              className="score-fill player2-fill"
              style={{ height: `${player2Height}%` }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Game;
