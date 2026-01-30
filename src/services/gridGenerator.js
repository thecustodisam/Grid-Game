// Smart Grid Generation Algorithm
// Generates balanced, interesting grids with proper difficulty

import dataService from '../api/dataService.js'

const IDEAL_ANSWERS_PER_CELL = 6 // Target 3-10 valid answers per cell
const MIN_ANSWERS_PER_CELL = 1 // Absolute minimum - at least 1 valid answer
const PREFERRED_MIN_ANSWERS = 3 // Prefer at least 3 answers per cell
const MAX_ANSWERS_PER_CELL = 15
const GRID_GENERATION_ATTEMPTS = 200 // Increased attempts

/**
 * Generate a smart, balanced grid for a specific date and league
 */
export function generateSmartGrid(dateString = null, league = null) {
  const date = dateString || new Date().toISOString().split('T')[0]
  const seed = dateToSeed(date) + (league || '')
  const random = seededRandom(seed)

  console.log(`🎲 Generating ${league || 'mixed'} grid for ${date}...`)

  // Get available categories filtered by league
  const teams = dataService.getTeams(league)
  const tiers = dataService.getTiers(league)
  const seasons = dataService.getSeasons(league)
  const playTypes = dataService.getPlayTypes(league)

  console.log(`📊 Available categories: ${teams.length} teams, ${tiers.length} tiers, ${seasons.length} seasons, ${playTypes.length} play types`)

  // Try multiple grid combinations
  let bestGrid = null
  let bestScore = Infinity
  let validGridsFound = 0

  for (let attempt = 0; attempt < GRID_GENERATION_ATTEMPTS; attempt++) {
    const grid = generateGridCandidate(teams, tiers, seasons, playTypes, random, league)

    if (isValidGrid(grid, league)) {
      validGridsFound++
      const score = scoreGrid(grid, league)

      // Lower score is better (closer to ideal difficulty)
      if (score < bestScore) {
        bestScore = score
        bestGrid = grid
      }
    }
  }

  console.log(`📊 Found ${validGridsFound} valid grids out of ${GRID_GENERATION_ATTEMPTS} attempts`)

  if (!bestGrid) {
    console.warn('⚠️  No valid grid found, using fallback')
    return generateFallbackGrid(teams, tiers, seasons, random, league)
  }

  console.log(`✅ Generated grid with score ${bestScore.toFixed(2)}`)
  logGridStats(bestGrid, league)

  return bestGrid
}

/**
 * Generate a candidate grid configuration
 */
function generateGridCandidate(teams, tiers, seasons, playTypes, random, league = null) {
  // Shuffle all categories
  const shuffledTeams = shuffle([...teams], random)
  const shuffledTiers = shuffle([...tiers], random)
  const shuffledSeasons = shuffle([...seasons], random)
  const shuffledPlayTypes = shuffle([...playTypes], random)

  // Decide category distribution
  const usePlayTypes = random() > 0.6
  const tierInRows = random() > 0.5

  let rows, columns

  if (tierInRows) {
    // Rows: 2 teams + 1 tier
    // Columns: 2 teams/playTypes + 1 season
    rows = [
      { label: shuffledTeams[0], type: 'team' },
      { label: shuffledTeams[1], type: 'team' },
      { label: shuffledTiers[0], type: 'tier' }
    ]

    if (usePlayTypes) {
      columns = [
        { label: shuffledTeams[2], type: 'team' },
        { label: shuffledPlayTypes[0], type: 'playType' },
        { label: shuffledSeasons[0], type: 'season' }
      ]
    } else {
      columns = [
        { label: shuffledTeams[2], type: 'team' },
        { label: shuffledTeams[3], type: 'team' },
        { label: shuffledSeasons[0], type: 'season' }
      ]
    }
  } else {
    // Rows: 2 teams + 1 season/playType
    // Columns: 2 teams + 1 tier
    if (usePlayTypes && random() > 0.5) {
      rows = [
        { label: shuffledTeams[0], type: 'team' },
        { label: shuffledTeams[1], type: 'team' },
        { label: shuffledPlayTypes[0], type: 'playType' }
      ]
    } else {
      rows = [
        { label: shuffledTeams[0], type: 'team' },
        { label: shuffledTeams[1], type: 'team' },
        { label: shuffledSeasons[0], type: 'season' }
      ]
    }

    columns = [
      { label: shuffledTeams[2], type: 'team' },
      { label: shuffledTeams[3], type: 'team' },
      { label: shuffledTiers[0], type: 'tier' }
    ]
  }

  // Add IDs
  rows = rows.map((cat, i) => ({ id: `row${i + 1}`, ...cat }))
  columns = columns.map((cat, i) => ({ id: `col${i + 1}`, ...cat }))

  return { rows, columns }
}

/**
 * Score a grid based on difficulty (lower is better)
 */
function scoreGrid(grid, league = null) {
  let totalDeviation = 0
  let cellsWithNoAnswers = 0
  let cellsWithTooManyAnswers = 0

  grid.rows.forEach(row => {
    grid.columns.forEach(col => {
      const validPlayers = dataService.getValidPlayers(row.label, col.label, league)
      const count = validPlayers.length

      if (count === 0) {
        cellsWithNoAnswers++
        totalDeviation += 1000 // Heavy penalty for impossible cells
      } else if (count < MIN_ANSWERS_PER_CELL) {
        totalDeviation += (MIN_ANSWERS_PER_CELL - count) * 20
      } else if (count > MAX_ANSWERS_PER_CELL) {
        cellsWithTooManyAnswers++
        totalDeviation += (count - MAX_ANSWERS_PER_CELL) * 2
      } else {
        // Score based on distance from ideal
        totalDeviation += Math.abs(count - IDEAL_ANSWERS_PER_CELL)
      }
    })
  })

  // Heavily penalize grids with impossible cells
  if (cellsWithNoAnswers > 0) {
    totalDeviation += cellsWithNoAnswers * 10000
  }

  return totalDeviation
}

/**
 * Check if grid is valid (all cells have at least some answers)
 */
function isValidGrid(grid, league = null) {
  for (const row of grid.rows) {
    for (const col of grid.columns) {
      const validPlayers = dataService.getValidPlayers(row.label, col.label, league)
      // CRITICAL: Every cell must have at least MIN_ANSWERS_PER_CELL valid answers
      if (validPlayers.length < MIN_ANSWERS_PER_CELL) {
        console.log(`❌ Invalid cell: ${row.label} × ${col.label} = ${validPlayers.length} players (need ${MIN_ANSWERS_PER_CELL})`)
        return false
      }
    }
  }
  return true
}

/**
 * Generate a fallback grid (simple, guaranteed to work)
 * Uses mixed category types to ensure valid answers
 */
function generateFallbackGrid(teams, tiers, seasons, random, league = null) {
  console.log('⚠️  Generating fallback grid...')

  // Get teams with the most players (most likely to have overlaps)
  const teamsBySize = teams
    .map(team => {
      const moments = dataService.getAllMoments(league).filter(m => m.team === team)
      return {
        name: team,
        momentCount: moments.length,
        playerCount: new Set(moments.map(m => m.player)).size
      }
    })
    .filter(t => t.playerCount > 0)
    .sort((a, b) => b.playerCount - a.playerCount)

  console.log(`📊 Top teams by player count:`, teamsBySize.slice(0, 5))

  const topTeams = teamsBySize.slice(0, Math.min(10, teamsBySize.length)).map(t => t.name)

  // Strategy 1: Try team × team grids
  const shuffledTeams = shuffle([...topTeams], random)
  for (let i = 0; i < 50; i++) {
    const grid = {
      rows: [
        { id: 'row1', label: shuffledTeams[i % topTeams.length], type: 'team' },
        { id: 'row2', label: shuffledTeams[(i + 1) % topTeams.length], type: 'team' },
        { id: 'row3', label: shuffledTeams[(i + 2) % topTeams.length], type: 'team' }
      ],
      columns: [
        { id: 'col1', label: shuffledTeams[(i + 3) % topTeams.length], type: 'team' },
        { id: 'col2', label: shuffledTeams[(i + 4) % topTeams.length], type: 'team' },
        { id: 'col3', label: shuffledTeams[(i + 5) % topTeams.length], type: 'team' }
      ]
    }

    if (isValidGrid(grid, league)) {
      console.log('✅ Fallback grid (team×team) generated successfully')
      return grid
    }
  }

  // Strategy 2: Use mixed categories (teams × seasons) - more likely to have overlaps
  if (seasons && seasons.length > 0) {
    const shuffledSeasons = shuffle([...seasons], random)
    for (let i = 0; i < 50; i++) {
      const grid = {
        rows: [
          { id: 'row1', label: topTeams[i % topTeams.length], type: 'team' },
          { id: 'row2', label: topTeams[(i + 1) % topTeams.length], type: 'team' },
          { id: 'row3', label: topTeams[(i + 2) % topTeams.length], type: 'team' }
        ],
        columns: [
          { id: 'col1', label: shuffledSeasons[0], type: 'season' },
          { id: 'col2', label: shuffledSeasons[Math.min(1, shuffledSeasons.length - 1)], type: 'season' },
          { id: 'col3', label: shuffledSeasons[Math.min(2, shuffledSeasons.length - 1)], type: 'season' }
        ]
      }

      if (isValidGrid(grid, league)) {
        console.log('✅ Fallback grid (team×season) generated successfully')
        return grid
      }
    }
  }

  // Strategy 3: Use tiers (almost always works)
  if (tiers && tiers.length > 0) {
    const grid = {
      rows: [
        { id: 'row1', label: topTeams[0], type: 'team' },
        { id: 'row2', label: topTeams[1], type: 'team' },
        { id: 'row3', label: topTeams[2], type: 'team' }
      ],
      columns: [
        { id: 'col1', label: tiers[0], type: 'tier' },
        { id: 'col2', label: topTeams[3], type: 'team' },
        { id: 'col3', label: topTeams[4], type: 'team' }
      ]
    }

    if (isValidGrid(grid, league)) {
      console.log('✅ Fallback grid (team×tier) generated successfully')
      return grid
    }
  }

  // Last resort: return simplest possible grid (should never reach here)
  console.error('❌ Could not generate valid fallback grid! Returning basic grid anyway.')
  return {
    rows: [
      { id: 'row1', label: topTeams[0], type: 'team' },
      { id: 'row2', label: topTeams[1], type: 'team' },
      { id: 'row3', label: topTeams[2], type: 'team' }
    ],
    columns: [
      { id: 'col1', label: topTeams[0], type: 'team' }, // Same team - guaranteed overlap
      { id: 'col2', label: topTeams[1], type: 'team' },
      { id: 'col3', label: topTeams[2], type: 'team' }
    ]
  }
}

/**
 * Log grid statistics for debugging
 */
function logGridStats(grid, league = null) {
  console.log('📊 Grid Statistics:')
  console.log('Rows:', grid.rows.map(r => `${r.label} (${r.type})`).join(', '))
  console.log('Cols:', grid.columns.map(c => `${c.label} (${c.type})`).join(', '))

  let totalAnswers = 0
  let minAnswers = Infinity
  let maxAnswers = 0

  grid.rows.forEach((row, i) => {
    grid.columns.forEach((col, j) => {
      const count = dataService.getValidPlayers(row.label, col.label, league).length
      totalAnswers += count
      minAnswers = Math.min(minAnswers, count)
      maxAnswers = Math.max(maxAnswers, count)
    })
  })

  const avgAnswers = totalAnswers / 9

  console.log(`Answers per cell: avg=${avgAnswers.toFixed(1)}, min=${minAnswers}, max=${maxAnswers}`)
  console.log(`Difficulty: ${getDifficultyLabel(avgAnswers)}`)
}

/**
 * Get difficulty label based on average answers
 */
function getDifficultyLabel(avgAnswers) {
  if (avgAnswers < 4) return '🔥 Very Hard'
  if (avgAnswers < 6) return '⚡ Hard'
  if (avgAnswers < 8) return '⭐ Medium'
  if (avgAnswers < 12) return '✨ Easy'
  return '🎯 Very Easy'
}

/**
 * Seeded random number generator
 */
function seededRandom(seed) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

/**
 * Convert date string to seed number
 */
function dateToSeed(dateString) {
  return dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

/**
 * Shuffle array with seeded random
 */
function shuffle(array, random) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Analyze grid difficulty
 */
export function analyzeGridDifficulty(grid) {
  const cellDifficulties = []

  grid.rows.forEach(row => {
    grid.columns.forEach(col => {
      const validPlayers = dataService.getValidPlayers(row.label, col.label)
      cellDifficulties.push({
        row: row.label,
        col: col.label,
        count: validPlayers.length,
        difficulty: validPlayers.length < 5 ? 'hard' : validPlayers.length < 10 ? 'medium' : 'easy'
      })
    })
  })

  return {
    cells: cellDifficulties,
    averageAnswers: cellDifficulties.reduce((sum, c) => sum + c.count, 0) / 9,
    hardestCell: cellDifficulties.reduce((min, c) => c.count < min.count ? c : min),
    easiestCell: cellDifficulties.reduce((max, c) => c.count > max.count ? c : max)
  }
}

export default {
  generateSmartGrid,
  analyzeGridDifficulty
}
