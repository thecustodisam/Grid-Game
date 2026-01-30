# NBA Top Shot Flow Integration - Setup Complete! 🎉

## What We've Built

You now have a working integration with the NBA Top Shot blockchain that can fetch real moment data!

### Installed Packages
- `@onflow/fcl` - Flow Client Library for blockchain interaction
- `@onflow/types` - Type definitions for Cadence queries

### Created Files

1. **`src/services/flowService.js`** - Core Flow blockchain integration
   - `getNextPlayID()` - Get total number of plays
   - `getPlayMetadata(playID)` - Fetch specific play data
   - `getAllPlays(options)` - Batch fetch multiple plays
   - `getSetData(setID)` - Get set/rarity information
   - `transformPlayToMoment()` - Convert to game format

2. **`test-flow.js`** - Test script to verify integration
   - ✅ Successfully connected to Flow mainnet
   - ✅ Confirmed 7,864 total NBA Top Shot plays exist
   - ✅ Fetched and parsed real moment metadata

3. **`fetch-moments.js`** - Data fetching script
   - Currently running in background
   - Fetching 500 moments from blockchain
   - Will save to `src/data/topshot-moments.json`

## What We Discovered

From the Flow blockchain:

**Total Moments:** 7,864 plays available

**Sample Data:**
```javascript
{
  "player": "Trae Young",
  "team": "Atlanta Hawks",
  "season": "2019-20",
  "playType": "Handles",
  "dateOfMoment": "2019-11-06",
  "tier": "Common",
  "playID": 1
}
```

**Available Metadata Fields:**
- FullName, FirstName, LastName
- TeamAtMoment, TeamAtMomentNBAID
- NbaSeason, DateOfMoment
- PlayType, PlayCategory
- HomeTeamName, AwayTeamName
- JerseyNumber, Height, Weight
- And 10+ more fields!

## How to Use

### Test the Integration

```bash
node test-flow.js
```

This will:
- Connect to Flow blockchain
- Fetch sample moment data
- Display player information
- Verify everything works

### Fetch More Data

```bash
node fetch-moments.js
```

This will:
- Fetch 500 real NBA Top Shot moments
- Transform to game format
- Save to JSON files
- Takes ~5-10 minutes

You can adjust the batch size in `fetch-moments.js`:
```javascript
const BATCH_SIZE = 500 // Change this number
```

### Use in Your Game

Once data is fetched, you can import it:

```javascript
import moments from './src/data/topshot-moments.json'
import players from './src/data/topshot-players.json'

// Use real NBA Top Shot data
const uniquePlayers = players // Array of player names
const allMoments = moments // Array of moment objects
```

## Next Steps

### Option A: Use the Fetched Data (Quick Start)

1. Wait for `fetch-moments.js` to finish
2. Replace `src/data/players.js` with the generated JSON
3. Update your game to use real moment data
4. Deploy and play!

**Pros:** Fast, simple, works immediately
**Cons:** Static data, need to re-fetch manually for updates

### Option B: Build Live Integration (Advanced)

1. Create a backend API (Node.js + Express)
2. Fetch all 7,864 moments on server startup
3. Cache in database (PostgreSQL, MongoDB)
4. Serve via REST API
5. Update daily via cron job

**Pros:** Always up-to-date, scalable
**Cons:** More complex, requires hosting

### Option C: Hybrid Approach (Recommended)

1. Use fetched JSON for now
2. Build backend gradually
3. Switch to live data when ready

## API Examples

### Fetch Single Moment

```javascript
import { getPlayMetadata } from './src/services/flowService.js'

const play = await getPlayMetadata(1)
console.log(play.FullName) // "Trae Young"
console.log(play.TeamAtMoment) // "Atlanta Hawks"
```

### Fetch Multiple Moments

```javascript
import { getAllPlays } from './src/services/flowService.js'

const moments = await getAllPlays({
  limit: 100,
  startFrom: 1,
  onProgress: (p) => console.log(`${p.current}/${p.total}`)
})
```

### Get Set Information

```javascript
import { getSetData } from './src/services/flowService.js'

const set = await getSetData(1)
console.log(set.name) // "Genesis"
console.log(set.plays.length) // 150
```

## Troubleshooting

### Slow Fetching?
The Flow blockchain API has rate limits. The script includes 100ms delays between requests. This is normal.

### Deprecation Warnings?
You'll see warnings about UInt32 types. These don't affect functionality. We can fix them later by passing strings instead of numbers.

### Connection Errors?
Make sure you have internet connection. The script connects to:
`https://rest-mainnet.onflow.org`

## Resources

- [NBA Top Shot Smart Contracts](https://github.com/dapperlabs/nba-smart-contracts)
- [Flow JavaScript SDK](https://github.com/onflow/fcl-js)
- [Flow Documentation](https://developers.flow.com/)
- [Cadence Language](https://cadence-lang.org/)

## Current Status

✅ Flow SDK installed
✅ Connection to blockchain working
✅ Can query moment data
✅ Data transformation working
🔄 Fetching 500 moments (in progress)
⏳ Next: Integrate into game

---

**You're ready to build an NBA Top Shot Immaculate Grid with REAL blockchain data!** 🏀🎯
