# League-Specific Game Tracking ✅

## Problem

After completing an NBA game, users couldn't play the WNBA game on the same day. The "You've already played today!" banner would show for WNBA even though it's a different league.

## Root Cause

The stats service was tracking "played today" globally, not per league. It used the date as the key (e.g., `"2026-01-29"`) instead of date + league (e.g., `"2026-01-29-NBA"`).

## Solution

Updated the stats service to track games separately for each league.

### Changes Made

**1. League-Specific Keys**

Before:
```javascript
results["2026-01-29"] = { score: 9, ... }
```

After:
```javascript
results["2026-01-29-NBA"] = { score: 9, league: "NBA", ... }
results["2026-01-29-WNBA"] = { score: 7, league: "WNBA", ... }
```

**2. Updated Functions**

All stats functions now accept a `league` parameter:

```javascript
// statsService.js
saveGameResult(date, score, answers, grid, league = 'NBA')
hasPlayedToday(league = 'NBA')
getResultForDate(date, league = 'NBA')
generateShareText(date, score, answers, league = 'NBA')
copyShareText(date, score, answers, league = 'NBA')
```

**3. Updated Components**

- `App-Enhanced.jsx`: Passes league to all stats functions
- `ShareModal.jsx`: Accepts and uses league prop
- Share text now shows: "NBA Top Shot..." or "WNBA Top Shot..."

### How It Works Now

**Day 1:**
1. User plays NBA grid → Saves as `"2026-01-29-NBA"`
2. User switches to WNBA → Game is playable!
3. User plays WNBA grid → Saves as `"2026-01-29-WNBA"`
4. Both leagues show "You've already played today!" for their respective grids

**Day 2:**
1. New date: `"2026-01-30"`
2. Both NBA and WNBA grids are fresh and playable
3. User can complete both leagues again

### Data Structure

**Before (single key per day):**
```json
{
  "2026-01-29": {
    "score": 9,
    "answers": {...}
  }
}
```

**After (separate keys per league):**
```json
{
  "2026-01-29-NBA": {
    "date": "2026-01-29",
    "league": "NBA",
    "score": 9,
    "answers": {...}
  },
  "2026-01-29-WNBA": {
    "date": "2026-01-29",
    "league": "WNBA",
    "score": 7,
    "answers": {...}
  }
}
```

### Share Text Updates

**NBA Grid:**
```
NBA Top Shot Immaculate Grid 2026-01-29
9/9 ✅

🟩 🟩 🟩
🟩 🟩 🟩
🟩 🟩 🟩

Play at: https://yourgame.com
```

**WNBA Grid:**
```
WNBA Top Shot Immaculate Grid 2026-01-29
7/9 ✅

🟩 🟩 🟥
🟩 🟩 🟩
🟩 ⬜ 🟥

Play at: https://yourgame.com
```

### Benefits

✅ **Independent Games** - NBA and WNBA are separate daily challenges  
✅ **More Content** - Users can play twice per day (once per league)  
✅ **Better Engagement** - Doubles the daily play opportunities  
✅ **Clear Distinction** - Share text shows which league was played  
✅ **Backwards Compatible** - Old stats still work (treated as NBA)

### Files Modified

- `src/services/statsService.js`
- `src/App-Enhanced.jsx`
- `src/components/ShareModal.jsx`

### Testing

To verify the fix:

1. Complete an NBA grid
2. See "You've already played today!" for NBA
3. Switch to WNBA
4. WNBA grid should be playable (no banner)
5. Complete WNBA grid
6. Both leagues now show "already played" banner
7. Next day, both reset

### Migration Note

Existing stats in localStorage will continue to work. Old results without league keys will be treated as NBA games. No data loss occurs.

---

**Status:** Complete ✅  
**Date:** January 29, 2026  
**Impact:** Doubles daily engagement - users can now play 2 games per day
