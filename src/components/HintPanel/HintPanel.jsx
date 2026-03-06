import { useState } from 'react'
import './HintPanel.css'

export default function HintPanel({ hints = [], onLoad, isLoading }) {
  const [revealed, setRevealed] = useState([])
  const [loaded, setLoaded] = useState(hints.length > 0)

  const handleLoad = async () => {
    if (onLoad) await onLoad()
    setLoaded(true)
  }

  const revealHint = (i) => {
    setRevealed(prev => prev.includes(i) ? prev : [...prev, i])
  }

  return (
    <div className="hint-panel">
      <div className="hint-panel-header">
        <span className="section-title">hints</span>
        <span className="hint-count text-muted">{hints.length} available</span>
      </div>

      {!loaded ? (
        <button className="btn btn-ghost btn-sm hint-load-btn" onClick={handleLoad} disabled={isLoading}>
          {isLoading ? <span className="spinner"></span> : '🔍 Reveal Hints'}
        </button>
      ) : (
        <div className="hints-list">
          {hints.map((hint, i) => (
            <div key={i} className={`hint-item ${revealed.includes(i) ? 'revealed' : 'hidden'}`}>
              <div className="hint-item-header" onClick={() => revealHint(i)}>
                <span className="hint-num">Hint {i + 1}</span>
                {!revealed.includes(i) && <span className="hint-reveal-btn">Click to reveal</span>}
              </div>
              {revealed.includes(i) && (
                <div className="hint-content">
                  <span className="hint-arrow">›</span>
                  <span>{hint}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
