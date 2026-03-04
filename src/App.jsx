import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [file, setFile] = useState(null)
  const [apiUrl, setApiUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState(null) // null | 'loading' | 'success' | 'error'
  const [responseMsg, setResponseMsg] = useState('')
  const fileInputRef = useRef(null)

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f)
      setStatus(null)
      setResponseMsg('')
    } else {
      setStatus('error')
      setResponseMsg('Only PDF files are accepted.')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleFileInput = (e) => {
    handleFile(e.target.files[0])
  }

  const handleSubmit = async () => {
    if (!file) { setStatus('error'); setResponseMsg('Please select a PDF file.'); return }
    if (!apiUrl.trim()) { setStatus('error'); setResponseMsg('Please enter an API URL.'); return }

    setStatus('loading')
    setResponseMsg('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(apiUrl.trim(), {
        method: 'PUT',
        body: formData,
      })

      if (res.ok) {
        const text = await res.text()
        setStatus('success')
        setResponseMsg(text || `Success — HTTP ${res.status}`)
      } else {
        setStatus('error')
        setResponseMsg(`Request failed — HTTP ${res.status} ${res.statusText}`)
      }
    } catch (err) {
      setStatus('error')
      setResponseMsg(`Network error: ${err.message}`)
    }
  }

  const reset = () => {
    setFile(null)
    setStatus(null)
    setResponseMsg('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-logo">⬡</span>
        <h1>PDF Upload &amp; Send</h1>
        <p className="app-subtitle">Drop a PDF, set your endpoint, fire the request.</p>
      </header>

      <main className="app-main">
        {/* Drop Zone */}
        <div
          className={`drop-zone ${isDragging ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />
          {file ? (
            <div className="file-info">
              <span className="file-icon">📄</span>
              <div className="file-meta">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <button className="remove-btn" onClick={(e) => { e.stopPropagation(); reset() }}>✕</button>
            </div>
          ) : (
            <div className="drop-prompt">
              <span className="drop-icon">↑</span>
              <span>Drag &amp; drop a PDF here</span>
              <span className="drop-or">or click to browse</span>
            </div>
          )}
        </div>

        {/* URL Input */}
        <div className="field">
          <label htmlFor="api-url">PUT Endpoint URL</label>
          <input
            id="api-url"
            type="url"
            placeholder="https://your-api.com/upload"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="url-input"
          />
        </div>

        {/* Submit */}
        <button
          className={`submit-btn ${status === 'loading' ? 'loading' : ''}`}
          onClick={handleSubmit}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <span className="spinner" />
          ) : (
            'Send PUT Request'
          )}
        </button>

        {/* Status Banner */}
        {responseMsg && (
          <div className={`status-banner ${status}`}>
            <span className="status-icon">{status === 'success' ? '✓' : '✕'}</span>
            <span>{responseMsg}</span>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
