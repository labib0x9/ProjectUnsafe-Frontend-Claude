import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import './Landing.css'

export default function Landing() {
  const { loginAnonymous, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleAnon = async () => {
    setLoading(true)
    try {
      await loginAnonymous()
      navigate('/labs')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="landing">

      {/* ── IDENTITY BAR ── */}
      <div className="identity-bar">
        <span className="identity-bar-name">ProjectUnsafe</span>
        <span className="identity-bar-sep">//</span>
        <span className="identity-bar-motto">
          The only way to defend a system is to understand how it breaks.
        </span>
      </div>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-noise"></div>
        <div className="hero-grid-bg"></div>

        <div className="hero-content">
          <div className="who-we-are">
            <span className="who-label">WHO WE ARE</span>
            <p className="who-text">
              ProjectUnsafe is an open cybersecurity learning platform built for students,
              developers, and curious minds who want to understand systems from the inside out —
              not just read about them.
            </p>
          </div>

          <div className="motto-block">
            <div className="motto-line-accent"></div>
            <blockquote className="motto-quote">
              "Break it. Understand it.<br />
              <span className="motto-highlight">Own it.</span>"
            </blockquote>
          </div>

          <p className="hero-sub">
            Spin up real Linux containers in your browser. Exploit misconfigurations,
            overflow buffers, escalate privileges, and write C code that runs on real hardware.
            No VM. No setup. Just a shell.
          </p>

          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/labs" className="btn btn-primary btn-lg">Browse Labs →</Link>
            ) : (
              <>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleAnon}
                  disabled={loading}
                >
                  {loading ? <span className="spinner" style={{width:16,height:16}}></span> : '⚡ Start Hacking — No Login'}
                </button>
                <Link to="/signup" className="btn btn-ghost btn-lg">Create Free Account</Link>
              </>
            )}
          </div>

          <div className="hero-footnote">
            <span className="text-muted">Anonymous sessions last 30 min · No account required · All labs are sandboxed</span>
          </div>
        </div>

        {/* Terminal preview */}
        <div className="hero-terminal-preview">
          <div className="preview-titlebar">
            <div className="preview-dots">
              <span></span><span></span><span></span>
            </div>
            <span>bash — unsafe-container-a3f1</span>
          </div>
          <div className="preview-body">
            <div className="preview-line"><span className="preview-prompt">root@unsafe:~#</span> find / -perm -4000 2&gt;/dev/null</div>
            <div className="preview-line preview-out">/usr/bin/sudo</div>
            <div className="preview-line preview-out">/usr/bin/newgrp</div>
            <div className="preview-line preview-out">/usr/bin/pkexec</div>
            <div className="preview-line"><span className="preview-prompt">root@unsafe:~#</span> ./exploit.py --target pkexec</div>
            <div className="preview-line preview-green">[*] Sending payload...</div>
            <div className="preview-line preview-green">[+] Shell popped! uid=0(root)</div>
            <div className="preview-line"><span className="preview-prompt">root@unsafe:~#</span> cat /root/flag.txt</div>
            <div className="preview-line preview-green">CTF&#123;y0u_g0t_1t_0wn3r&#125;</div>
            <div className="preview-line blink-line"><span className="preview-prompt">root@unsafe:~#</span> <span className="cursor-blink">█</span></div>
          </div>
        </div>
      </section>

      {/* ── MISSION STRIP ── */}
      <section className="mission-strip">
        <div className="mission-inner">
          <div className="mission-item">
            <span className="mission-num">01</span>
            <div>
              <h3 className="mission-title">Learn by doing</h3>
              <p className="mission-desc">No slides. No theory-first. You get a shell, a challenge, and a hint system. The rest is up to you.</p>
            </div>
          </div>
          <div className="mission-divider"></div>
          <div className="mission-item">
            <span className="mission-num">02</span>
            <div>
              <h3 className="mission-title">Real environments</h3>
              <p className="mission-desc">Every lab is a live Docker container. Real Linux kernel. Real binaries. Real exploitation paths.</p>
            </div>
          </div>
          <div className="mission-divider"></div>
          <div className="mission-item">
            <span className="mission-num">03</span>
            <div>
              <h3 className="mission-title">Ethical hacking only</h3>
              <p className="mission-desc">All targets are isolated sandboxes we own and operate. Nothing here reaches the outside world.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <div className="features-header">
          <p className="section-title">what you get</p>
        </div>
        <div className="features-grid">
          {[
            { icon: '🐳', title: 'Real Containers', desc: 'Every lab runs in an isolated Docker container. Real Linux, real commands, real exploitation.', accent: 'green' },
            { icon: '⚡', title: 'Instant Start', desc: 'No VM downloads. Containers spin up in seconds. Get to hacking immediately.', accent: 'blue' },
            { icon: '📡', title: 'Browser Terminal', desc: 'xterm.js + WebSocket + PTY. Full terminal in your browser, connected to a real shell.', accent: 'purple' },
            { icon: '💀', title: 'C Playground', desc: 'Write, compile and run C code. Practice buffer overflows, malloc abuse, and syscalls.', accent: 'orange' },
            { icon: '🎯', title: 'Guided Hints', desc: 'Stuck? Reveal hints one at a time. Learn the concepts without being handed the answer.', accent: 'yellow' },
            { icon: '🏆', title: 'Track Progress', desc: 'Save your progress across sessions. Resume labs where you left off.', accent: 'green' },
          ].map((f) => (
            <div key={f.title} className={`feature-card feature-card-${f.accent}`}>
              <span className="feature-icon">{f.icon}</span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED LABS ── */}
      <section className="labs-preview-section">
        <div className="section-header-row">
          <p className="section-title">featured labs</p>
          <Link to="/labs" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        <div className="labs-preview-grid">
          {[
            { title: 'SSH Basics', diff: 'easy', cat: '🌐', desc: 'Keys, tunnels, and remote access fundamentals.' },
            { title: 'Stack Buffer Overflow', diff: 'hard', cat: '💀', desc: 'Smash the stack, hijack EIP, pop a shell.' },
            { title: 'File Permissions & SUID', diff: 'medium', cat: '🐧', desc: 'Escalate privileges via SUID misconfiguration.' },
          ].map(lab => (
            <div key={lab.title} className="lab-preview-card">
              <div className="lab-preview-top">
                <span>{lab.cat}</span>
                <span className={`badge badge-${lab.diff}`}>{lab.diff}</span>
              </div>
              <h3 className="lab-preview-title">{lab.title}</h3>
              <p className="lab-preview-desc text-secondary">{lab.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-motto text-muted">// ProjectUnsafe</div>
        <h2 className="cta-title">Ready to get your hands dirty?</h2>
        <p className="cta-sub text-secondary">No account required. A real shell in under 10 seconds.</p>
        <div className="cta-actions">
          <button className="btn btn-primary btn-lg" onClick={handleAnon} disabled={loading}>
            {loading ? <span className="spinner" style={{width:16,height:16}}></span> : '⚡ Start Anonymously'}
          </button>
          <Link to="/signup" className="btn btn-outline-green btn-lg">Create Free Account</Link>
        </div>
      </section>

    </div>
  )
}
