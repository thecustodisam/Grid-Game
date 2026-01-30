# 🎮 NBA Top Shot Immaculate Grid - Usage Guide

## Quick Start

### 1. Start the Backend

```bash
npm run server
```

You should see:
```
🚀 Starting NBA Top Shot Immaculate Grid API...
✅ Data loaded successfully
🎉 Server running on http://localhost:3001
📊 7599 moments loaded
```

### 2. Start the Frontend

```bash
npm run dev
```

Visit: http://localhost:5173

## Using the Enhanced Version

The enhanced app (`App-Enhanced.jsx`) includes all Milestone 3 features. To use it:

### Option 1: Quick Test
```bash
# Temporarily change the import in src/main.jsx
# Change: import App from './App.jsx'
# To: import App from './App-Enhanced.jsx'
```

### Option 2: Permanent Switch
```bash
# Backup original
cp src/App.jsx src/App-Original.jsx
cp src/App.css src/App-Original.css

# Replace with enhanced version
cp src/App-Enhanced.jsx src/App.jsx
cp src/App-Enhanced.css src/App.css

# Restart dev server
npm run dev
```

## Game Features

### 🎯 Playing the Game

1. **Select a Cell:** Click any empty cell in the 3×3 grid
2. **Search for Player:** Type player name in the search box
3. **Submit Answer:** Click on a player from the list
4. **Get Feedback:** Cell turns green (correct) or red (incorrect)
5. **Repeat:** You have 9 total guesses

### 💡 Getting Hints

- Click the **"?"** button in any empty cell
- See all valid players for that cell
- Note: This doesn't count as a guess!

### 🎬 Viewing Moment Details

- **Double-click** any correct (green) answer
- See all moments that player has matching those criteria
- View moment metadata: tier, play type, date, serial number
- Click marketplace links to see moments on NBA Top Shot

### 📊 Viewing Statistics

1. Click **"📊 Stats"** button in header
2. See your performance:
   - Total games played
   - Win rate
   - Current streak
   - Best streak
   - Score distribution chart
   - Most used players
   - Game history

### 🔥 Building Streaks

- Play every day to build your streak
- Miss a day = streak resets to 1
- Your best streak is always saved

### 📤 Sharing Results

After completing a game:
1. Share modal appears automatically
2. See Wordle-style emoji grid:
   - 🟩 = Correct answer
   - 🟥 = Incorrect answer
   - ⬜ = Empty cell
3. Click **"📋 Copy to Clipboard"** to copy
4. Click **"Share on X / Twitter"** to tweet

Example share format:
```
NBA Top Shot Immaculate Grid
2026-01-29

Score: 7/9 🔥

🟩 🟩 🟩
🟩 🟩 🟥
🟩 ⬜ 🟥

Play at: [your-url]
```

## Daily Challenges

### How It Works

- New grid generated every day at midnight
- Same grid for everyone on the same date
- Can only play once per day
- Come back tomorrow for a new challenge

### If You Already Played

- You'll see a green banner: "✅ You've already played today!"
- Grid is locked (can't make more guesses)
- You can still:
  - View your answers
  - See statistics
  - Double-click to view moment details
  - Share your results

## Understanding Categories

### Grid Categories

Each cell requires a player with:
- **At least ONE moment** matching the row category
- **At least ONE moment** matching the column category
- These can be different moments!

### Category Types

1. **Teams:** e.g., "Lakers", "Heat", "Warriors"
   - Player must have a moment from that team

2. **Tiers:** e.g., "Legendary", "Rare", "Common"
   - Player must have a moment with that tier

3. **Seasons:** e.g., "2019-20", "2020-21"
   - Player must have a moment from that season

4. **Play Types:** e.g., "Dunk", "3-Pointer", "Assist"
   - Player must have a moment with that play type

### Example

**Cell: Lakers × Legendary**

✅ Valid: **LeBron James**
- Has Lakers moments (when he played for Lakers)
- Has Legendary tier moments

❌ Invalid: **Stephen Curry**
- Has Legendary tier moments
- Does NOT have Lakers moments (never played for Lakers)

## Tips & Tricks

### 🎯 Strategy Tips

1. **Start with easier cells** - Look for common combinations
2. **Use hints strategically** - They're free and don't count against you
3. **Remember popular players** - LeBron, Curry, Durant have many moments
4. **Think about team history** - Who played for multiple teams?
5. **Consider tier distribution** - Legendary and Ultimate are rarest

### 📊 Maximizing Your Stats

- **Play every day** to maintain your streak
- **Check stats regularly** to track improvement
- **Share results** to compare with friends
- **Learn from mistakes** - view moment details to understand valid answers

### 🎬 Learning Player Moments

- Double-click correct answers to learn which moments exist
- Note which players have rare tier moments
- Remember players who played for multiple teams
- Look at play types to understand player specialties

## Troubleshooting

### Backend Not Running

**Error:** "Failed to load game data. Make sure the API server is running."

**Solution:**
```bash
# In a separate terminal
npm run server
```

### No Players Found

**Issue:** Searching for a player but nothing appears

**Check:**
- Are you spelling the name correctly?
- Try searching partial names (e.g., "LeBron" instead of "LeBron James")
- Use the hint feature to see valid players

### Statistics Not Saving

**Issue:** Stats reset after refresh

**Check:**
- localStorage is enabled in your browser
- You're not in private/incognito mode
- No browser extensions blocking localStorage

**Reset Stats:**
```javascript
// In browser console
localStorage.clear()
// Refresh page
```

### Can't Play Again Today

**Issue:** "You've already played today" banner showing

**This is expected behavior!**
- One game per day only
- Resets at midnight
- Come back tomorrow for new grid

**For testing purposes:**
```javascript
// In browser console (dev only)
localStorage.removeItem('topshot-grid-last-played')
localStorage.removeItem('topshot-grid-stats')
// Refresh page
```

### Grid Not Generating

**Issue:** Grid is empty or shows errors

**Check:**
1. Backend is running (`npm run server`)
2. API is accessible (visit http://localhost:3001/api/health)
3. Data files exist:
   - `src/data/topshot-moments.json`
   - `src/data/topshot-players.json`

## API Endpoints

### Available Endpoints

```bash
# Health check
GET http://localhost:3001/api/health

# Get today's grid
GET http://localhost:3001/api/grid/daily

# Get all players
GET http://localhost:3001/api/players

# Validate answer
POST http://localhost:3001/api/validate
Body: { "player": "LeBron James", "rowCategory": "Lakers", "colCategory": "Legendary" }

# Get hint
GET http://localhost:3001/api/hint?row=Lakers&col=Legendary

# Get player moments
GET http://localhost:3001/api/players/:name/moments
```

### Testing with cURL

```bash
# Test daily grid
curl http://localhost:3001/api/grid/daily

# Test validation
curl -X POST http://localhost:3001/api/validate \
  -H "Content-Type: application/json" \
  -d '{"player":"LeBron James","rowCategory":"Lakers","colCategory":"Legendary"}'
```

## Development

### File Structure

**Main Files:**
- `src/App-Enhanced.jsx` - Complete game with all features
- `src/services/gridGenerator.js` - Smart grid generation
- `src/services/statsService.js` - Statistics tracking

**Components:**
- `src/components/StatsDashboard.jsx` - Stats UI
- `src/components/MomentDetailModal.jsx` - Moment details
- `src/components/ShareModal.jsx` - Share functionality

**Backend:**
- `server.js` - Express API server
- `src/api/dataService.js` - Data management
- `src/api/routes.js` - API endpoints

### Making Changes

**Update Data:**
```bash
# Fetch latest moments from blockchain
node fetch-moments.js
# Restart server
npm run server
```

**Modify Grid Generation:**
```javascript
// Edit src/services/gridGenerator.js
// Change difficulty parameters
const MIN_VALID_PLAYERS = 3  // Minimum answers per cell
const MAX_VALID_PLAYERS = 10 // Maximum answers per cell
```

**Customize Stats:**
```javascript
// Edit src/services/statsService.js
// Add new statistics or modify tracking
```

## Keyboard Shortcuts

- **Escape** - Close any modal
- **Enter** - Submit player selection (when searching)
- **Tab** - Navigate through player list
- **Click outside modal** - Close modal

## Mobile Usage

All features work on mobile:
- Responsive grid layout
- Touch-friendly buttons
- Scrollable player lists
- Swipeable modals

## Browser Support

**Recommended:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required:**
- localStorage support
- ES6+ JavaScript
- CSS Grid support

## Privacy & Data

### What's Stored Locally

- Game statistics (localStorage)
- Game history (last 365 games)
- Last played date
- Player usage frequency

### What's NOT Stored

- Personal information
- Account data
- Payment information
- IP addresses

### Clearing Data

```javascript
// Browser console
localStorage.removeItem('topshot-grid-stats')
localStorage.removeItem('topshot-grid-last-played')
```

Or use browser settings: Clear Site Data

## Next Steps

1. **Play your first game** - Try to complete the grid!
2. **Check your stats** - See your performance
3. **Share your results** - Challenge friends
4. **Build a streak** - Play every day
5. **Explore moments** - Double-click correct answers

## Getting Help

**Documentation:**
- `MILESTONE-1-COMPLETE.md` - Flow integration
- `MILESTONE-2-COMPLETE.md` - Backend API
- `MILESTONE-3-COMPLETE.md` - Enhanced features
- `BACKEND-API.md` - API documentation

**Common Issues:**
- Make sure both frontend AND backend are running
- Check that data files exist in `src/data/`
- Verify API is accessible at http://localhost:3001
- Clear browser cache if seeing old data

## Have Fun! 🏀🎮

Enjoy playing NBA Top Shot Immaculate Grid!

Build your streak, share your results, and become a Top Shot expert! 🔥
