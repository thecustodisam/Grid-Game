import express from 'express'
import dataService from './dataService.js'
import { getCached, getCacheStats, clearAllCache } from './cache.js'
import { generateSmartGrid } from '../services/gridGenerator.js'

const router = express.Router()

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Get all moments
router.get('/moments', (req, res) => {
  try {
    const { league } = req.query
    const cacheKey = league ? `all-moments-${league}` : 'all-moments'
    const moments = getCached(cacheKey, () => dataService.getAllMoments(league))
    res.json({
      success: true,
      league: league || 'all',
      count: moments.length,
      data: moments
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get all players
router.get('/players', (req, res) => {
  try {
    const { league } = req.query
    const cacheKey = league ? `all-players-${league}` : 'all-players'
    const players = getCached(cacheKey, () => dataService.getAllPlayers(league))
    res.json({
      success: true,
      league: league || 'all',
      count: players.length,
      data: players
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get player moments
router.get('/players/:name/moments', (req, res) => {
  try {
    const { name } = req.params
    const moments = dataService.getPlayerMoments(decodeURIComponent(name))

    res.json({
      success: true,
      player: name,
      count: moments.length,
      data: moments
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Validate player answer
router.post('/validate', (req, res) => {
  try {
    const { player, rowCategory, colCategory, league } = req.body

    if (!player || !rowCategory || !colCategory) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: player, rowCategory, colCategory'
      })
    }

    const result = dataService.validatePlayer(player, rowCategory, colCategory, league)

    res.json({
      success: true,
      league: league || 'all',
      ...result
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get hint (valid players for a cell)
router.get('/hint', (req, res) => {
  try {
    const { row, col, league } = req.query

    if (!row || !col) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query params: row, col'
      })
    }

    const cacheKey = league ? `hint-${row}-${col}-${league}` : `hint-${row}-${col}`
    const players = getCached(cacheKey, () =>
      dataService.getValidPlayers(row, col, league)
    )

    res.json({
      success: true,
      row,
      col,
      league: league || 'all',
      count: players.length,
      data: players
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get categories for grid generation
router.get('/categories', (req, res) => {
  try {
    const { league } = req.query
    const cacheKey = league ? `categories-${league}` : 'categories'
    const categories = getCached(cacheKey, () => ({
      teams: dataService.getTeams(league),
      tiers: dataService.getTiers(league),
      seasons: dataService.getSeasons(league),
      playTypes: dataService.getPlayTypes(league)
    }))

    res.json({
      success: true,
      league: league || 'all',
      data: categories
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get daily grid (smart generation)
router.get('/grid/daily', (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0]
    const league = req.query.league || null
    const cacheKey = league ? `grid-${date}-${league}` : `grid-${date}`

    // Use smart grid generation with difficulty balancing
    const grid = getCached(cacheKey, () => {
      return generateSmartGrid(date, league)
    }, 86400) // 24h TTL

    res.json({
      success: true,
      date,
      league: league || 'all',
      data: grid
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get grid analysis/difficulty
router.get('/grid/analyze', (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0]
    const { generateSmartGrid, analyzeGridDifficulty } = require('../services/gridGenerator.js')

    const grid = generateSmartGrid(date)
    const analysis = analyzeGridDifficulty(grid)

    res.json({
      success: true,
      date,
      grid,
      analysis
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get statistics
router.get('/stats', (req, res) => {
  try {
    const stats = getCached('stats', () => dataService.getStats())

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Cache management (admin endpoint)
router.get('/cache/stats', (req, res) => {
  const stats = getCacheStats()
  res.json({
    success: true,
    data: stats
  })
})

router.post('/cache/clear', (req, res) => {
  clearAllCache()
  res.json({
    success: true,
    message: 'Cache cleared'
  })
})

// Generate daily grid (simple implementation)
function generateDailyGrid(date) {
  // Use date as seed for consistent daily grids
  const seed = dateToSeed(date)
  const random = seededRandom(seed)

  const teams = dataService.getTeams()
  const tiers = dataService.getTiers()
  const seasons = dataService.getSeasons()

  // Pick random categories
  const shuffledTeams = shuffle([...teams], random)
  const shuffledTiers = shuffle([...tiers], random)
  const shuffledSeasons = shuffle([...seasons], random)

  // Decide: tier in rows or columns
  const tierInRows = random() > 0.5

  let rows, columns

  if (tierInRows) {
    rows = [
      { id: 'row1', label: shuffledTeams[0], type: 'team' },
      { id: 'row2', label: shuffledTeams[1], type: 'team' },
      { id: 'row3', label: shuffledTiers[0], type: 'tier' }
    ]
    columns = [
      { id: 'col1', label: shuffledTeams[2], type: 'team' },
      { id: 'col2', label: shuffledTeams[3], type: 'team' },
      { id: 'col3', label: shuffledSeasons[0], type: 'season' }
    ]
  } else {
    rows = [
      { id: 'row1', label: shuffledTeams[0], type: 'team' },
      { id: 'row2', label: shuffledTeams[1], type: 'team' },
      { id: 'row3', label: shuffledSeasons[0], type: 'season' }
    ]
    columns = [
      { id: 'col1', label: shuffledTeams[2], type: 'team' },
      { id: 'col2', label: shuffledTeams[3], type: 'team' },
      { id: 'col3', label: shuffledTiers[0], type: 'tier' }
    ]
  }

  return { rows, columns }
}

// Seeded random number generator
function seededRandom(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

function dateToSeed(dateString) {
  return dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

function shuffle(array, random) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export default router
