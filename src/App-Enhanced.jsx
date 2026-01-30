import { useState, useEffect } from 'react'
import {
  getAllPlayers,
  getDailyGrid,
  validatePlayer,
  getHint
} from './services/apiService'
import { saveGameResult, hasPlayedToday, getStats, getResultForDate } from './services/statsService'
import { LEAGUES } from './constants/leagues'
import StatsDashboard from './components/StatsDashboard'
import MomentDetailModal from './components/MomentDetailModal'
import ShareModal from './components/ShareModal'
import LeagueSelector from './components/LeagueSelector'
import './App.css'
import './App-Enhanced.css'

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

  // Enhanced features
  const [showStats, setShowStats] = useState(false)
  const [showMomentDetail, setShowMomentDetail] = useState(null)
  const [showShare, setShowShare] = useState(false)
  const [showGameOverModal, setShowGameOverModal] = useState(false)
  const [gameMode, setGameMode] = useState('daily') // 'daily', 'practice', 'timed'
  const [stats, setStats] = useState(null)
  const [todayDate, setTodayDate] = useState('')
  const [alreadyPlayed, setAlreadyPlayed] = useState(false)

  // League selection
  const [league, setLeague] = useState(() => {
    // Load league preference from localStorage
    return localStorage.getItem('topshot-grid-league') || LEAGUES.NBA
  })

  // Load initial data
  useEffect(() => {
    const date = new Date().toISOString().split('T')[0]
    setTodayDate(date)

    async function loadData() {
      try {
        setLoading(true)
        const [players, dailyGrid] = await Promise.all([
          getAllPlayers(league),
          getDailyGrid(null, league)
        ])

        setAllPlayers(players)
        setGrid(dailyGrid)
        setStats(getStats())
        setAlreadyPlayed(hasPlayedToday(league))
        setLoading(false)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load game data. Make sure the API server is running.')
        setLoading(false)
      }
    }

    loadData()
  }, [league])

  const handleCellClick = (rowId, colId) => {
    if (gameOver || alreadyPlayed) return
    const cellKey = `${rowId}-${colId}`
    if (answers[cellKey]) return
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
      const result = await validatePlayer(playerName, row.label, col.label, league)

      const newAnswers = {
        ...answers,
        [cellKey]: {
          player: playerName,
          correct: result.valid,
          rowCategory: row.label,
          colCategory: col.label
        }
      }

      setAnswers(newAnswers)
      setGuessesRemaining(guessesRemaining - 1)
      setSelectedCell(null)
      setSearchTerm('')

      // Check if game is over
      if (guessesRemaining - 1 === 0 || Object.keys(newAnswers).length === 9) {
        endGame(newAnswers)
      }
    } catch (err) {
      console.error('Error validating player:', err)
      alert('Error validating answer. Please try again.')
    }
  }

  const endGame = (finalAnswers) => {
    setGameOver(true)
    setShowGameOverModal(true)
    const score = Object.values(finalAnswers).filter(a => a.correct).length

    // Save results with league
    const updatedStats = saveGameResult(todayDate, score, finalAnswers, grid, league)
    setStats(updatedStats)
    setAlreadyPlayed(true)
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
      const validPlayers = await getHint(row.label, col.label, league)
      setShowHint({ rowId, colId, players: validPlayers })
    } catch (err) {
      console.error('Error fetching hint:', err)
      alert('Error loading hint. Please try again.')
    }
  }

  const handleLeagueChange = (newLeague) => {
    console.log(`🔄 Switching to ${newLeague}...`)

    // Save preference
    localStorage.setItem('topshot-grid-league', newLeague)

    // Check if new league has been played today
    const hasPlayedNewLeague = hasPlayedToday(newLeague)
    console.log(`📊 ${newLeague} already played today:`, hasPlayedNewLeague)

    // If already played, load saved results
    if (hasPlayedNewLeague) {
      const today = new Date().toISOString().split('T')[0]
      const savedResult = getResultForDate(today, newLeague)

      if (savedResult) {
        setAnswers(savedResult.answers)
        setGuessesRemaining(9 - Object.keys(savedResult.answers).length)
        setGameOver(true)
      } else {
        // Fallback: reset state
        setAnswers({})
        setGuessesRemaining(9)
        setGameOver(false)
      }
    } else {
      // Reset game state for new game
      setAnswers({})
      setGuessesRemaining(9)
      setGameOver(false)
    }

    setShowGameOverModal(false)
    setSelectedCell(null)
    setSearchTerm('')
    setShowHint(null)
    setShowShare(false)
    setAlreadyPlayed(hasPlayedNewLeague)

    // Update league (will trigger useEffect to reload data)
    setLeague(newLeague)
  }

  const handleCellDoubleClick = (rowId, colId) => {
    const cellKey = `${rowId}-${colId}`
    const answer = answers[cellKey]

    if (answer && answer.correct) {
      const row = grid.rows.find(r => r.id === rowId)
      const col = grid.columns.find(c => c.id === colId)

      setShowMomentDetail({
        player: answer.player,
        rowCategory: row.label,
        colCategory: col.label
      })
    }
  }

  const resetGame = async () => {
    try {
      const dailyGrid = await getDailyGrid(null, league)
      setGrid(dailyGrid)
      setAnswers({})
      setGuessesRemaining(9)
      setGameOver(false)
      setShowGameOverModal(false)
      setSelectedCell(null)
      setSearchTerm('')
      setShowHint(null)
      setShowShare(false)
      setAlreadyPlayed(false)
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
          <div className="spinner"></div>
          <h2>Loading NBA Top Shot Immaculate Grid...</h2>
          <p>Fetching data from blockchain...</p>
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

  if (!grid) {
    return <div className="app"><h2>Loading grid...</h2></div>
  }

  return (
    <div className="app">
      <header className="header">
        <h1>{league} Top Shot Immaculate Grid</h1>
        <p className="subtitle">Match players to their moments!</p>

        <div className="header-actions">
          <button className="header-btn" onClick={() => setShowStats(true)}>
            📊 Stats
          </button>
          {(gameOver || alreadyPlayed) && (
            <button className="header-btn congratulations-btn" onClick={() => setShowGameOverModal(true)}>
              🎉 View Results
            </button>
          )}
          <div className="stats-badge">
            🔥 {stats?.currentStreak || 0} streak
          </div>
        </div>
      </header>

      <LeagueSelector
        selectedLeague={league}
        onLeagueChange={handleLeagueChange}
        disabled={loading}
      />

      {alreadyPlayed && (
        <div className="already-played-banner">
          ✅ You've already played today! Come back tomorrow for a new grid.
        </div>
      )}

      <div className="game-stats">
        <div className="stat">
          <span className="stat-label">Guesses Remaining:</span>
          <span className="stat-value">{guessesRemaining}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Correct:</span>
          <span className="stat-value">{correctAnswers}/9</span>
        </div>
        <div className="stat">
          <span className="stat-label">Date:</span>
          <span className="stat-value">{todayDate}</span>
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
                    onDoubleClick={() => handleCellDoubleClick(row.id, col.id)}
                    title={answer?.correct ? 'Double-click to see moment details' : ''}
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

      <div className="game-hint">
        💡 Double-click correct answers to see moment details
      </div>

      {selectedCell && !gameOver && !alreadyPlayed && (
        <div className="search-container">
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

      {gameOver && showGameOverModal && (
        <div className="modal-overlay" onClick={() => setShowGameOverModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Game Over!</h2>
              <button className="close-btn" onClick={() => setShowGameOverModal(false)}>✕</button>
            </div>
            <p className="final-score">
              You got {correctAnswers} out of 9 correct!
            </p>
            {correctAnswers === 9 && (
              <p className="perfect-msg">🏆 Perfect Game!</p>
            )}
            <div className="game-over-actions">
              <button className="primary-btn" onClick={() => setShowShare(true)}>
                Share Result
              </button>
              <button className="secondary-btn" onClick={() => setShowStats(true)}>
                View Stats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showStats && <StatsDashboard onClose={() => setShowStats(false)} />}

      {showMomentDetail && (
        <MomentDetailModal
          player={showMomentDetail.player}
          rowCategory={showMomentDetail.rowCategory}
          colCategory={showMomentDetail.colCategory}
          onClose={() => setShowMomentDetail(null)}
        />
      )}

      {showShare && (
        <ShareModal
          date={todayDate}
          score={correctAnswers}
          answers={answers}
          league={league}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}

export default App
