import { useRef } from 'react'
import './CodeEditor.css'

/**
 * CodeEditor — Monaco-based code editor for the C Playground.
 * Falls back to a styled textarea if Monaco is not available.
 */
export default function CodeEditor({ value, onChange, language = 'c', readOnly = false }) {
  const textareaRef = useRef(null)

  // Try to use Monaco if available; fall back to textarea
  // In prod, install @monaco-editor/react and use it here.
  // For now we use a styled textarea that mimics the Monaco look.

  const handleChange = (e) => {
    if (onChange) onChange(e.target.value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const newValue = value.substring(0, start) + '    ' + value.substring(end)
      onChange(newValue)
      setTimeout(() => {
        e.target.selectionStart = start + 4
        e.target.selectionEnd = start + 4
      }, 0)
    }
  }

  const lineCount = value.split('\n').length

  return (
    <div className="code-editor-wrapper">
      <div className="editor-header">
        <span className="editor-lang-badge">{language.toUpperCase()}</span>
        <span className="editor-filename">main.c</span>
        <span className="editor-lines text-muted">{lineCount} lines</span>
      </div>
      <div className="editor-body">
        <div className="editor-line-numbers">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="line-number">{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          wrap="off"
        />
      </div>
    </div>
  )
}
