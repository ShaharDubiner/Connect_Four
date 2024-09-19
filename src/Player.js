import React from 'react';

class AIPlayer {
  constructor(playerNumber, difficulty = 5) {
    this.playerNumber = playerNumber;
    this.type = 'ai';
    this.playerString = `Player ${playerNumber}:ai`;
    this.difficulty = difficulty; // This will represent the depth of the search
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
  }

  getAlphaBetaMove(board) {
    const start = Date.now();
    const [score, move] = this.minimax(
      board,
      this.difficulty,
      this.playerNumber,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY
    );
    const end = Date.now();
    console.log(`AI move took ${end - start} ms`);
    console.log(
      `player: ${this.playerNumber}, score: ${score}, move: ${move}, depth: ${this.difficulty}`
    );
    return { move, score };
  }

  minimax(board, depth, player, alpha, beta) {
    const validMoves = this.getValidMoves(board);

    // Check for terminal states
    const winner = this.checkWinner(board);
    if (winner !== null) {
      return [winner === this.playerNumber ? 1000000 : -1000000, null];
    }
    if (validMoves.length === 0 || depth === 0) {
      return [this.evaluateBoard(board), null];
    }

    let bestMove = null;
    if (player === this.playerNumber) {
      let maxEval = Number.NEGATIVE_INFINITY;
      for (const move of validMoves) {
        const newBoard = this.applyMove(move, player, board);
        const [evaluation] = this.minimax(
          newBoard,
          depth - 1,
          3 - player,
          alpha,
          beta
        );
        if (evaluation > maxEval) {
          maxEval = evaluation;
          bestMove = move;
        }
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return [maxEval, bestMove];
    } else {
      let minEval = Number.POSITIVE_INFINITY;
      for (const move of validMoves) {
        const newBoard = this.applyMove(move, player, board);
        const [evaluation] = this.minimax(
          newBoard,
          depth - 1,
          3 - player,
          alpha,
          beta
        );
        if (evaluation < minEval) {
          minEval = evaluation;
          bestMove = move;
        }
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return [minEval, bestMove];
    }
  }

  getValidMoves(board) {
    return board[0]
      .map((_, colIndex) => colIndex)
      .filter((col) => board[0][col] === 0);
  }

  applyMove(move, player, board) {
    const newBoard = board.map((row) => [...row]);
    for (let row = newBoard.length - 1; row >= 0; row--) {
      if (newBoard[row][move] === 0) {
        newBoard[row][move] = player;
        break;
      }
    }
    return newBoard;
  }

  checkWinner(board) {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        if (board[row][col] !== 0) {
          for (const [dx, dy] of directions) {
            let count = 1;
            for (let i = 1; i < 4; i++) {
              const newRow = row + i * dy;
              const newCol = col + i * dx;
              if (
                newRow < 0 ||
                newRow >= 6 ||
                newCol < 0 ||
                newCol >= 7
              )
                break;
              if (board[newRow][newCol] === board[row][col]) count++;
              else break;
            }
            if (count === 4) return board[row][col];
          }
        }
      }
    }
    return null;
  }

  evaluateBoard(board) {
    let score = 0;
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        for (const [dx, dy] of directions) {
          score += this.evaluateWindow(board, row, col, dx, dy);
        }
      }
    }

    // Prefer center column
    const centerArray = board.map((row) => row[3]);
    const centerCount = centerArray.filter(
      (cell) => cell === this.playerNumber
    ).length;
    score += centerCount * 3;

    return score;
  }

  evaluateWindow(board, row, col, dx, dy) {
    const window = [];
    const positions = [];
    for (let i = 0; i < 4; i++) {
      const newRow = row + i * dy;
      const newCol = col + i * dx;
      if (
        newRow < 0 ||
        newRow >= 6 ||
        newCol < 0 ||
        newCol >= 7
      )
        return 0;
      window.push(board[newRow][newCol]);
      positions.push([newRow, newCol]);
    }

    const aiCount = window.filter(
      (cell) => cell === this.playerNumber
    ).length;
    const oppCount = window.filter(
      (cell) => cell === 3 - this.playerNumber
    ).length;
    const emptyCount = window.filter((cell) => cell === 0).length;

    if (aiCount === 4) return 99999;
    if (oppCount === 4) return -99999;
    if (aiCount === 3 && emptyCount === 1) {
      const emptyPos = positions[window.indexOf(0)];
      if (this.isPlayable(board, emptyPos[1])) return 10;
    }
    if (oppCount === 3 && emptyCount === 1) {
      const emptyPos = positions[window.indexOf(0)];
      if (this.isPlayable(board, emptyPos[1])) return -10;
    }
    if (aiCount === 2 && emptyCount === 2) return 2;
    if (oppCount === 2 && emptyCount === 2) return -2;

    return 0;
  }

  isPlayable(board, col) {
    return board[0][col] === 0;
  }
}

class RandomPlayer {
  constructor(playerNumber) {
    this.playerNumber = playerNumber;
    this.type = 'random';
    this.playerString = `Player ${playerNumber}:random`;
  }

  getMove(board) {
    const validCols = [];
    for (let col = 0; col < board[0].length; col++) {
      if (board[0][col] === 0) {
        validCols.push(col);
      }
    }
    const move =
      validCols[Math.floor(Math.random() * validCols.length)];
    console.log(
      `Random player ${this.playerNumber} chose move: ${move}`
    );
    return move;
  }
}

class HumanPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.playerNumber = props.playerNumber;
    this.type = 'human';
    this.playerString = `Player ${this.playerNumber}:human`;
    this.state = {
      move: null,
    };
  }

  getMove(board) {
    return new Promise((resolve) => {
      this.setState({ move: null });
      this.resolve = resolve;
    });
  }

  handleMove = (col) => {
    if (this.resolve) {
      this.resolve(col);
      this.resolve = null;
    }
  };

  render() {
    return (
      <div>
        {this.props.board.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex' }}>
            {row.map((cell, colIndex) => (
              <button
                key={colIndex}
                onClick={() => this.handleMove(colIndex)}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor:
                    cell === 0
                      ? 'white'
                      : cell === 1
                      ? 'yellow'
                      : 'red',
                  border: '1px solid black',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
}

export { AIPlayer, RandomPlayer, HumanPlayer };
