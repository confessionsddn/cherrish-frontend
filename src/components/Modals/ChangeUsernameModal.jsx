import { useState } from 'react'
import './ChangeUsernameModal.css'

export default function ChangeUsernameModal({ 
  onClose, 
  currentUsername, 
  isPremium, 
  credits, 
  onSuccess 
}) {
  const [newUsername, setNewUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cost = isPremium ? 0 : 200

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (newUsername.trim().length < 3) {
      setError('// ERROR: IDENTITY_TOO_SHORT')
      return
    }
    
    if (newUsername.trim().length > 20) {
      setError('// ERROR: IDENTITY_OVERFLOW')
      return
    }
    
    if (!isPremium && credits < cost) {
      setError(`// ERROR: INSUFFICIENT_CREDITS [REQUIRED: ${cost}]`)
      return
    }
    
    if (!confirm(`⚠️ EXECUTE PERMANENT IDENTITY SWAP?\n\nTarget: "${newUsername}"\n\nThis operation cannot be undone. Your old self will be erased.`)) {
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch(`${API_URL}/api/auth/change-username`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_username: newUsername.trim() })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'OPERATION FAILED')
      }
      
      alert(`✅ SYSTEM SUCCESS: You are now known as ${data.new_username}.`)
      onSuccess(data.new_username, data.credits_remaining)
      onClose()
      window.location.reload()
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="mystery-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Decorative Scanner Line */}
        <div className="scan-line"></div>

        {/* HEADER: CLASSIFIED FILE STYLE */}
        <div className="mystery-header">
          <div className="header-stamp">TOP SECRET // CLASSIFIED</div>
          <h2>IDENTITY PROTOCOL <span className="blink">_V2</span></h2>
          <button className="mystery-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="mystery-body">
          
          <div className="layout-grid">
            
            {/* LEFT COLUMN: VISUALS */}
            <div className="visual-col">
              <div className="incognito-icon">
                <i className="fas fa-user-secret"></i>
              </div>
              <div className="matrix-text">
                <p>{'>'} INITIATING PROTOCOL...</p>
                <p>{'>'} ENCRYPTING DATA...</p>
                <p>{'>'} WAITING FOR INPUT...</p>
              </div>
            </div>

            {/* RIGHT COLUMN: ACTION */}
            <div className="action-col">
              
              {/* WARNING TAPE */}
              <div className="caution-tape">
                <i className="fas fa-biohazard"></i>
                <span>WARNING : ONLY ONE CHNACE</span>
                <i className="fas fa-biohazard"></i>
              </div>

              <div className="identity-swap-row">
                <div className="id-card old">
                  <span className="label">CURRENT SUBJECT</span>
                  <div className="name-redacted">{currentUsername}</div>
                </div>
                <div className="arrow-glitch">➜</div>
                <div className="id-card new">
                  <span className="label">NEW ALIAS</span>
                  <div className="name-placeholder">{newUsername || 'UNKNOWN'}</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mystery-form">
                <div className="terminal-input-wrapper">
                  <span className="prompt">{'>'} user_set_alias:</span>
                  <input
                    type="text"
                    className="terminal-input"
                    placeholder="ENTER_NEW_CODENAME"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toUpperCase())}
                    minLength={3}
                    maxLength={20}
                    required
                    disabled={loading}
                    autoComplete="off"
                  />
                </div>

                <div className="status-bar">
                  <div className="cost-indicator">
                    {isPremium ? (
                      <span className="status-free">ACCESS GRANTED (PREMIUM)</span>
                    ) : (
                      <span className="status-cost">COST: {cost} CRYPTO_CREDITS</span>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="terminal-error">
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="execute-btn"
                  disabled={loading || newUsername.trim().length < 3}
                >
                  {loading ? 'OVERWRITING DATABASE...' : 'EXECUTE IDENTITY SWAP'}
                </button>
              </form>
            </div>
          </div>

        </div>
        
        {/* Footer Texture */}
        <div className="mystery-footer-strip">
          <span>SECURE CONNECTION ESTABLISHED</span>
          <span>ID: {Math.floor(Math.random() * 999999)}</span>
        </div>

      </div>
    </div>
  )
}