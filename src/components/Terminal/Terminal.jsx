import { useEffect, useRef, useState } from 'react'
import './Terminal.css'

/**
 * Terminal component
 * 
 * In production: connects to wsUrl via WebSocket → Go backend → PTY → Docker container
 * In mock mode: renders an interactive fake terminal
 * 
 * WebSocket protocol:
 *   Send:  { type: 'input', data: '<char or sequence>' }
 *   Recv:  { type: 'output', data: '<stdout/stderr bytes>' }
 *         { type: 'resize', cols, rows }
 */
export default function Terminal({ wsUrl, containerId, isMock = true }) {
  const termRef = useRef(null)
  const wsRef = useRef(null)
  const inputRef = useRef('')
  const [lines, setLines] = useState([
    { type: 'system', text: '╔══════════════════════════════════════════════╗' },
    { type: 'system', text: '║   ProjectUnsafe Terminal  v1.0               ║' },
    { type: 'system', text: '╚══════════════════════════════════════════════╝' },
    { type: 'system', text: '' },
    { type: 'output', text: 'Connecting to container...' },
  ])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [cwd, setCwd] = useState('/root')

  const MOCK_ENV = {
    '/root': { files: ['readme.txt', 'challenge', '.bashrc'], dirs: ['Documents', 'tools'] },
    '/root/Documents': { files: ['notes.txt', 'flag.txt'], dirs: [] },
    '/root/tools': { files: ['exploit.py', 'scan.sh'], dirs: [] },
  }

  useEffect(() => {
    if (isMock) {
      setTimeout(() => {
        setConnected(true)
        setLines(prev => [...prev,
          { type: 'output', text: 'Connected to container (MOCK MODE)' },
          { type: 'output', text: 'Type commands below. This simulates a real PTY.' },
          { type: 'output', text: '' },
          { type: 'output', text: 'root@unsafe:~# ' + '' },
        ])
      }, 1000)
      return
    }

    // Real WebSocket connection
    if (!wsUrl) return
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      appendLine({ type: 'system', text: '[ws] Connected' })
    }

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'output') {
        appendLine({ type: 'output', text: msg.data })
      }
    }

    ws.onclose = () => {
      setConnected(false)
      appendLine({ type: 'system', text: '[ws] Disconnected' })
    }

    ws.onerror = () => {
      appendLine({ type: 'error', text: '[ws] Connection error' })
    }

    return () => ws.close()
  }, [wsUrl, isMock])

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight
    }
  }, [lines])

  const appendLine = (line) => {
    setLines(prev => [...prev, line])
  }

  const runMockCommand = (cmd) => {
    const parts = cmd.trim().split(/\s+/)
    const command = parts[0]
    const args = parts.slice(1)

    switch (command) {
      case 'ls':
        const env = MOCK_ENV[cwd]
        if (!env) return ['ls: cannot access directory']
        const items = [...env.dirs.map(d => `\x1b[34m${d}/\x1b[0m`), ...env.files]
        return [items.join('  ')]

      case 'pwd':
        return [cwd]

      case 'cd':
        const target = args[0] || '/root'
        const newPath = target.startsWith('/') ? target : `${cwd}/${target}`.replace('//', '/')
        if (MOCK_ENV[newPath]) {
          setCwd(newPath)
          return []
        }
        return [`bash: cd: ${target}: No such file or directory`]

      case 'cat':
        if (!args[0]) return ['cat: missing operand']
        if (args[0].includes('flag')) return ['CTF{m0ck_fl4g_y0u_f0und_1t}']
        if (args[0].includes('readme')) return [
          'Welcome to ProjectUnsafe Lab',
          'Complete the challenges to get the flag.',
          'Hint: look around carefully.'
        ]
        return [`cat: ${args[0]}: No such file or directory`]

      case 'whoami':
        return ['root']

      case 'id':
        return ['uid=0(root) gid=0(root) groups=0(root)']

      case 'uname':
        return ['Linux unsafe-container 6.1.0-unsafe #1 SMP x86_64 GNU/Linux']

      case 'echo':
        return [args.join(' ')]

      case 'help':
        return [
          'Available mock commands: ls, cd, pwd, cat, whoami, id, uname, echo, clear, help',
          'In production this is a real PTY connected to a Docker container.',
        ]

      case 'clear':
        setLines([])
        return []

      case 'exit':
        return ['Session ended. Use the Terminate button to destroy the container.']

      default:
        if (!command) return []
        return [`bash: ${command}: command not found`]
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!connected) return

    const cmd = input.trim()
    const prompt = `root@unsafe:${cwd.replace('/root', '~')}# `

    appendLine({ type: 'input', text: prompt + cmd })

    if (isMock) {
      const output = runMockCommand(cmd)
      output.forEach(line => appendLine({ type: 'output', text: line }))
    } else if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'input', data: cmd + '\n' }))
    }

    setInput('')
  }

  const prompt = `root@unsafe:${cwd.replace('/root', '~')}# `

  return (
    <div className="terminal-wrapper scanline-overlay">
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <span className="dot dot-red"></span>
          <span className="dot dot-yellow"></span>
          <span className="dot dot-green"></span>
        </div>
        <span className="terminal-title">
          {connected ? `bash — ${containerId || 'mock-container'}` : 'connecting...'}
        </span>
        <span className={`terminal-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '● LIVE' : '○ OFFLINE'}
        </span>
      </div>

      <div className="terminal-body" ref={termRef}>
        {lines.map((line, i) => (
          <div key={i} className={`term-line term-line-${line.type}`}>
            <span dangerouslySetInnerHTML={{ __html: line.text.replace(/\x1b\[34m(.*?)\x1b\[0m/g, '<span style="color:#58a6ff">$1</span>') }} />
          </div>
        ))}

        {connected && (
          <form className="terminal-input-row" onSubmit={handleSubmit}>
            <span className="terminal-prompt">{prompt}</span>
            <input
              className="terminal-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
            />
          </form>
        )}

        {!connected && (
          <div className="terminal-connecting">
            <span className="spinner" style={{ width: 12, height: 12 }}></span>
            <span className="text-muted">Waiting for container...</span>
          </div>
        )}
      </div>

      {isMock && (
        <div className="terminal-mock-notice">
          ⚠ MOCK MODE — Real labs use WebSocket → Go PTY → Docker
        </div>
      )}
    </div>
  )
}
