import { useState, useEffect } from 'react'
import { playgroundService } from '../../services/api'
import CodeEditor from '../../components/CodeEditor/CodeEditor'
import HintPanel from '../../components/HintPanel/HintPanel'
import './Playground.css'

export default function Playground() {
  const [problems, setProblems] = useState([])
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [code, setCode] = useState('')
  const [output, setOutput] = useState(null)
  const [running, setRunning] = useState(false)
  const [customCmd, setCustomCmd] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [error, setError] = useState('')
  const [hints, setHints] = useState([])
  const [tab, setTab] = useState('output') // 'output' | 'hints'
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    playgroundService.getProblems().then(setProblems).catch(e => setError(e.message))
  }, [])

  const loadProblem = async (id) => {
    const p = await playgroundService.getProblem(id)
    setSelectedProblem(p)
    setCode(p.starterCode)
    setOutput(null)
    setHints([])
    setTab('output')
  }

  const handleRun = async (useCustom = false) => {
    if (!selectedProblem) return
    setRunning(true)
    setOutput(null)
    setTab('output')
    try {
      const result = await playgroundService.runCode(
        selectedProblem.id,
        code,
        useCustom ? customCmd : null
      )
      setOutput(result)
    } catch (e) {
      setOutput({ stderr: e.message, exitCode: 1, elapsed: '—' })
    } finally {
      setRunning(false)
    }
  }

  const handleReset = () => {
    if (selectedProblem) setCode(selectedProblem.starterCode)
    setOutput(null)
  }

  const filtered = problems.filter(p => filter === 'all' || p.difficulty === filter)

  return (
    <div className="playground-page">
      {/* Problem Sidebar */}
      <div className="problem-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Problems</h2>
          <div className="sidebar-filters">
            {['all', 'easy', 'medium', 'hard'].map(d => (
              <button
                key={d}
                className={`sidebar-filter-btn ${filter === d ? 'active' : ''}`}
                onClick={() => setFilter(d)}
              >{d}</button>
            ))}
          </div>
        </div>
        <div className="problem-list">
          {filtered.map((p, i) => (
            <button
              key={p.id}
              className={`problem-item ${selectedProblem?.id === p.id ? 'active' : ''}`}
              onClick={() => loadProblem(p.id)}
            >
              <span className="problem-num text-muted">{i + 1}</span>
              <span className="problem-title">{p.title}</span>
              <span className={`badge badge-${p.difficulty}`}>{p.difficulty[0].toUpperCase()}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted" style={{padding:'20px',fontSize:13}}>No problems.</p>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="playground-main">
        {!selectedProblem ? (
          <div className="playground-empty">
            <span className="playground-empty-icon">{'{ }'}</span>
            <h2>C Programming Playground</h2>
            <p className="text-secondary">Select a problem from the sidebar to begin.</p>
          </div>
        ) : (
          <>
            {/* Problem Description */}
            <div className="problem-desc-bar">
              <div className="problem-desc-header">
                <h2 className="problem-name">{selectedProblem.title}</h2>
                <span className={`badge badge-${selectedProblem.difficulty}`}>{selectedProblem.difficulty}</span>
              </div>
              <p className="problem-desc-text text-secondary">{selectedProblem.description}</p>
              {selectedProblem.expectedOutput && (
                <div className="expected-output">
                  <span className="text-muted" style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase'}}>Expected output</span>
                  <code className="expected-code">{selectedProblem.expectedOutput}</code>
                </div>
              )}
            </div>

            {/* Editor + Output */}
            <div className="editor-output-split">
              {/* Editor */}
              <div className="editor-section">
                <div className="editor-toolbar">
                  <span className="section-title">editor</span>
                  <div className="editor-toolbar-btns">
                    <button className="btn btn-ghost btn-sm" onClick={handleReset}>↺ Reset</button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowCustom(s => !s)}
                    >
                      {showCustom ? 'Hide Custom Cmd' : 'Custom Command'}
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => handleRun(false)} disabled={running}>
                      {running ? <><span className="spinner" style={{width:12,height:12}}></span> Running...</> : '▶ Run Code'}
                    </button>
                  </div>
                </div>

                {showCustom && (
                  <div className="custom-cmd-row">
                    <input
                      className="form-input custom-cmd-input"
                      value={customCmd}
                      onChange={e => setCustomCmd(e.target.value)}
                      placeholder="./a.out arg1 arg2"
                    />
                    <button className="btn btn-outline-green btn-sm" onClick={() => handleRun(true)} disabled={running}>
                      Run
                    </button>
                  </div>
                )}

                <div className="editor-area">
                  <CodeEditor value={code} onChange={setCode} language="c" />
                </div>
              </div>

              {/* Output area */}
              <div className="output-section">
                <div className="output-tabs">
                  <button className={`output-tab ${tab === 'output' ? 'active' : ''}`} onClick={() => setTab('output')}>
                    Output
                  </button>
                  <button className={`output-tab ${tab === 'hints' ? 'active' : ''}`} onClick={() => setTab('hints')}>
                    Hints
                  </button>
                </div>

                {tab === 'output' && (
                  <div className="output-body">
                    {running && (
                      <div className="output-running">
                        <span className="spinner"></span>
                        <span className="text-muted">Compiling and running...</span>
                      </div>
                    )}
                    {!running && !output && (
                      <span className="text-muted output-placeholder">
                        Run your code to see output here.
                      </span>
                    )}
                    {output && (
                      <>
                        <div className="output-meta">
                          <span className={`exit-code ${output.exitCode === 0 ? 'ok' : 'err'}`}>
                            exit {output.exitCode}
                          </span>
                          <span className="text-muted">{output.elapsed}</span>
                        </div>
                        {output.stdout && (
                          <pre className="output-pre output-stdout">{output.stdout}</pre>
                        )}
                        {output.stderr && (
                          <pre className="output-pre output-stderr">{output.stderr}</pre>
                        )}
                      </>
                    )}
                  </div>
                )}

                {tab === 'hints' && (
                  <div className="output-body">
                    <HintPanel
                      hints={selectedProblem.hints || []}
                      isLoading={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
