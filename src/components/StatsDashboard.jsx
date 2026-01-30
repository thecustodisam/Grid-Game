import { useState, useEffect } from 'react'
import {
  getStats,
  getWinRate,
  getAverageScore,
  getTopPlayers,
  getRecentResults
} from '../services/statsService'
import './StatsDashboard.css'

function StatsDashboard({ onClose }) {
  const [stats, setStats] = useState(null)
  const [winRate, setWinRate] = useState(0)
  const [avgScore, setAvgScore] = useState(0)
  const [topPlayers, setTopPlayers] = useState([])
  const [recentResults, setRecentResults] = useState([])

  useEffect(() => {
    loadStats()
  }, [])

  function loadStats() {
    setStats(getStats())
    setWinRate(getWinRate())
    setAvgScore(getAverageScore())
    setTopPlayers(getTopPlayers(10))
    setRecentResults(getRecentResults(7))
  }

  if (!stats) {
    return <div className="loading">Loading statistics...</div>
  }

  return (
    <div className="stats-dashboard-overlay" onClick={onClose}>
      <div className="stats-dashboard" onClick={(e) => e.stopPropagation()}>
        <div className="stats-header">
          <h2>📊 Your Statistics</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="stats-content">
          {/* Overview Stats */}
          <div className="stats-section">
            <h3>Overview</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.gamesPlayed}</div>
                <div className="stat-label">Games Played</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{avgScore.toFixed(1)}</div>
                <div className="stat-label">Avg Score</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{winRate.toFixed(0)}%</div>
                <div className="stat-label">Win Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.perfectGames}</div>
                <div className="stat-label">Perfect Games</div>
              </div>
            </div>
          </div>

          {/* Streaks */}
          <div className="stats-section">
            <h3>Streaks</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.currentStreak}</div>
                <div className="stat-label">Current Streak</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.maxStreak}</div>
                <div className="stat-label">Max Streak</div>
              </div>
            </div>
          </div>

          {/* Score Distribution */}
          <div className="stats-section">
            <h3>Score Distribution</h3>
            <div className="score-chart">
              {Object.entries(stats.scoreDistribution).map(([score, count]) => {
                const maxCount = Math.max(...Object.values(stats.scoreDistribution))
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0

                return (
                  <div key={score} className="score-bar">
                    <div className="score-label">{score}</div>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="score-count">{count}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Players */}
          <div className="stats-section">
            <h3>Most Used Players</h3>
            <div className="top-players-list">
              {topPlayers.length > 0 ? (
                topPlayers.map(({ player, count }, index) => (
                  <div key={player} className="player-item">
                    <span className="player-rank">#{index + 1}</span>
                    <span className="player-name">{player}</span>
                    <span className="player-count">{count}x</span>
                  </div>
                ))
              ) : (
                <div className="empty-state">No games played yet</div>
              )}
            </div>
          </div>

          {/* Recent Results */}
          <div className="stats-section">
            <h3>Recent Results (Last 7 Days)</h3>
            <div className="recent-results">
              {recentResults.length > 0 ? (
                recentResults.map(({ date, score }) => (
                  <div key={date} className="result-item">
                    <span className="result-date">{formatDate(date)}</span>
                    <span className="result-score">{score}/9</span>
                    <span className={`result-badge ${score === 9 ? 'perfect' : score >= 5 ? 'good' : 'ok'}`}>
                      {score === 9 ? '🏆' : score >= 5 ? '✓' : '○'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state">No recent results</div>
              )}
            </div>
          </div>
        </div>

        <div className="stats-footer">
          <button className="secondary-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateString === today.toISOString().split('T')[0]) {
    return 'Today'
  } else if (dateString === yesterday.toISOString().split('T')[0]) {
    return 'Yesterday'
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default StatsDashboard
