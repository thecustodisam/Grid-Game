import { useState } from 'react'
import { generateShareText, copyShareText } from '../services/statsService'
import './ShareModal.css'

function ShareModal({ date, score, answers, league, onClose }) {
  const [copied, setCopied] = useState(false)

  const shareText = generateShareText(date, score, answers, league)

  async function handleCopy() {
    const success = await copyShareText(date, score, answers, league)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleTwitterShare() {
    const text = encodeURIComponent(shareText)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-header">
          <h2>🎉 Share Your Result</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="share-content">
          <div className="share-preview">
            <pre>{shareText}</pre>
          </div>

          <div className="share-actions">
            <button className="share-btn copy-btn" onClick={handleCopy}>
              {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>

            <button className="share-btn twitter-btn" onClick={handleTwitterShare}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Share on X / Twitter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareModal
