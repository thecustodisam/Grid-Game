// NBA Top Shot Moment Data Structure Examples
// =============================================

// EXAMPLE 1: Single Player, Multiple Moments
// -------------------------------------------
// LeBron James has moments across different teams, tiers, and seasons

const lebronMoments = [
  {
    // Lakers Common moment (Series 2)
    player: "LeBron James",
    team: "Los Angeles Lakers",
    tier: "Common",
    season: "2020-21",
    playType: "Dunk",
    dateOfMoment: "2020-12-25",
    playID: 245,
    metadata: {
      FullName: "LeBron James",
      TeamAtMoment: "Los Angeles Lakers",
      NbaSeason: "2020-21",
      PlayType: "Dunk",
      JerseyNumber: "23",
      Tagline: "King James with the monster dunk!"
    }
  },
  {
    // Lakers Legendary moment (Championship)
    player: "LeBron James",
    team: "Los Angeles Lakers",
    tier: "Legendary",
    season: "2019-20",
    playType: "Layup",
    dateOfMoment: "2020-10-11",
    playID: 189,
    metadata: {
      FullName: "LeBron James",
      TeamAtMoment: "Los Angeles Lakers",
      NbaSeason: "2019-20",
      PlayType: "Layup",
      Tagline: "Finals-clinching bucket!"
    }
  },
  {
    // Heat Common moment
    player: "LeBron James",
    team: "Miami Heat",
    tier: "Common",
    season: "2019-20",
    playType: "Three-pointer",
    dateOfMoment: "2019-12-10",
    playID: 156,
    metadata: {
      FullName: "LeBron James",
      TeamAtMoment: "Miami Heat",
      NbaSeason: "2019-20",
      PlayType: "Three-pointer"
    }
  },
  {
    // Cavaliers Rare moment
    player: "LeBron James",
    team: "Cleveland Cavaliers",
    tier: "Rare",
    season: "2019-20",
    playType: "Dunk",
    dateOfMoment: "2020-01-15",
    playID: 178,
    metadata: {
      FullName: "LeBron James",
      TeamAtMoment: "Cleveland Cavaliers",
      NbaSeason: "2019-20",
      PlayType: "Dunk"
    }
  }
]

// EXAMPLE 2: How Grid Validation Works
// -------------------------------------

// Grid Cell: Lakers (row) × Legendary (column)
// Question: Is "LeBron James" a valid answer?

function validateLakersLegendary() {
  const player = "LeBron James"
  const row = "Lakers"
  const col = "Legendary"

  // Check: Does LeBron have ANY Lakers moment?
  const hasLakers = lebronMoments.some(m =>
    m.team === "Los Angeles Lakers" || m.team === "Lakers"
  )
  console.log(`Has Lakers moment? ${hasLakers}`) // true

  // Check: Does LeBron have ANY Legendary moment?
  const hasLegendary = lebronMoments.some(m =>
    m.tier === "Legendary"
  )
  console.log(`Has Legendary moment? ${hasLegendary}`) // true

  // Result: Valid if BOTH are true
  const isValid = hasLakers && hasLegendary
  console.log(`Valid answer? ${isValid}`) // true ✓

  // Note: These don't have to be the SAME moment!
  // LeBron has: Lakers Common (moment 1) + Lakers Legendary (moment 2)
  // OR: Lakers moments + Legendary moment on any team
}

// EXAMPLE 3: Different Teams Case
// --------------------------------

// Grid Cell: Heat (row) × Cavaliers (column)
// Question: Is "LeBron James" a valid answer?

function validateHeatCavaliers() {
  const player = "LeBron James"
  const row = "Heat"
  const col = "Cavaliers"

  // Check Heat
  const hasHeat = lebronMoments.some(m =>
    m.team === "Miami Heat" || m.team === "Heat"
  )
  console.log(`Has Heat moment? ${hasHeat}`) // true (moment 3)

  // Check Cavaliers
  const hasCavs = lebronMoments.some(m =>
    m.team === "Cleveland Cavaliers" || m.team === "Cavaliers"
  )
  console.log(`Has Cavaliers moment? ${hasCavs}`) // true (moment 4)

  // Valid! LeBron played for both teams
  const isValid = hasHeat && hasCavs
  console.log(`Valid answer? ${isValid}`) // true ✓
}

// EXAMPLE 4: Invalid Answer
// --------------------------

// Grid Cell: Warriors (row) × 2021-22 (column)
// Question: Is "LeBron James" a valid answer?

function validateWarriors2122() {
  const player = "LeBron James"
  const row = "Warriors"
  const col = "2021-22"

  // Check Warriors
  const hasWarriors = lebronMoments.some(m =>
    m.team === "Golden State Warriors" || m.team === "Warriors"
  )
  console.log(`Has Warriors moment? ${hasWarriors}`) // false

  // Check 2021-22 season
  const has2122 = lebronMoments.some(m =>
    m.season === "2021-22"
  )
  console.log(`Has 2021-22 moment? ${has2122}`) // false

  // Invalid - LeBron never played for Warriors
  const isValid = hasWarriors && has2122
  console.log(`Valid answer? ${isValid}`) // false ✗
}

// EXAMPLE 5: Multiple Valid Answers per Cell
// -------------------------------------------

const allPlayers = [
  { player: "LeBron James", team: "Lakers", tier: "Legendary" },
  { player: "Anthony Davis", team: "Lakers", tier: "Legendary" },
  { player: "Anthony Davis", team: "Lakers", tier: "Common" },
  { player: "Kobe Bryant", team: "Lakers", tier: "Legendary" },
  { player: "Stephen Curry", team: "Warriors", tier: "Legendary" }
]

// Grid Cell: Lakers × Legendary
// Valid answers: LeBron James, Anthony Davis, Kobe Bryant
// Invalid answers: Stephen Curry (no Lakers moment)

function getValidAnswers(row, col, moments) {
  const uniquePlayers = [...new Set(moments.map(m => m.player))]

  return uniquePlayers.filter(playerName => {
    const playerMoments = moments.filter(m => m.player === playerName)

    const hasRowMatch = playerMoments.some(m =>
      m.team === row || m.tier === row || m.season === row
    )

    const hasColMatch = playerMoments.some(m =>
      m.team === col || m.tier === col || m.season === col
    )

    return hasRowMatch && hasColMatch
  })
}

const validForLakersLegendary = getValidAnswers("Lakers", "Legendary", allPlayers)
console.log(validForLakersLegendary)
// ["LeBron James", "Anthony Davis", "Kobe Bryant"]

// EXAMPLE 6: Real Data Structure from Flow
// -----------------------------------------

const realFlowData = {
  "playID": 1,
  "FullName": "Trae Young",
  "FirstName": "Trae",
  "LastName": "Young",
  "TeamAtMoment": "Atlanta Hawks",
  "TeamAtMomentNBAID": "1610612737",
  "NbaSeason": "2019-20",
  "DateOfMoment": "2019-11-06 00:30:00 +0000 UTC",
  "PlayType": "Handles",
  "PlayCategory": "Handles",
  "HomeTeamName": "Atlanta Hawks",
  "AwayTeamName": "San Antonio Spurs",
  "HomeTeamScore": "108",
  "AwayTeamScore": "100",
  "JerseyNumber": "11",
  "PlayerPosition": "G",
  "PrimaryPosition": "PG",
  "Height": "73",
  "Weight": "180",
  "Birthdate": "1998-09-19",
  "Birthplace": "Lubbock, TX, USA",
  "DraftTeam": "Dallas Mavericks",
  "DraftYear": "2018",
  "DraftSelection": "5",
  "DraftRound": "1",
  "TotalYearsExperience": "1",
  "Tagline": "Make 'em dance, Trae! Atlanta Hawks breakout star Trae Young shakes San Antonio Spurs vet Lamarcus Aldridge before dishing the rock for a sweet two-handed dunk on November 5, 2019."
}

// Transformed to game format:
const transformedData = {
  player: realFlowData.FullName,           // "Trae Young"
  team: realFlowData.TeamAtMoment,         // "Atlanta Hawks"
  tier: "Common",                           // From set data
  season: realFlowData.NbaSeason,          // "2019-20"
  playType: realFlowData.PlayType,         // "Handles"
  dateOfMoment: realFlowData.DateOfMoment.split(' ')[0], // "2019-11-06"
  playID: realFlowData.playID,             // 1
  metadata: realFlowData                    // Keep full data for bonus features
}

// EXAMPLE 7: Set Data and Tier Mapping
// -------------------------------------

const setExamples = [
  {
    setID: 1,
    name: "Genesis",
    series: 0,
    tier: "Legendary",  // Only 1 minted per play
    description: "The first ever NBA Top Shot set"
  },
  {
    setID: 2,
    name: "Series 1 Cool Cats",
    series: 1,
    tier: "Common",     // High circulation
    description: "Base set with popular players"
  },
  {
    setID: 15,
    name: "Fandom Series 2",
    series: 2,
    tier: "Rare",       // Lower circulation
    description: "Special fandom moments"
  },
  {
    setID: 42,
    name: "Championship 2020",
    series: 1,
    tier: "Legendary",  // Very limited
    description: "2020 NBA Finals moments"
  }
]

function determineTierFromSet(setName) {
  const name = setName.toLowerCase()

  if (name.includes('genesis')) return 'Legendary'
  if (name.includes('ultimate')) return 'Legendary'
  if (name.includes('championship')) return 'Legendary'

  if (name.includes('fandom')) return 'Rare'
  if (name.includes('metallic')) return 'Rare'
  if (name.includes('mgle')) return 'Rare'

  return 'Common' // Default for base sets
}

// Export examples
export {
  lebronMoments,
  validateLakersLegendary,
  validateHeatCavaliers,
  validateWarriors2122,
  getValidAnswers,
  realFlowData,
  transformedData,
  setExamples,
  determineTierFromSet
}
