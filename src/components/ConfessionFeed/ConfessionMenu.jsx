import { useState } from 'react'
import './ConfessionMenu.css'

const getSpotlightOptions = (isPremium, remaining) => [
  { duration: 30, label: '30 minutes', credits: 5, isFree: false },
  { duration: 60, label: '1 hour', credits: 10, isFree: false },
  { duration: 120, label: '2 hours', credits: 15, isFree: false },
  { duration: 360, label: '6 hours', credits: 20, isFree: false },
  { 
    duration: 720, 
    label: '12 hours', 
    credits: 25, 
    isFree: isPremium && remaining > 0,
    freeLabel: isPremium && remaining > 0 ? `FREE (${remaining} left)` : null
  },
  { 
    duration: 1440, 
    label: '24 hours', 
    credits: 30,
    isFree: isPremium && remaining > 0,
    freeLabel: isPremium && remaining > 0 ? `FREE (${remaining} left)` : null
  }
]

const getBoostOptions = (isPremium, remaining) => [
  { duration: 30, label: '30 minutes', credits: 5, multiplier: '1.3x', isFree: false },
  { duration: 60, label: '1 hour', credits: 10, multiplier: '1.5x', isFree: false },
  { duration: 120, label: '2 hours', credits: 15, multiplier: '1.7x', isFree: false },
  { duration: 360, label: '6 hours', credits: 20, multiplier: '2.0x', isFree: false },
  { 
    duration: 720, 
    label: '12 hours', 
    credits: 25, 
    multiplier: '2.3x',
    isFree: isPremium && remaining > 0,
    freeLabel: isPremium && remaining > 0 ? `FREE (${remaining} left)` : null
  },
  { 
    duration: 1440, 
    label: '24 hours', 
    credits: 30, 
    multiplier: '2.7x',
    isFree: isPremium && remaining > 0,
    freeLabel: isPremium && remaining > 0 ? `FREE (${remaining} left)` : null
  }
]

export default function ConfessionMenu({ 
  confessionId, 
  isOwner, 
  onClose, 
  onDelete,
  currentUserId,
  confessionUserId,
  isPremium = false,
  spotlightRemaining = 0,
  boostRemaining = 0
}) {
  const [showSpotlight, setShowSpotlight] = useState(false)
  const [showBoost, setShowBoost] = useState(false)

  const spotlightOptions = getSpotlightOptions(isPremium, spotlightRemaining)
  const boostOptions = getBoostOptions(isPremium, boostRemaining)

  const handleSpotlight = async (duration, credits) => {
    const option = spotlightOptions.find(o => o.duration === duration)
    
    if (!confirm(`Apply Spotlight for ${option.label}?\n\n${option.isFree ? '✨ FREE with Premium!' : `Cost: ${credits} credits`}\n\nThis will highlight your confession visually.`)) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/visibility/spotlight/${confessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration })
      })

      const data = await response.json()

      if (data.success) {
        alert(`✨ ${data.message}\n\n${data.used_premium ? '👑 Used premium slot (FREE)' : `Credits spent: ${data.credits_spent}`}`)
        window.location.reload()
      } else {
        alert('❌ ' + data.error)
      }
    } catch (error) {
      console.error('Spotlight error:', error)
      alert('❌ Failed to apply spotlight')
    }
  }

  const handleBoost = async (duration, credits) => {
    const option = boostOptions.find(o => o.duration === duration)
    
    if (!confirm(`Apply Boost for ${option.label}?\n\nMultiplier: ${option.multiplier}\n${option.isFree ? '✨ FREE with Premium!' : `Cost: ${credits} credits`}\n\nThis will increase your confession's visibility temporarily.`)) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/visibility/boost/${confessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration })
      })

      const data = await response.json()

      if (data.success) {
        alert(`🚀 ${data.message}\n\nMultiplier: ${data.multiplier}x\n${data.used_premium ? '👑 Used premium slot (FREE)' : `Credits spent: ${data.credits_spent}`}`)
        window.location.reload()
      } else {
        alert('❌ ' + data.error)
      }
    } catch (error) {
      console.error('Boost error:', error)
      alert('❌ Failed to apply boost')
    }
  }

  return (
    <div className="confession-menu-overlay" onClick={onClose}>
      <div className="confession-menu" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="menu-header">
          <h3>Confession Options</h3>
          <button className="menu-close" onClick={onClose}>×</button>
        </div>

        {/* Menu Items */}
        <div className="menu-items">
          
          {/* Spotlight */}
          {isOwner && (
            <div className="menu-item-group">
              <button 
                className="menu-item spotlight-item"
                onClick={() => setShowSpotlight(!showSpotlight)}
              >
                <div className="menu-item-icon">✨</div>
                <div className="menu-item-content">
                  <div className="menu-item-title">Spotlight</div>
                  <div className="menu-item-desc">
                    Highlight your confession
                    {isPremium && spotlightRemaining > 0 && (
                      <span className="premium-slots"> • {spotlightRemaining} free left</span>
                    )}
                  </div>
                </div>
                <i className={`fas fa-chevron-${showSpotlight ? 'up' : 'down'}`}></i>
              </button>

              {showSpotlight && (
                <div className="submenu">
                  {spotlightOptions.map(option => (
                    <button
                      key={option.duration}
                      className={`submenu-item ${option.isFree ? 'free-option' : ''}`}
                      onClick={() => handleSpotlight(option.duration, option.credits)}
                    >
                      <span>
                        {option.label}
                        {option.isFree && <span className="free-badge">👑 FREE</span>}
                      </span>
                      <span className={`submenu-price ${option.isFree ? 'free-price' : ''}`}>
                        {option.freeLabel || `${option.credits} credits`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Boost */}
          {isOwner && (
            <div className="menu-item-group">
              <button 
                className="menu-item boost-item"
                onClick={() => setShowBoost(!showBoost)}
              >
                <div className="menu-item-icon">🚀</div>
                <div className="menu-item-content">
                  <div className="menu-item-title">Boost</div>
                  <div className="menu-item-desc">
                    Increase visibility temporarily
                    {isPremium && boostRemaining > 0 && (
                      <span className="premium-slots"> • {boostRemaining} free left</span>
                    )}
                  </div>
                </div>
                <i className={`fas fa-chevron-${showBoost ? 'up' : 'down'}`}></i>
              </button>

              {showBoost && (
                <div className="submenu">
                  {boostOptions.map(option => (
                    <button
                      key={option.duration}
                      className={`submenu-item ${option.isFree ? 'free-option' : ''}`}
                      onClick={() => handleBoost(option.duration, option.credits)}
                    >
                      <span>
                        {option.label} ({option.multiplier})
                        {option.isFree && <span className="free-badge">👑 FREE</span>}
                      </span>
                      <span className={`submenu-price ${option.isFree ? 'free-price' : ''}`}>
                        {option.freeLabel || `${option.credits} credits`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Delete (Owner only) */}
          {isOwner && (
            <button 
              className="menu-item delete-item"
              onClick={() => {
                if (confirm('Delete this confession? You will get 2 credits refunded.')) {
                  onDelete(confessionId)
                  onClose()
                }
              }}
            >
              <div className="menu-item-icon">🗑️</div>
              <div className="menu-item-content">
                <div className="menu-item-title">Delete</div>
                <div className="menu-item-desc">Remove confession</div>
              </div>
            </button>
          )}

          {/* Report (Non-owner only) */}
          {!isOwner && (
            <button 
              className="menu-item report-item"
              onClick={() => {
                onClose()
                // Trigger report modal (implement separately)
              }}
            >
              <div className="menu-item-icon">🚩</div>
              <div className="menu-item-content">
                <div className="menu-item-title">Report</div>
                <div className="menu-item-desc">Report inappropriate content</div>
              </div>
            </button>
          )}

        </div>
      </div>
    </div>
  )
}