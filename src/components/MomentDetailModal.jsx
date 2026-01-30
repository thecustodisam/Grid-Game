import { useState, useEffect } from 'react'
import { getPlayerMoments } from '../services/apiService'
import './MomentDetailModal.css'

function MomentDetailModal({ player, rowCategory, colCategory, onClose }) {
  const [moments, setMoments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMoments()
  }, [player])

  async function fetchMoments() {
    try {
      setLoading(true)
      const allMoments = await getPlayerMoments(player)

      // Filter moments that match the cell criteria
      const matchingMoments = allMoments.filter(m => {
        const matchesRow = (
          m.team === rowCategory ||
          m.tier === rowCategory ||
          m.season === rowCategory ||
          m.playType === rowCategory
        )

        const matchesCol = (
          m.team === colCategory ||
          m.tier === colCategory ||
          m.season === colCategory ||
          m.playType === colCategory
        )

        return matchesRow && matchesCol
      })

      setMoments(matchingMoments)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching moments:', err)
      setError('Failed to load moment details')
      setLoading(false)
    }
  }

  return (
    <div className="moment-modal-overlay" onClick={onClose}>
      <div className="moment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="moment-header">
          <h2>{player}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="moment-criteria">
          <span className="criterion">{rowCategory}</span>
          <span className="separator">×</span>
          <span className="criterion">{colCategory}</span>
        </div>

        <div className="moment-content">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading moments...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && moments.length === 0 && (
            <div className="empty-state">
              <p>No matching moments found</p>
            </div>
          )}

          {!loading && !error && moments.length > 0 && (
            <>
              <div className="moment-count">
                {moments.length} matching moment{moments.length !== 1 ? 's' : ''}
              </div>

              <div className="moments-grid">
                {moments.map((moment, index) => (
                  <div key={index} className="moment-card">
                    <div className="moment-card-header">
                      <span className="moment-tier">{moment.tier}</span>
                      <span className="moment-play-type">{moment.playType}</span>
                    </div>

                    <div className="moment-details">
                      <div className="detail-row">
                        <span className="detail-label">Team:</span>
                        <span className="detail-value">{moment.team}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Season:</span>
                        <span className="detail-value">{moment.season}</span>
                      </div>
                      {moment.dateOfMoment && (
                        <div className="detail-row">
                          <span className="detail-label">Date:</span>
                          <span className="detail-value">
                            {formatDate(moment.dateOfMoment)}
                          </span>
                        </div>
                      )}
                    </div>

                    {moment.metadata?.Tagline && (
                      <div className="moment-tagline">
                        {moment.metadata.Tagline}
                      </div>
                    )}

                    <a
                      href={`https://nbatopshot.com/search?q=${encodeURIComponent(player)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="marketplace-link"
                    >
                      Search on NBA Top Shot →
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="moment-footer">
          <button className="secondary-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateString) {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

export default MomentDetailModal
