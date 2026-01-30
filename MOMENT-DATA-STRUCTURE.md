# NBA Top Shot Moment Data Structure

## Overview

Every NBA Top Shot moment consists of three components:
1. **Play** - The basketball highlight (metadata about the play)
2. **Set** - The collection it belongs to (determines rarity/tier)
3. **Serial Number** - The unique edition number

## Raw Data from Flow Blockchain

When you fetch a play from the TopShot smart contract, you get this structure:

### Example: Play #1 (Trae Young)

```json
{
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
```

## Field Breakdown

### Player Identification
```javascript
{
  "FullName": "Trae Young",       // Complete name for display
  "FirstName": "Trae",            // First name only
  "LastName": "Young"             // Last name only
}
```

### Team Information
```javascript
{
  "TeamAtMoment": "Atlanta Hawks",      // Team when moment happened
  "TeamAtMomentNBAID": "1610612737",    // NBA's official team ID
  "HomeTeamName": "Atlanta Hawks",      // Home team in this game
  "AwayTeamName": "San Antonio Spurs"   // Away team in this game
}
```

**Important:** `TeamAtMoment` is the key field - this tells you which team the player was on when the moment occurred. This is what you use for your game grid!

### Moment Context
```javascript
{
  "NbaSeason": "2019-20",              // Which NBA season
  "DateOfMoment": "2019-11-06...",     // Exact date and time
  "PlayType": "Handles",                // Type of play (Dunk, 3PT, etc.)
  "PlayCategory": "Handles",            // Broader category
  "HomeTeamScore": "108",               // Final score - home
  "AwayTeamScore": "100"                // Final score - away
}
```

**Season Format:** `"2019-20"` means the 2019-2020 NBA season
**Play Types:** Dunk, Layup, Handles, Three-pointer, Block, Assist, Rebound, etc.

### Player Details
```javascript
{
  "JerseyNumber": "11",            // Jersey number
  "PlayerPosition": "G",           // Position abbreviation (G, F, C)
  "PrimaryPosition": "PG",         // Full position (PG, SG, SF, PF, C)
  "Height": "73",                  // Height in inches (73" = 6'1")
  "Weight": "180",                 // Weight in pounds
  "Birthdate": "1998-09-19",       // Date of birth
  "Birthplace": "Lubbock, TX, USA" // Where born
}
```

### Draft Information
```javascript
{
  "DraftTeam": "Dallas Mavericks",  // Team that drafted the player
  "DraftYear": "2018",              // Year drafted
  "DraftSelection": "5",            // Overall pick number
  "DraftRound": "1",                // Round number
  "TotalYearsExperience": "1"       // Years in NBA at time of moment
}
```

### Marketing
```javascript
{
  "Tagline": "Make 'em dance, Trae! Atlanta Hawks breakout star..."
  // Description of the moment for display
}
```

## Transformed Data for Game

Our `flowService.js` transforms the raw blockchain data into a simplified format for the game:

```javascript
{
  player: "Trae Young",           // FullName
  team: "Atlanta Hawks",          // TeamAtMoment
  tier: "Common",                 // Derived from set (see below)
  season: "2019-20",              // NbaSeason
  playID: 1,                      // Unique identifier
  playType: "Handles",            // PlayType
  dateOfMoment: "2019-11-06",     // DateOfMoment (simplified)
  metadata: { /* full raw data */ }
}
```

### Why This Format?

For the Immaculate Grid game, you only need:
- **player** - Who made the play
- **team** - Which team they were on
- **tier** - Rarity (Common/Rare/Legendary)
- **season** - When it happened

The rest is metadata for bonus features (showing moment details, etc.)

## Set Data (Determines Tier)

Sets group plays into collections and determine rarity:

```json
{
  "setID": "1",
  "name": "Genesis",
  "series": "0",
  "plays": [1, 2, 3, ...],
  "locked": true,
  "retired": { "1": true, "2": true, ... },
  "numberMintedPerPlay": { "1": "1", "2": "1", ... }
}
```

### Set Fields Explained

**setID** - Unique identifier for the set
**name** - Display name (e.g., "Genesis", "Series 1", "Playoffs")
**series** - Which series it belongs to (0, 1, 2, 3, etc.)
**plays** - Array of play IDs in this set
**locked** - If true, no more moments can be minted
**retired** - Individual plays that are retired
**numberMintedPerPlay** - How many of each moment exists

### Determining Tier from Sets

Common NBA Top Shot tiers:

| Tier | Description | Example Sets | Typical Circulation |
|------|-------------|--------------|---------------------|
| **Common** | Base moments, high circulation | Series 1, Series 2, Series 3 | 4,000-15,000+ |
| **Rare** | Special moments, lower circulation | Fandom, Metallic Gold, MGLE | 500-4,000 |
| **Legendary** | Ultimate moments, very rare | Ultimate, Championship | 25-500 |
| **Genesis** | First ever set, extremely rare | Genesis | 1 per play |

### Mapping Logic Example

```javascript
function determineTier(setName) {
  const name = setName.toLowerCase()

  // Genesis = Legendary (most exclusive)
  if (name === 'genesis') return 'Legendary'

  // Ultimate sets
  if (name.includes('ultimate')) return 'Legendary'
  if (name.includes('championship')) return 'Legendary'

  // Rare sets
  if (name.includes('fandom')) return 'Rare'
  if (name.includes('metallic')) return 'Rare'
  if (name.includes('rare')) return 'Rare'
  if (name.includes('mgle')) return 'Rare'

  // Everything else is Common (base sets)
  return 'Common'
}
```

## Complete Example: LeBron James

Let's see how a single player (LeBron) might have multiple moments:

```javascript
// Moment 1: LeBron Lakers Dunk (Common)
{
  player: "LeBron James",
  team: "Los Angeles Lakers",
  tier: "Common",        // From "Series 2" set
  season: "2020-21",
  playType: "Dunk",
  dateOfMoment: "2020-12-25"
}

// Moment 2: LeBron Lakers Legendary (Rare)
{
  player: "LeBron James",
  team: "Los Angeles Lakers",
  tier: "Legendary",     // From "Championship 2020" set
  season: "2019-20",
  playType: "Dunk",
  dateOfMoment: "2020-10-11"
}

// Moment 3: LeBron Heat (Common)
{
  player: "LeBron James",
  team: "Miami Heat",
  tier: "Common",        // From "Series 1" set
  season: "2019-20",
  playType: "Layup",
  dateOfMoment: "2019-12-10"
}

// Moment 4: LeBron Cavaliers (Rare)
{
  player: "LeBron James",
  team: "Cleveland Cavaliers",
  tier: "Rare",          // From "Fandom" set
  season: "2019-20",
  playType: "Three-pointer",
  dateOfMoment: "2020-01-15"
}
```

## How This Works in Your Game

### Example Grid Cell: Lakers × Legendary

Player answer: **"LeBron James"**

Validation logic checks:
1. Does LeBron have **any moment** with `team: "Los Angeles Lakers"`? ✓ Yes
2. Does LeBron have **any moment** with `tier: "Legendary"`? ✓ Yes
3. **Valid answer!** ✅

Note: These don't have to be the SAME moment. He just needs to have:
- At least one Lakers moment (any tier)
- At least one Legendary moment (any team)

### Example Grid Cell: Heat × Common

Player answer: **"LeBron James"**

Validation:
1. Does LeBron have a `team: "Miami Heat"` moment? ✓ Yes (Moment 3)
2. Does LeBron have a `tier: "Common"` moment? ✓ Yes (Moments 1 & 3)
3. **Valid answer!** ✅

## Data Usage Examples

### Get All Players

```javascript
import moments from './src/data/topshot-moments.json'

const uniquePlayers = [...new Set(moments.map(m => m.player))]
// ["LeBron James", "Trae Young", "Kyrie Irving", ...]
```

### Get All Teams

```javascript
const uniqueTeams = [...new Set(moments.map(m => m.team))]
// ["Lakers", "Hawks", "Nets", "Celtics", ...]
```

### Get All Play Types

```javascript
const playTypes = [...new Set(moments.map(m => m.playType))]
// ["Dunk", "Three-pointer", "Layup", "Block", "Assist", ...]
```

### Filter Moments by Criteria

```javascript
// Get all Lakers moments
const lakersMoments = moments.filter(m => m.team === "Los Angeles Lakers")

// Get all Legendary moments
const legendaryMoments = moments.filter(m => m.tier === "Legendary")

// Get all 2020-21 season moments
const season2021 = moments.filter(m => m.season === "2020-21")

// Get LeBron's Lakers moments
const lebronLakers = moments.filter(m =>
  m.player === "LeBron James" &&
  m.team === "Los Angeles Lakers"
)
```

### Validate Grid Answer

```javascript
function validateAnswer(playerName, rowCategory, colCategory, moments) {
  // Get all moments for this player
  const playerMoments = moments.filter(m => m.player === playerName)

  // Check row match
  const hasRowMatch = playerMoments.some(m =>
    m.team === rowCategory ||
    m.tier === rowCategory ||
    m.season === rowCategory
  )

  // Check column match
  const hasColMatch = playerMoments.some(m =>
    m.team === colCategory ||
    m.tier === colCategory ||
    m.season === colCategory
  )

  return hasRowMatch && hasColMatch
}
```

## Key Takeaways

1. **Play = The highlight** with all metadata (player, team, date, etc.)
2. **Set = The collection** that determines rarity/tier
3. **Moment = Play + Set + Serial** (the actual NFT)
4. **One player can have many moments** across different teams, tiers, and seasons
5. **For your game**, you only need: player, team, tier, season
6. **The rest is bonus data** for rich features (images, stats, descriptions)

---

**Next:** Once `fetch-moments.js` finishes, you'll have 500+ real moments to use in your game!
