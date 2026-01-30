// API service for communicating with backend

const API_BASE_URL = 'http://localhost:3001/api'

class APIError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
    this.name = 'APIError'
  }
}

async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    const data = await response.json()

    if (!response.ok) {
      throw new APIError(data.error || 'API request failed', response.status)
    }

    return data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    throw new APIError('Network error: ' + error.message, 0)
  }
}

// Get all moments
export async function getAllMoments(league = null) {
  const params = league ? `?league=${league}` : ''
  const response = await fetchAPI(`/moments${params}`)
  return response.data
}

// Get all players
export async function getAllPlayers(league = null) {
  const params = league ? `?league=${league}` : ''
  const response = await fetchAPI(`/players${params}`)
  return response.data
}

// Get player's moments
export async function getPlayerMoments(playerName, league = null) {
  const encodedName = encodeURIComponent(playerName)
  const params = league ? `?league=${league}` : ''
  const response = await fetchAPI(`/players/${encodedName}/moments${params}`)
  return response.data
}

// Validate player answer
export async function validatePlayer(playerName, rowCategory, colCategory, league = null) {
  const response = await fetchAPI('/validate', {
    method: 'POST',
    body: JSON.stringify({
      player: playerName,
      rowCategory,
      colCategory,
      league
    })
  })

  return {
    valid: response.valid,
    reason: response.reason
  }
}

// Get hint (valid players for a cell)
export async function getHint(rowCategory, colCategory, league = null) {
  const params = new URLSearchParams({
    row: rowCategory,
    col: colCategory
  })

  if (league) {
    params.append('league', league)
  }

  const response = await fetchAPI(`/hint?${params}`)
  return response.data
}

// Get categories
export async function getCategories(league = null) {
  const params = league ? `?league=${league}` : ''
  const response = await fetchAPI(`/categories${params}`)
  return response.data
}

// Get daily grid
export async function getDailyGrid(date = null, league = null) {
  const params = new URLSearchParams()
  if (date) params.append('date', date)
  if (league) params.append('league', league)

  const queryString = params.toString()
  const response = await fetchAPI(`/grid/daily${queryString ? '?' + queryString : ''}`)
  return response.data
}

// Get statistics
export async function getStats() {
  const response = await fetchAPI('/stats')
  return response.data
}

export default {
  getAllMoments,
  getAllPlayers,
  getPlayerMoments,
  validatePlayer,
  getHint,
  getCategories,
  getDailyGrid,
  getStats
}
