import { LEAGUES } from '../constants/leagues'
import './LeagueSelector.css'

function LeagueSelector({ selectedLeague, onLeagueChange, disabled = false }) {
  return (
    <div className="league-selector">
      <div className="league-buttons">
        <button
          className={`league-btn ${selectedLeague === LEAGUES.NBA ? 'active' : ''}`}
          onClick={() => onLeagueChange(LEAGUES.NBA)}
          disabled={disabled}
        >
          <span className="league-icon">🏀</span>
          <span className="league-name">NBA</span>
        </button>
        <button
          className={`league-btn ${selectedLeague === LEAGUES.WNBA ? 'active' : ''}`}
          onClick={() => onLeagueChange(LEAGUES.WNBA)}
          disabled={disabled}
        >
          <span className="league-icon">⭐</span>
          <span className="league-name">WNBA</span>
        </button>
      </div>
    </div>
  )
}

export default LeagueSelector
