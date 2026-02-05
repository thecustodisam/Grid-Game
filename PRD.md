# Product Requirements Document: NBA Top Shot Immaculate Grid

## Product Overview

**Product Name:** NBA Top Shot Immaculate Grid
**Version:** 1.0 (Milestones 1-4 Complete)
**Last Updated:** February 5, 2026
**Status:** Production-Ready (Minor Issues)

### Elevator Pitch
A daily puzzle game inspired by baseball's Immaculate Grid, adapted for NBA Top Shot collectors. Players solve a 3x3 grid by finding NBA/WNBA players whose moments match both row and column categories, with 9 total guesses. Think "Wordle meets NBA trivia meets NFT collection knowledge."

### Key Value Proposition
- **For NBA Top Shot collectors:** Test and showcase your knowledge of the moment catalog
- **For casual fans:** Learn about NBA/WNBA players and their achievements through gameplay
- **For Dapper Labs:** Increase engagement with NBA Top Shot platform and moment discovery

---

## Goals and Objectives

### Primary Goals
1. **Engagement:** Drive daily active usage among NBA Top Shot collectors
2. **Education:** Help users discover moments they may want to collect
3. **Community:** Create shareable results that foster community discussion
4. **Retention:** Build daily play habits through streak mechanics

### Success Metrics
- Daily active players
- Completion rate (% of started games finished)
- Average guesses to completion
- Share rate (% who share results)
- Streak retention (7-day, 30-day)
- Cross-league play rate (users who play both NBA and WNBA)

---

## Target Audience

### Primary Audience
- **NBA Top Shot Collectors** (Active)
  - Own 10+ moments
  - Check platform weekly
  - Familiar with moment metadata (teams, seasons, play types, tiers)
  - Age: 25-45
  - Tech-savvy, blockchain-comfortable

### Secondary Audience
- **Casual Sports Fans**
  - Enjoy daily puzzle games (Wordle, Connections)
  - NBA/WNBA followers
  - May not own Top Shot moments yet
  - Potential new collectors

### Tertiary Audience
- **Competitive Puzzle Solvers**
  - Enjoy challenge and optimization
  - Share results on social media
  - Track personal statistics and streaks

---

## Core Features

### 1. Daily Grid Puzzle

#### Game Mechanics
- **Grid:** 3x3 matrix with category labels on rows and columns
- **Categories:** Teams, Seasons, Play Types, Tiers
- **Objective:** Fill all 9 cells with valid player names
- **Validation:** Player must have ≥1 moment matching row category AND ≥1 moment matching column category (can be different moments)
- **Attempts:** 9 total guesses for 9 cells
- **Timing:** One grid per league per day (resets at midnight)

#### Difficulty Balancing
- Smart grid generation ensures all cells have valid answers
- Mix of "easy" cells (common intersections) and "hard" cells (rare intersections)
- No impossible cells (minimum 1 valid answer per cell)

#### User Interface
- Clean, responsive 3x3 grid layout
- Category labels clearly visible
- Visual feedback on correct/incorrect guesses
- Guess counter display (e.g., "3/9 guesses used")
- Double-click cells to view moment details

### 2. League Selection

#### NBA and WNBA Separation
- Toggle between NBA and WNBA leagues
- Separate daily puzzles for each league
- Independent statistics tracking per league
- Users can play both leagues each day

#### Data Distribution
- NBA: 6,554 moments (1,145 players)
- WNBA: 1,045 moments (106 players)
- Total: 7,599 moments across 1,251 unique players

### 3. Statistics Dashboard

#### Personal Stats Tracked
- **Overview Metrics:**
  - Games played
  - Games won (all 9 correct)
  - Perfect games (9/9 on first try)
  - Win rate percentage

- **Streak Metrics:**
  - Current streak
  - Maximum streak achieved

- **Performance Metrics:**
  - Average guesses per game
  - Average score per game

- **Insights:**
  - Top 10 most-used players
  - Last 7 days results calendar
  - League-specific breakdowns

#### Data Visualization
- Bar charts for top players
- Calendar view for recent games
- Progress indicators for streaks
- Win rate pie charts

### 4. Sharing and Social

#### Wordle-Style Emoji Grids
- Generate shareable emoji representation:
  - ✅ = Correct guess
  - ❌ = Incorrect guess
- Include score and guesses used
- Copy to clipboard functionality
- Encourages social media sharing

#### Example Share Format
```
NBA Top Shot Grid - 2026-02-05
9/9 correct in 6 guesses 🎯

✅✅❌
✅❌✅
✅✅✅

Play at: [URL]
```

### 5. Hint System

#### Progressive Hints
- Button to reveal valid players for selected cell
- Shows ALL valid players who satisfy both categories
- Helps users learn and discover moment relationships
- No penalty for using hints (designed for education)

### 6. Moment Details

#### Metadata Viewer
- Double-click any cell to view moment details:
  - Player name and photo
  - Team(s) represented
  - Season(s)
  - Play type(s)
  - Tier(s)
  - Moment ID and serial number
- Helps users understand why answer is valid
- Educational tool for moment discovery

---

## Technical Architecture

### Frontend Stack
- **Framework:** React 19.0.0
- **Build Tool:** Vite 6.0.5
- **State Management:** React hooks + localStorage
- **Styling:** Vanilla CSS (no framework)
- **Blockchain:** @onflow/fcl 1.21.9 (Flow Client Library)

### Backend Stack
- **Runtime:** Node.js 18+ (ES modules)
- **Framework:** Express 5.2.1
- **Caching:** node-cache 5.1.2 (in-memory)
- **Middleware:** CORS, compression
- **Data Source:** Flow blockchain (NBA Top Shot smart contract)

### Data Layer

#### Static Data Files
- `topshot-moments.json` (11 MB, 7,599 moments)
- `topshot-players.json` (24 KB, 1,251 players)
- `categories.js` (predefined category definitions)

#### Data Indexing
Four indexes for O(1) lookups:
1. Player name → moments
2. Team → moments
3. Tier → moments
4. Season → moments

#### Caching Strategy
- In-memory cache with 85%+ hit rate
- Cache validation < 1ms
- Reduces API response time to < 10ms

### API Endpoints

| Endpoint | Method | Purpose | Response Time |
|----------|--------|---------|---------------|
| `/api/health` | GET | Health check | < 1ms |
| `/api/stats` | GET | System statistics | < 5ms |
| `/api/players` | GET | All players list | < 10ms |
| `/api/players?league=NBA` | GET | Filtered by league | < 10ms |
| `/api/moments` | GET | All moments | < 50ms |
| `/api/players/:name/moments` | GET | Player-specific moments | < 5ms |
| `/api/validate` | POST | Validate answer | < 1ms |
| `/api/hint` | GET | Get valid players for cell | < 10ms |
| `/api/categories` | GET | Available categories | < 5ms |
| `/api/grid/daily` | GET | Generate daily grid | < 5ms |

### Deployment

#### Current Setup
- **Frontend:** Vercel (production-ready)
- **Backend:** Vercel Serverless Functions (experiencing issues)
- **Alternative:** Railway or Render for backend recommended

#### Infrastructure Requirements
- Node.js 18+ runtime
- ~100 MB memory for backend
- Static file hosting for frontend
- Environment variables for API URLs

---

## User Flows

### First-Time User Flow
1. User lands on game page
2. Sees 3x3 grid with category labels
3. Optionally reads "How to Play" instructions
4. Selects a cell to guess
5. Types player name (autocomplete suggestions)
6. Submits guess → receives instant feedback
7. Continues until 9 guesses used or grid complete
8. Views statistics dashboard
9. Shares results on social media

### Returning User Flow
1. User lands on game page
2. Checks if already played today
3. If yes: Views stats and previous results
4. If no: Starts new daily grid
5. Switches to other league if desired
6. Reviews personal statistics
7. Compares results with friends

### Power User Flow
1. Plays both NBA and WNBA daily
2. Aims for perfect 9/9 games
3. Maintains long streaks
4. Uses hint system to learn new moments
5. Double-clicks cells to study moment metadata
6. Shares results daily
7. Tracks improvement over time

---

## Data Requirements

### Moment Data Structure
Each moment contains:
- `id`: Unique moment identifier
- `playID`: Play identifier
- `playerName`: Full player name
- `teamAtMoment`: Team when moment occurred
- `seasonYear`: NBA season (e.g., "2021-22")
- `tier`: Common, Rare, Legendary, Ultimate, Genesis
- `playType`: Dunk, 3-Pointer, Assist, Block, etc.
- `serialNumber`: NFT serial number
- `playDataID`: Additional metadata

### Category Definitions

#### Teams (69 NBA + 17 WNBA)
- All current and historical NBA teams
- All current and historical WNBA teams
- Examples: "Lakers", "Celtics", "Mercury", "Liberty"

#### Seasons (86 total)
- NBA: 2013-14 through 2025-26
- WNBA: 2018 through 2025

#### Play Types (13 types)
- Dunk, 3-Pointer, Assist, Block
- Handles, Rebound, Steal, Layup
- Midrange, Putback, Hook Shot
- Free Throw, Dribble Move

#### Tiers (5 levels)
- Common (most abundant)
- Rare
- Legendary
- Ultimate
- Genesis (rarest)

### Grid Generation Algorithm

#### Requirements
1. All 9 cells must have ≥1 valid answer
2. Balanced difficulty (mix of easy/hard cells)
3. Variety in categories (no repeated row/column categories)
4. Deterministic (same grid for all users on same day)

#### Process
1. Select 3 row categories randomly (weighted)
2. Select 3 column categories randomly (weighted)
3. Validate all 9 intersections have valid answers
4. If invalid, regenerate
5. Cache generated grid for 24 hours

---

## Non-Functional Requirements

### Performance
- **Frontend Load Time:** < 2 seconds
- **API Response Time:** < 50ms (p95)
- **Cache Hit Rate:** > 80%
- **Data Load Time:** < 1 second
- **UI Response:** Instant feedback on interactions

### Scalability
- Support 10,000+ concurrent users
- Handle 100,000+ API requests/day
- Minimal backend costs (caching-focused)

### Reliability
- 99.9% uptime target
- Graceful degradation if API fails
- localStorage backup for user data
- No data loss on browser refresh

### Security
- Read-only access to Flow blockchain
- No authentication required (stateless)
- CORS properly configured
- No sensitive data stored

### Accessibility
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Mobile responsive design

### Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Known Issues and Limitations

### Active Bugs

#### 1. League-Switching Bug (High Priority)
**Symptom:** After completing NBA game, switching to WNBA shows "Already played today"
**Expected:** Users should be able to play both leagues independently each day
**Status:** Code implemented but not working correctly
**Root Cause:** Suspected localStorage key collision or React state not updating
**Impact:** Users cannot play both leagues on same day
**Fix Required:** Debug hasPlayedToday() function and league-specific localStorage keys

#### 2. Vercel Serverless Functions Failure (Medium Priority)
**Symptom:** Backend functions fail with `FUNCTION_INVOCATION_FAILED`
**Expected:** Serverless functions should execute successfully
**Status:** Project-level corruption detected
**Root Cause:** Vercel platform issue with project configuration
**Impact:** Backend API not accessible when deployed to Vercel
**Workaround:** Deploy backend to Railway or Render instead

### Current Limitations

#### Data Freshness
- Moments data is static snapshot
- New moments require manual fetch and deploy
- No real-time blockchain synchronization
- Recommendation: Weekly automated fetch script

#### Offline Support
- Requires internet connection
- No progressive web app (PWA) features
- No offline data caching
- Recommendation: Implement service workers

#### Multiplayer Features
- No head-to-head mode
- No global leaderboards
- No friend comparisons
- Recommendation: Add backend user accounts

#### Customization
- No difficulty settings
- No custom grid size options
- No category preferences
- Recommendation: User settings panel

---

## Future Enhancements (Post-Launch)

### Phase 2 Features
- **User Accounts:** Save stats across devices
- **Global Leaderboards:** Compare with all players
- **Friend Challenges:** Send custom grids to friends
- **Historical Grids:** Play past daily grids
- **Achievements:** Unlock badges for milestones

### Phase 3 Features
- **Custom Grids:** Users create and share grids
- **Multiplayer Mode:** Race against others in real-time
- **Mobile App:** Native iOS/Android apps
- **Push Notifications:** Remind users of daily grid
- **In-Game Marketplace:** Link to Top Shot marketplace

### Technical Debt
- Add comprehensive test suite (unit + integration)
- Implement error tracking (Sentry)
- Add analytics (Mixpanel or Amplitude)
- Set up CI/CD pipeline
- Add performance monitoring
- Implement A/B testing framework

---

## Success Criteria

### Launch Criteria (MVP)
- ✅ Daily grid generation working
- ✅ NBA and WNBA leagues functional
- ✅ Statistics tracking implemented
- ✅ Share functionality working
- ✅ Hint system operational
- ✅ Moment details viewable
- ✅ Mobile responsive design
- ⚠️ Both leagues playable same day (bug fix needed)
- ⚠️ Stable backend deployment (migrate off Vercel)

### Post-Launch Success Metrics (30 Days)
- **Engagement:** 1,000+ daily active users
- **Retention:** 40%+ day-7 retention
- **Completion:** 70%+ game completion rate
- **Sharing:** 30%+ share rate
- **Cross-League:** 20%+ play both leagues
- **Performance:** < 100ms p95 response time

### Long-Term Success Metrics (6 Months)
- **Growth:** 10,000+ monthly active users
- **Retention:** 25%+ day-30 retention
- **Streaks:** 500+ users with 7+ day streaks
- **Community:** Active social media discussion
- **Revenue:** Potential monetization opportunities identified

---

## Open Questions

### Product Questions
1. Should we add difficulty levels (Easy/Medium/Hard)?
2. Do we want to penalize hint usage in scoring?
3. Should perfect games have special visual rewards?
4. Is there value in adding "Challenge Mode" (harder grids)?

### Technical Questions
1. Should we migrate backend to dedicated hosting?
2. Do we need real-time moment data updates?
3. Should we implement server-side rendering?
4. Is there value in building native mobile apps?

### Business Questions
1. What is the monetization strategy?
2. Should this be branded as official NBA Top Shot?
3. Do we need user authentication/accounts?
4. Should we integrate with Top Shot marketplace?

---

## Appendix

### Related Documents
- `README.md` - Full project documentation
- `STATUS.md` - Detailed current status
- `BACKEND-API.md` - API endpoint reference
- `START-HERE.md` - Quick start guide
- `PROGRESS-CHECKPOINT.md` - Latest development notes

### Key Metrics
- **Moments:** 7,599 total (6,554 NBA + 1,045 WNBA)
- **Players:** 1,251 unique (1,145 NBA + 106 WNBA)
- **Teams:** 86 total (69 NBA + 17 WNBA)
- **Seasons:** 86 total
- **Play Types:** 13 types
- **Tiers:** 5 levels
- **Code Size:** ~2,000 lines core application code
- **Documentation:** 18 markdown files

### Technology Links
- **Flow Blockchain:** https://flow.com
- **NBA Top Shot:** https://nbatopshot.com
- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev
- **Express Docs:** https://expressjs.com

---

## Document History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-02-05 | 1.0 | Claude Code | Initial PRD creation based on codebase exploration |

---

**Document Owner:** Product Team
**Technical Owner:** Engineering Team
**Stakeholders:** Dapper Labs, NBA Top Shot Community
**Review Cycle:** Monthly or after major milestone completion
