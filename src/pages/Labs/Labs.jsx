import { useState, useEffect } from 'react'
import LabCard from '../../components/LabCard/LabCard'
import { labService } from '../../services/api'
import './Labs.css'

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard']
const CATEGORIES = ['all', 'networking', 'linux', 'exploitation', 'scripting', 'web', 'crypto']

export default function Labs() {
  const [labs, setLabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({ difficulty: 'all', category: 'all', search: '' })

  useEffect(() => {
    labService.getLabs()
      .then(setLabs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = labs.filter(lab => {
    if (filter.difficulty !== 'all' && lab.difficulty !== filter.difficulty) return false
    if (filter.category !== 'all' && lab.category !== filter.category) return false
    if (filter.search && !lab.title.toLowerCase().includes(filter.search.toLowerCase())
        && !lab.description.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  })

  return (
    <div className="page-wrapper labs-page">
      <div className="labs-header">
        <div>
          <h1 className="labs-title">Labs Catalog</h1>
          <p className="labs-sub text-secondary">
            {labs.length} labs available. Real containers. Real exploitation.
          </p>
        </div>
      </div>

      <div className="labs-controls">
        <input
          className="form-input labs-search"
          type="text"
          placeholder="Search labs..."
          value={filter.search}
          onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
        />

        <div className="filter-group">
          <span className="filter-label text-muted">Difficulty:</span>
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              className={`filter-btn ${filter.difficulty === d ? 'active' : ''} ${d !== 'all' ? `filter-${d}` : ''}`}
              onClick={() => setFilter(f => ({ ...f, difficulty: d }))}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <span className="filter-label text-muted">Category:</span>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`filter-btn ${filter.category === c ? 'active' : ''}`}
              onClick={() => setFilter(f => ({ ...f, category: c }))}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="labs-loading">
          <span className="spinner"></span>
          <span className="text-muted">Loading labs...</span>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="labs-count text-muted">
            Showing {filtered.length} of {labs.length} labs
          </div>
          <div className="labs-grid">
            {filtered.map(lab => (
              <LabCard key={lab.id} lab={lab} />
            ))}
            {filtered.length === 0 && (
              <div className="labs-empty text-muted">
                No labs match your filters.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
