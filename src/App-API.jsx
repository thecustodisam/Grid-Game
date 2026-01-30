import { useState, useEffect } from 'react'
import {
  getAllPlayers,
  getDailyGrid,
  validatePlayer,
  getHint
} from './services/apiService'
import './App.css'

function App() {
  const [grid, setGrid] = useState(null)
  const [allPlayers, setAllPlayers] = useState([])
  const [selectedCell, setSelectedCell] = useState(null)
  const [answers, setAnswers] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [guessesRemaining, setGuessesRemaining] = useState(9)
  const [gameOver, setGameOver] = useState(false)
  const [showHint, setShowHint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [players, dailyGrid] = await Promise.all([
          getAllPlayers(),
          getDailyGrid()
        ])

        setAllPlayers(players)
        setGrid(dailyGrid)
        setLoading(false)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load game data. Make sure the API server is running.')
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCellClick = (rowId, colId) => {
    if (gameOver) return
    const cellKey = `${rowId}-${colId}`
    if (answers[cellKey]) return // Already answered
    setSelectedCell({ rowId, colId })
    setSearchTerm('')
  }

  const handlePlayerSelect = async (playerName) => {
    if (!selectedCell) return

    const { rowId, colId } = selectedCell
    const cellKey = `${rowId}-${colId}`

    const row = grid.rows.find(r => r.id === rowId)
    const col = grid.columns.find(c => c.id === colId)

    try {
      // Validate against API
      const result = await validatePlayer(playerName, row.label, col.label)

      setAnswers({
        ...answers,
        [cellKey]: {
          player: playerName,
          correct: result.valid
        }
      })

      setGuessesRemaining(guessesRemaining - 1)
      setSelectedCell(null)
      setSearchTerm('')

      if (guessesRemaining - 1 === 0) {
        setGameOver(true)
      }
    } catch (err) {
      console.error('Error validating player:', err)
      alert('Error validating answer. Please try again.')
    }
  }

  const filteredPlayers = searchTerm
    ? allPlayers.filter(playerName =>
        playerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  const handleShowHint = async (rowId, colId) => {
    const row = grid.rows.find(r => r.id === rowId)
    const col = grid.columns.find(c => c.id === colId)

    try {
      const validPlayers = await getHint(row.label, col.label)
      setShowHint({ rowId, colId, players: validPlayers })
    } catch (err) {
      console.error('Error fetching hint:', err)
      alert('Error loading hint. Please try again.')
    }
  }

  const resetGame = async () => {
    try {
      const dailyGrid = await getDailyGrid()
      setGrid(dailyGrid)
      setAnswers({})
      setGuessesRemaining(9)
      setGameOver(false)
      setSelectedCell(null)
      setSearchTerm('')
      setShowHint(null)
    } catch (err) {
      console.error('Error resetting game:', err)
    }
  }

  const correctAnswers = Object.values(answers).filter(a => a.correct).length

  // Loading state
  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <h2>Loading Chain to the Rim...</h2>
          <p>Fetching player data from blockchain...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>Error Loading Game</h2>
          <p>{error}</p>
          <p>Make sure the API server is running:</p>
          <code>npm run server</code>
        </div>
      </div>
    )
  }

  // No grid loaded
  if (!grid) {
    return <div className="app"><h2>Loading grid...</h2></div>
  }

  return (
    <div className="app">
      <header className="header">
        <img src="/chaintotherim2.png" alt="Chain to the Rim" className="logo" />
        <p className="subtitle">Chain to the Rim is a daily NBA Top Shot grid game that tests your basketball knowledge and on-chain instincts. Fill the grid by matching players and to Top Shot–specific criteria — block by block, all the way to the rim.</p>
        <p className="api-badge">🔌 Powered by API ({allPlayers.length} players)</p>
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
          <div className="grid-cell header-cell corner"></div>

          {grid.columns.map(col => (
            <div key={col.id} className="grid-cell header-cell column-header">
              <div className="category-label">{col.label}</div>
              <div className="category-type">{col.type}</div>
            </div>
          ))}

          {grid.rows.map(row => (
            <>
              <div key={row.id} className="grid-cell header-cell row-header">
                <div className="category-label">{row.label}</div>
                <div className="category-type">{row.type}</div>
              </div>

              {grid.columns.map(col => {
                const cellKey = `${row.id}-${col.id}`
                const answer = answers[cellKey]
                const isSelected = selectedCell?.rowId === row.id && selectedCell?.colId === col.id

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
                            e.stopPropagation()
                            handleShowHint(row.id, col.id)
                          }}
                        >
                          ?
                        </button>
                      </div>
                    )}
                  </div>
                )
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
