import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './LabCard.css'

const CATEGORY_ICONS = {
  networking: '🌐',
  linux: '🐧',
  exploitation: '💀',
  scripting: '📜',
  web: '🕸️',
  crypto: '🔐',
}

export default function LabCard({ lab }) {
  const { isAuthenticated, isGuest } = useAuth()
  const { id, title, difficulty, description, hints, completions, estimatedTime, category, tags } = lab

  return (
    <div className="lab-card">
      <div className="lab-card-header">
        <div className="lab-card-meta">
          <span className="lab-category-icon">{CATEGORY_ICONS[category] || '⚙️'}</span>
          <span className={`badge badge-${difficulty}`}>{difficulty}</span>
        </div>
        <div className="lab-card-stats">
          <span className="lab-stat text-muted">{completions?.toLocaleString()} completions</span>
          <span className="lab-stat text-muted">⏱ {estimatedTime}</span>
        </div>
      </div>

      <h3 className="lab-card-title">{title}</h3>
      <p className="lab-card-desc">{description}</p>

      {hints?.length > 0 && (
        <div className="lab-hints-preview">
          <span className="section-title" style={{ marginBottom: 6 }}>hints preview</span>
          <div className="hint-preview-item">
            <span className="hint-icon">›</span>
            <span className="hint-text text-secondary">{hints[0]}</span>
          </div>
        </div>
      )}

      {tags && (
        <div className="lab-tags">
          {tags.map(tag => (
            <span key={tag} className="lab-tag">#{tag}</span>
          ))}
        </div>
      )}

      <div className="lab-card-footer">
        {isGuest ? (
          <div className="lab-locked-msg">
            <span className="text-muted">Login or play anonymously to start</span>
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
          </div>
        ) : (
          <Link to={`/labs/${id}`} className="btn btn-outline-green btn-sm lab-start-btn">
            Start Lab →
          </Link>
        )}
      </div>
    </div>
  )
}
