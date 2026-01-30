// Statistics and Progress Tracking Service
// Uses localStorage to track user stats across sessions

const STATS_KEY = 'nba-topshot-grid-stats'
const RESULTS_KEY = 'nba-topshot-grid-results'

/**
 * Get user statistics
 */
export function getStats() {
  const stats = localStorage.getItem(STATS_KEY)
  return stats ? JSON.parse(stats) : getDefaultStats()
}

/**
 * Get default stats structure
 */
function getDefaultStats() {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    totalScore: 0,
    perfectGames: 0,
    scoreDistribution: {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0,
      5: 0, 6: 0, 7: 0, 8: 0, 9: 0
    },
    playerUsage: {}, // player name -> times used
    lastPlayed: null,
    firstPlayed: null
  }
}

/**
 * Save game result and update statistics
 */
export function saveGameResult(date, score, answers, gridData = null, league = 'NBA') {
  // Get current stats
  const stats = getStats()
  const results = getResults()

  // Create league-specific date key (e.g., "2026-01-29-NBA")
  const dateKey = `${date}-${league}`

  // Check if already played today for this league
  if (results[dateKey]) {
    console.log(`${league} game already played today, updating...`)
  }

  // Update stats
  stats.gamesPlayed++
  stats.totalScore += score
  stats.scoreDistribution[score] = (stats.scoreDistribution[score] || 0) + 1

  if (score === 9) {
    stats.perfectGames++
    stats.gamesWon++
  } else if (score >= 5) {
    stats.gamesWon++
  }

  // Update streak
  if (score >= 5) {
    // Check if played yesterday for this league
    const yesterday = getYesterdayDate(date)
    const yesterdayKey = `${yesterday}-${league}`
    if (results[yesterdayKey] && results[yesterdayKey].score >= 5) {
      stats.currentStreak++
    } else if (!stats.currentStreak) {
      stats.currentStreak = 1
    }
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak)
  } else {
    stats.currentStreak = 0
  }

  // Track player usage
  Object.values(answers).forEach(answer => {
    if (answer.correct && answer.player) {
      stats.playerUsage[answer.player] = (stats.playerUsage[answer.player] || 0) + 1
    }
  })

  // Update timestamps
  stats.lastPlayed = new Date().toISOString()
  if (!stats.firstPlayed) {
    stats.firstPlayed = new Date().toISOString()
  }

  // Save stats
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))

  // Save result with league-specific key
  results[dateKey] = {
    date,
    league,
    score,
    answers,
    timestamp: new Date().toISOString(),
    grid: gridData
  }
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results))

  return stats
}

/**
 * Get all game results
 */
export function getResults() {
  const results = localStorage.getItem(RESULTS_KEY)
  return results ? JSON.parse(results) : {}
}

/**
 * Get result for specific date
 */
export function getResultForDate(date, league = 'NBA') {
  const results = getResults()
  const dateKey = `${date}-${league}`
  return results[dateKey] || null
}

/**
 * Check if already played today
 */
export function hasPlayedToday(league = 'NBA') {
  const today = new Date().toISOString().split('T')[0]
  return !!getResultForDate(today, league)
}

/**
 * Get yesterday's date
 */
function getYesterdayDate(dateString) {
  const date = new Date(dateString)
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
}

/**
 * Calculate win rate
 */
export function getWinRate() {
  const stats = getStats()
  if (stats.gamesPlayed === 0) return 0
  return (stats.gamesWon / stats.gamesPlayed) * 100
}

/**
 * Calculate average score
 */
export function getAverageScore() {
  const stats = getStats()
  if (stats.gamesPlayed === 0) return 0
  return stats.totalScore / stats.gamesPlayed
}

/**
 * Get top players used
 */
export function getTopPlayers(limit = 10) {
  const stats = getStats()
  return Object.entries(stats.playerUsage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([player, count]) => ({ player, count }))
}

/**
 * Get recent results
 */
export function getRecentResults(limit = 7) {
  const results = getResults()
  return Object.entries(results)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .slice(0, limit)
    .map(([date, result]) => ({ date, ...result }))
}

/**
 * Generate share text (Wordle-style)
 */
export function generateShareText(date, score, answers, league = 'NBA') {
  const lines = []
  lines.push(`Chain to the Rim - ${league} ${date}`)
  lines.push(`${score}/9 ✅`)
  lines.push('')

  // Create 3x3 emoji grid
  const grid = ['row1', 'row2', 'row3'].map(rowId =>
    ['col1', 'col2', 'col3'].map(colId => {
      const key = `${rowId}-${colId}`
      const answer = answers[key]
      if (!answer) return '⬜'
      return answer.correct ? '🟩' : '🟥'
    }).join(' ')
  )

  lines.push(...grid)
  lines.push('')
  lines.push('Play at: https://yourgame.com')

  return lines.join('\n')
}

/**
 * Copy to clipboard
 */
export async function copyShareText(date, score, answers, league = 'NBA') {
  const text = generateShareText(date, score, answers, league)

  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy:', error)
    return false
  }
}

/**
 * Reset all stats (for debugging)
 */
export function resetStats() {
  localStorage.removeItem(STATS_KEY)
  localStorage.removeItem(RESULTS_KEY)
  return getDefaultStats()
}

/**
 * Export stats for backup
 */
export function exportStats() {
  return {
    stats: getStats(),
    results: getResults(),
    exportDate: new Date().toISOString()
  }
}

/**
 * Import stats from backup
 */
export function importStats(data) {
  if (data.stats) {
    localStorage.setItem(STATS_KEY, JSON.stringify(data.stats))
  }
  if (data.results) {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(data.results))
  }
}

export default {
  getStats,
  saveGameResult,
  getResults,
  getResultForDate,
  hasPlayedToday,
  getWinRate,
  getAverageScore,
  getTopPlayers,
  getRecentResults,
  generateShareText,
  copyShareText,
  resetStats,
  exportStats,
  importStats
}
