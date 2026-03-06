import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { labService } from '../../services/api'
import Terminal from '../../components/Terminal/Terminal'
import HintPanel from '../../components/HintPanel/HintPanel'
import './LabPage.css'

export default function LabPage() {
  const { labId } = useParams()
  const { isAuthenticated, isGuest } = useAuth()
  const navigate = useNavigate()

  const [lab, setLab] = useState(null)
  const [loading, setLoading] = useState(true)
  const [container, setContainer] = useState(null)
  const [starting, setStarting] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [terminating, setTerminating] = useState(false)
  const [hints, setHints] = useState([])
  const [hintsLoading, setHintsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [tab, setTab] = useState('description') // 'description' | 'hints'

  useEffect(() => {
    labService.getLab(labId)
      .then(data => {
        if (!data) { navigate('/labs'); return }
        setLab(data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))

    // Restore container from session
    const stored = sessionStorage.getItem('pu_container')
    if (stored) {
      try {
        const c = JSON.parse(stored)
        if (c.labId === labId) setContainer(c)
      } catch {}
    }
  }, [labId])

  const handleStart = async () => {
    if (isGuest) { navigate('/login'); return }

    // C Programming lab opens the playground directly
    if (lab.isPlayground) {
      navigate('/playground')
      return
    }

    setStarting(true)
    setError('')
    try {
      const data = await labService.startLab(labId)
      const c = { ...data, labId, labTitle: lab.title }
      setContainer(c)
      sessionStorage.setItem('pu_container', JSON.stringify(c))
    } catch (e) {
      setError(e.message)
    } finally {
      setStarting(false)
    }
  }

  const handleReset = async () => {
    if (!container) return
    setResetting(true)
    try { await labService.resetLab(container.containerId) }
    catch (e) { setError(e.message) }
    finally { setResetting(false) }
  }

  const handleTerminate = async () => {
    if (!container) return
    setTerminating(true)
    try {
      await labService.terminateLab(container.containerId)
      setContainer(null)
      sessionStorage.removeItem('pu_container')
    } catch (e) { setError(e.message) }
    finally { setTerminating(false) }
  }

  const handleLoadHints = async () => {
    setHintsLoading(true)
    try {
      const data = await labService.getHints(labId)
      setHints(data)
    } catch (e) { setError(e.message) }
    finally { setHintsLoading(false) }
  }

  const handleCopyCommand = () => {
    const cmd = `ssh root@unsafe-lab-${labId} -p ${container?.port || 32001}`
    navigator.clipboard.writeText(cmd)
    setCopyFeedback(true)
    setTimeout(() => setCopyFeedback(false), 2000)
  }

  if (loading) {
    return (
      <div className="page-wrapper" style={{display:'flex',alignItems:'center',gap:12}}>
        <span className="spinner"></span>
        <span className="text-muted">Loading lab...</span>
      </div>
    )
  }

  if (!lab) return null

  return (
    <div className={`lab-page ${lab?.isPlayground ? 'lab-page-solo' : ''}`}>
      {/* Left Panel */}
      <div className="lab-left-panel">
        <div className="lab-left-header">
          <Link to="/labs" className="back-link text-muted">← Labs</Link>
          <div className="lab-meta-row">
            <h1 className="lab-name">{lab.title}</h1>
            <span className={`badge badge-${lab.difficulty}`}>{lab.difficulty}</span>
          </div>
          <div className="lab-tags">
            {lab.tags?.map(t => <span key={t} className="lab-tag">#{t}</span>)}
          </div>
        </div>

        {/* Tab navigation */}
        <div className="lab-tabs">
          <button
            className={`lab-tab ${tab === 'description' ? 'active' : ''}`}
            onClick={() => setTab('description')}
          >Description</button>
          <button
            className={`lab-tab ${tab === 'hints' ? 'active' : ''}`}
            onClick={() => setTab('hints')}
          >Hints {lab.hints?.length > 0 && `(${lab.hints.length})`}</button>
        </div>

        {tab === 'description' && (
          <div className="lab-description-body">
            <p className="lab-long-desc">{lab.longDescription || lab.description}</p>
            {lab.estimatedTime && (
              <div className="lab-info-chips">
                <span className="lab-info-chip">⏱ {lab.estimatedTime}</span>
                <span className="lab-info-chip">👥 {lab.completions?.toLocaleString()} completions</span>
              </div>
            )}
          </div>
        )}

        {tab === 'hints' && (
          <div className="lab-hints-body">
            <HintPanel
              hints={hints.length > 0 ? hints : (lab.hints || [])}
              onLoad={handleLoadHints}
              isLoading={hintsLoading}
            />
          </div>
        )}

        {/* Control Panel */}
        <div className="lab-control-panel">
          <p className="section-title" style={{marginBottom:12}}>container</p>

          {error && <div className="alert alert-error" style={{marginBottom:12}}>{error}</div>}

          {container ? (
            <>
              <div className="container-info-row">
                <span className="status-dot running"></span>
                <span className="text-green" style={{fontSize:13}}>running</span>
                <span className="text-muted" style={{marginLeft:'auto',fontSize:11}}>{container.containerId}</span>
              </div>
              <div className="control-btn-grid">
                <button className="btn btn-ghost btn-sm" onClick={handleReset} disabled={resetting}>
                  {resetting ? <span className="spinner" style={{width:12,height:12}}></span> : '↺ Reset'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleTerminate} disabled={terminating}>
                  {terminating ? <span className="spinner" style={{width:12,height:12}}></span> : '✕ Terminate'}
                </button>
              </div>
              <button className="btn btn-ghost btn-sm copy-cmd-btn" onClick={handleCopyCommand}>
                {copyFeedback ? '✓ Copied!' : '📋 Copy SSH Command'}
              </button>
            </>
          ) : (
            <>
              {isGuest ? (
                <div className="lab-guest-msg">
                  <p className="text-secondary" style={{fontSize:13,marginBottom:12}}>
                    Login or play anonymously to start this lab
                  </p>
                  <div style={{display:'flex',gap:8}}>
                    <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
                    <Link to="/signup" className="btn btn-ghost btn-sm">Sign Up</Link>
                  </div>
                </div>
              ) : (
                <button
                  className="btn btn-primary start-lab-btn"
                  onClick={handleStart}
                  disabled={starting}
                >
                  {starting
                    ? <><span className="spinner" style={{width:14,height:14}}></span> Starting...</>
                    : lab.isPlayground ? '▶ Open Playground' : '▶ Launch Lab'
                  }
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel — Terminal (hidden for playground lab) */}
      {!lab.isPlayground && (
      <div className="lab-right-panel">
        <Terminal
          wsUrl={container?.wsUrl}
          containerId={container?.containerId}
          isMock={!container?.wsUrl || container?.wsUrl?.includes('mock')}
        />
      </div>
      )}
    </div>
  )
}
