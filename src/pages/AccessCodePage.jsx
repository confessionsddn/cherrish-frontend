import { useState, useEffect } from 'react'
import './AccessCodePage.css'
import { API_URL } from '../services/api';

export default function AccessCodePage() {
  const [accessCode, setAccessCode] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState('')
  const [regData, setRegData] = useState(null)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestStatus, setRequestStatus] = useState(null)
  const [autoCheckInterval, setAutoCheckInterval] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encodedData = params.get('data')
    
    if (encodedData) {
      try {
        const jsonString = atob(encodedData)
        const data = JSON.parse(jsonString)
        
        if (data.email && data.googleId) {
          setRegData(data)
          checkRequestStatus(data.email)
        } else {
          setError('Invalid registration data')
          setErrorType('left')
        }
      } catch (err) {
        console.error('Failed to decode registration data:', err)
        setError('Invalid registration session.')
        setErrorType('left')
      }
    } else {
      setError('No registration data found.')
      setErrorType('left')
    }

    return () => {
      if (autoCheckInterval) clearInterval(autoCheckInterval)
    }
  }, [])

  const checkRequestStatus = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/access-requests/status/${email}`)
      const data = await response.json()
      
      if (data.success && data.status !== 'none') {
        setRequestStatus(data)
        setInstagramHandle(data.instagramHandle || '')
        
        if (data.status === 'approved' && data.generatedCode) {
          setAccessCode(data.generatedCode)
        }
        
        if (data.status === 'pending') {
          const interval = setInterval(() => {
            checkRequestStatus(email)
          }, 30000)
          setAutoCheckInterval(interval)
        }
      }
    } catch (err) {
      console.error('Failed to check request status:', err)
    }
  }

  const handleSubmitCode = async (e) => {
    e.preventDefault()
    
    if (!accessCode.trim()) {
      setError('Please enter an access code')
      setErrorType('left')
      return
    }

    if (!regData) {
      setError('Invalid registration data.')
      setErrorType('left')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`${API_URL}/api/auth/register/complete-oauth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessCode: accessCode.toUpperCase(),
          email: regData.email,
          googleId: regData.googleId
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.token) {
        localStorage.setItem('auth_token', data.token)
        window.location.href = '/'
      } else {
        setError(data.error || 'Invalid or already used access code')
        setErrorType('left')
      }
    } catch (err) {
      setError(err.message || 'Failed to complete registration')
      setErrorType('left')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestAccess = async (e) => {
    e.preventDefault()
    
    if (!instagramHandle.trim()) {
      setError('Please enter your Instagram handle')
      setErrorType('right')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`${API_URL}/api/access-requests/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regData.email,
          googleId: regData.googleId,
          instagramHandle: instagramHandle
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setRequestStatus(data)
        const interval = setInterval(() => {
          checkRequestStatus(regData.email)
        }, 30000)
        setAutoCheckInterval(interval)
      } else {
        setError(data.error || 'Failed to submit request')
        setErrorType('right')
      }
    } catch (err) {
      setError(err.message || 'Failed to submit request')
      setErrorType('right')
    } finally {
      setLoading(false)
    }
  }

  const toggleRightPanel = (show) => {
    setShowRequestForm(show)
    setError('') 
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'approved': return '✅'
      case 'rejected': return '❌'
      default: return 'ℹ️'
    }
  }

  return (
    <div className="access-code-page">
      <div className="soft-card-container">
        
        {/* --- LEFT PANEL: Verify --- */}
        <div className="panel left-panel">
          <div className="panel-content fade-in-up">
            <div className="brand-header">
              <div className="icon-wrapper">
                <i className="fas fa-lock icon-key"></i>
              </div>
              <h1>Access<br/>Verification</h1>
              <p className="subtitle">Secure Anonymous Platform</p>
            </div>

            {regData && (
              <div className="user-badge">
                <span className="badge-label">LOGGED IN AS</span>
                <span className="badge-email">{regData.email}</span>
              </div>
            )}

            {requestStatus && (
              <div className={`status-pill ${requestStatus.status}`}>
                <div className="status-header">
                  {getStatusIcon(requestStatus.status)}
                  <span>{requestStatus.status.toUpperCase()}</span>
                </div>
                <div className="status-details">
                  <small>@{requestStatus.instagramHandle}</small>
                  <p>{requestStatus.message}</p>
                  {requestStatus.status === 'pending' && <p className="ticker">Auto-refreshing...</p>}
                </div>
              </div>
            )}

            {(!requestStatus || requestStatus.status === 'approved') && (
              <form onSubmit={handleSubmitCode} className="secure-form">
                <label className="input-label">HAVE AN ACCESS CODE?</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="soft-input code-input"
                    placeholder="ENTER CODE"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    maxLength={50}
                    disabled={!regData}
                  />
                </div>

                {error && errorType === 'left' && (
                  <div className="error-soft shake-anim">
                    <i className="fas fa-exclamation-circle"></i> {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn-soft btn-black ripple-effect"
                  disabled={loading || !accessCode.trim() || !regData}
                >
                  {loading ? 'VERIFYING...' : 'UNLOCK ACCESS'}
                </button>
              </form>
            )}

            <div className="secure-footer">
              <div className="footer-row">
                <i className="fas fa-shield-alt"></i>
                <span>Restricted to verified students only.</span>
              </div>
              <button className="link-back" onClick={() => window.location.href = '/'}>
                &larr; Back to Login
              </button>
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: Request --- */}
        <div className="panel right-panel">
          <div className="panel-content">
            
            {!showRequestForm ? (
              <div className="cta-container fade-in-up delayed">
                <h2>No Code?</h2>
                <p>We provide exclusive access to verified students. Request your personal code now.</p>
                <div className="assurance-badge">
                  <i className="fas fa-check-circle"></i> 100% Secure Verification
                </div>
                <button 
                  className="btn-soft btn-white scale-hover"
                  onClick={() => toggleRightPanel(true)}
                >
                  GET MY ACCESS CODE
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestAccess} className="request-form-soft scale-in">
                <h3>Request Code</h3>
                <p className="form-desc">Enter your Instagram handle. We'll DM you personally.</p>
                
                <div className="input-group">
                  <span className="at-prefix">@</span>
                  <input
                    type="text"
                    className="soft-input white-input"
                    placeholder="instagram_handle"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value.replace('@', ''))}
                    disabled={!regData}
                    autoFocus
                  />
                </div>

                {error && errorType === 'right' && (
                  <div className="error-soft error-white shake-anim">
                    {error}
                  </div>
                )}

                <div className="btn-column">
                  <button 
                    type="submit" 
                    className="btn-soft btn-white-fill ripple-effect"
                    disabled={loading || !instagramHandle.trim() || !regData}
                  >
                    {loading ? 'SENDING...' : 'SUBMIT REQUEST'}
                  </button>
                  
                  <button 
                    type="button"
                    className="btn-text-only"
                    onClick={() => toggleRightPanel(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}