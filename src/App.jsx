import { useState, useEffect } from 'react'
import { generateDailyGrid } from './data/categories'
import { getUniquePlayers, getMatchingPlayers, playerHasMatchingMoment } from './data/players'
import './App.css'

function App() {
  const [grid, setGrid] = useState(generateDailyGrid());
  const [selectedCell, setSelectedCell] = useState(null);
  const [answers, setAnswers] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [guessesRemaining, setGuessesRemaining] = useState(9);
  const [gameOver, setGameOver] = useState(false);
  const [showHint, setShowHint] = useState(null);

  const handleCellClick = (rowId, colId) => {
    if (gameOver) return;
    const cellKey = `${rowId}-${colId}`;
    if (answers[cellKey]) return; // Already answered
    setSelectedCell({ rowId, colId });
    setSearchTerm('');
  };

  const handlePlayerSelect = (playerName) => {
    if (!selectedCell) return;

    const { rowId, colId } = selectedCell;
    const cellKey = `${rowId}-${colId}`;

    const row = grid.rows.find(r => r.id === rowId);
    const col = grid.columns.find(c => c.id === colId);

    const isCorrect = playerHasMatchingMoment(playerName, row.label, col.label);

    setAnswers({
      ...answers,
      [cellKey]: {
        player: playerName,
        correct: isCorrect
      }
    });

    setGuessesRemaining(guessesRemaining - 1);
    setSelectedCell(null);
    setSearchTerm('');

    if (guessesRemaining - 1 === 0) {
      setGameOver(true);
    }
  };

  const allPlayers = getUniquePlayers();
  const filteredPlayers = searchTerm
    ? allPlayers.filter(playerName =>
        playerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleShowHint = (rowId, colId) => {
    const row = grid.rows.find(r => r.id === rowId);
    const col = grid.columns.find(c => c.id === colId);
    const matching = getMatchingPlayers(row.label, col.label);
    setShowHint({ rowId, colId, players: matching });
  };

  const resetGame = () => {
    setAnswers({});
    setGuessesRemaining(9);
    setGameOver(false);
    setSelectedCell(null);
    setSearchTerm('');
    setShowHint(null);
    setGrid(generateDailyGrid());
  };

  const correctAnswers = Object.values(answers).filter(a => a.correct).length;

  return (
    <div className="app">
      <header className="header">
        <img src="/chaintotherim2.png" alt="Chain to the Rim" className="logo" />
        <p className="subtitle">Chain to the Rim is a daily NBA Top Shot grid game that tests your basketball knowledge and on-chain instincts. Fill the grid by matching players and to Top Shot–specific criteria — block by block, all the way to the rim.</p>
      </header>

      <div className="game-stats">
        <div className="stat">
          <span className="stat-label">Guesses Remaining:</span>
          <span className="stat-value">{guessesRemaining}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Correct:</span>
          <span className="stat-value">{correctAnswers}/9</span>
        </div>
      </div>

      <div className="grid-container">
        <div className="grid">
          {/* Empty top-left corner */}
          <div className="grid-cell header-cell corner"></div>

          {/* Column headers */}
          {grid.columns.map(col => (
            <div key={col.id} className="grid-cell header-cell column-header">
              <div className="category-label">{col.label}</div>
              <div className="category-type">{col.type}</div>
            </div>
          ))}

          {/* Rows with row header + cells */}
          {grid.rows.map(row => (
            <>
              <div key={row.id} className="grid-cell header-cell row-header">
                <div className="category-label">{row.label}</div>
                <div className="category-type">{row.type}</div>
              </div>

              {grid.columns.map(col => {
                const cellKey = `${row.id}-${col.id}`;
                const answer = answers[cellKey];
                const isSelected = selectedCell?.rowId === row.id && selectedCell?.colId === col.id;

                return (
                  <div
                    key={cellKey}
                    className={`grid-cell answer-cell ${isSelected ? 'selected' : ''} ${
                      answer ? (answer.correct ? 'correct' : 'incorrect') : ''
                    }`}
                    onClick={() => handleCellClick(row.id, col.id)}
                  >
                    {answer ? (
                      <div className="answer">
                        <div className="player-name">{answer.player}</div>
                        <div className="answer-status">
                          {answer.correct ? '✓' : '✗'}
                        </div>
                      </div>
                    ) : (
                      <div className="empty-cell">
                        <button
                          className="hint-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowHint(row.id, col.id);
                          }}
                        >
                          ?
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {selectedCell && !gameOver && (
        <div className="modal-overlay" onClick={() => { setSelectedCell(null); setSearchTerm(''); }}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Select a player for this cell</h3>
            <input
              type="text"
              className="search-input"
              placeholder="Search for a player..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <div className="player-list">
              {filteredPlayers.length > 0 ? (
                filteredPlayers.slice(0, 10).map(playerName => (
                  <button
                    key={playerName}
                    className="player-option"
                    onClick={() => handlePlayerSelect(playerName)}
                  >
                    {playerName}
                  </button>
                ))
              ) : searchTerm ? (
                <div className="no-results">No players found</div>
              ) : (
                <div className="hint-text">Start typing to search players...</div>
              )}
            </div>
            <button className="close-btn" onClick={() => { setSelectedCell(null); setSearchTerm(''); }}>Close</button>
          </div>
        </div>
      )}

      {showHint && (
        <div className="modal-overlay" onClick={() => setShowHint(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Valid Players</h3>
            <p className="hint-count">{showHint.players.length} players match this criteria</p>
            <div className="hint-players">
              {showHint.players.map(playerName => (
                <div key={playerName} className="hint-player">{playerName}</div>
              ))}
            </div>
            <button className="close-btn" onClick={() => setShowHint(null)}>Close</button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Game Over!</h2>
            <p className="final-score">
              You got {correctAnswers} out of 9 correct!
            </p>
            <button className="reset-btn" onClick={resetGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
