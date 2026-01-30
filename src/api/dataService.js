import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { LEAGUES, WNBA_TEAMS, isWNBAMoment, filterMomentsByLeague } from '../constants/leagues.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class DataService {
  constructor() {
    this.moments = []
    this.playerIndex = new Map() // player -> moments[]
    this.teamIndex = new Map()   // team -> moments[]
    this.tierIndex = new Map()   // tier -> moments[]
    this.seasonIndex = new Map() // season -> moments[]
    this.leagueIndex = new Map() // league -> moments[]
    this.players = []
    this.loaded = false
  }

  loadData() {
    if (this.loaded) return

    console.log('📂 Loading NBA Top Shot moment data...')

    try {
      const dataPath = join(__dirname, '../data/topshot-moments.json')
      const rawData = readFileSync(dataPath, 'utf-8')
      this.moments = JSON.parse(rawData)

      console.log(`✅ Loaded ${this.moments.length} moments`)

      // Build indexes for fast lookups
      this.buildIndexes()

      // Extract unique players
      this.players = [...new Set(this.moments.map(m => m.player))].sort()

      this.loaded = true
      console.log(`✅ Indexed ${this.players.length} players`)
    } catch (error) {
      console.error('❌ Error loading data:', error.message)
      throw error
    }
  }

  buildIndexes() {
    console.log('🔨 Building indexes...')

    this.moments.forEach(moment => {
      // Player index
      if (!this.playerIndex.has(moment.player)) {
        this.playerIndex.set(moment.player, [])
      }
      this.playerIndex.get(moment.player).push(moment)

      // Team index
      if (!this.teamIndex.has(moment.team)) {
        this.teamIndex.set(moment.team, [])
      }
      this.teamIndex.get(moment.team).push(moment)

      // Tier index
      if (!this.tierIndex.has(moment.tier)) {
        this.tierIndex.set(moment.tier, [])
      }
      this.tierIndex.get(moment.tier).push(moment)

      // Season index
      if (!this.seasonIndex.has(moment.season)) {
        this.seasonIndex.set(moment.season, [])
      }
      this.seasonIndex.get(moment.season).push(moment)

      // League index
      const league = isWNBAMoment(moment) ? LEAGUES.WNBA : LEAGUES.NBA
      if (!this.leagueIndex.has(league)) {
        this.leagueIndex.set(league, [])
      }
      this.leagueIndex.get(league).push(moment)
    })

    console.log(`✅ Indexes built:`)
    console.log(`   - ${this.playerIndex.size} players`)
    console.log(`   - ${this.teamIndex.size} teams`)
    console.log(`   - ${this.tierIndex.size} tiers`)
    console.log(`   - ${this.seasonIndex.size} seasons`)
    console.log(`   - ${this.leagueIndex.get(LEAGUES.NBA)?.length || 0} NBA moments`)
    console.log(`   - ${this.leagueIndex.get(LEAGUES.WNBA)?.length || 0} WNBA moments`)
  }

  getAllMoments(league = null) {
    if (league) {
      return this.leagueIndex.get(league) || []
    }
    return this.moments
  }

  getAllPlayers(league = null) {
    if (league) {
      const leagueMoments = this.getAllMoments(league)
      return [...new Set(leagueMoments.map(m => m.player))].sort()
    }
    return this.players
  }

  getPlayerMoments(playerName, league = null) {
    const moments = this.playerIndex.get(playerName) || []
    if (league) {
      return filterMomentsByLeague(moments, league)
    }
    return moments
  }

  getTeams(league = null) {
    if (league) {
      const leagueMoments = this.getAllMoments(league)
      return [...new Set(leagueMoments.map(m => m.team))].sort()
    }
    return [...this.teamIndex.keys()].sort()
  }

  getTiers(league = null) {
    if (league) {
      const leagueMoments = this.getAllMoments(league)
      return [...new Set(leagueMoments.map(m => m.tier))].sort()
    }
    return [...this.tierIndex.keys()].sort()
  }

  getSeasons(league = null) {
    if (league) {
      const leagueMoments = this.getAllMoments(league)
      return [...new Set(leagueMoments.map(m => m.season))].sort()
    }
    return [...this.seasonIndex.keys()].sort()
  }

  getPlayTypes(league = null) {
    const moments = league ? this.getAllMoments(league) : this.moments
    const types = new Set(moments.map(m => m.playType))
    return [...types].sort()
  }

  // Validate if a player is valid for a grid cell
  validatePlayer(playerName, rowCategory, colCategory, league = null) {
    const playerMoments = this.getPlayerMoments(playerName, league)

    if (playerMoments.length === 0) {
      return { valid: false, reason: 'Player not found' }
    }

    // Check if player has moments matching row category
    const hasRowMatch = playerMoments.some(m =>
      m.team === rowCategory ||
      m.tier === rowCategory ||
      m.season === rowCategory ||
      m.playType === rowCategory
    )

    // Check if player has moments matching column category
    const hasColMatch = playerMoments.some(m =>
      m.team === colCategory ||
      m.tier === colCategory ||
      m.season === colCategory ||
      m.playType === colCategory
    )

    const valid = hasRowMatch && hasColMatch

    return {
      valid,
      reason: valid ? 'Valid answer' : 'Player does not match criteria',
      rowMatch: hasRowMatch,
      colMatch: hasColMatch
    }
  }

  // Get valid players for a grid cell
  getValidPlayers(rowCategory, colCategory, league = null) {
    const players = this.getAllPlayers(league)
    return players.filter(playerName => {
      const result = this.validatePlayer(playerName, rowCategory, colCategory, league)
      return result.valid
    })
  }

  // Get statistics
  getStats(league = null) {
    if (league) {
      return {
        league,
        totalMoments: this.getAllMoments(league).length,
        uniquePlayers: this.getAllPlayers(league).length,
        teams: this.getTeams(league).length,
        tiers: this.getTiers(league).length,
        seasons: this.getSeasons(league).length,
        playTypes: this.getPlayTypes(league).length
      }
    }

    return {
      totalMoments: this.moments.length,
      uniquePlayers: this.players.length,
      teams: this.getTeams().length,
      tiers: this.getTiers().length,
      seasons: this.getSeasons().length,
      playTypes: this.getPlayTypes().length,
      nba: this.getStats(LEAGUES.NBA),
      wnba: this.getStats(LEAGUES.WNBA)
    }
  }
}

// Singleton instance
const dataService = new DataService()

export default dataService
