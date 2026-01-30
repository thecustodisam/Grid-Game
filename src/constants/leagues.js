// League definitions and team mappings

export const LEAGUES = {
  NBA: 'NBA',
  WNBA: 'WNBA'
}

export const WNBA_TEAMS = [
  'Atlanta Dream',
  'Chicago Sky',
  'Connecticut Sun',
  'Dallas Wings',
  'Detroit Shock',
  'Golden State Valkyries',
  'Houston Comets',
  'Indiana Fever',
  'Las Vegas Aces',
  'Los Angeles Sparks',
  'Minnesota Lynx',
  'New York Liberty',
  'Phoenix Mercury',
  'Sacramento Monarchs',
  'San Antonio Silver Stars',
  'Seattle Storm',
  'Washington Mystics'
]

/**
 * Determine if a moment belongs to WNBA based on team name
 */
export function isWNBAMoment(moment) {
  return WNBA_TEAMS.includes(moment.team)
}

/**
 * Get league from moment
 */
export function getMomentLeague(moment) {
  return isWNBAMoment(moment) ? LEAGUES.WNBA : LEAGUES.NBA
}

/**
 * Filter moments by league
 */
export function filterMomentsByLeague(moments, league) {
  if (league === LEAGUES.WNBA) {
    return moments.filter(isWNBAMoment)
  } else if (league === LEAGUES.NBA) {
    return moments.filter(m => !isWNBAMoment(m))
  }
  return moments // Return all if no league specified
}
