import { useState, useRef, useEffect } from 'react'
import './ConfessionCard.css'
import RepliesSection from '../Replies/RepliesSection'
import ConfessionMenu from './ConfessionMenu'
import { API_URL } from '../../services/api';

const MOOD_ICONS = {
  'Crush': '💕',
  'Heartbreak': '💔',
  'Secret Admirer': '🥰',
  'Love Stories': '❤️'
}

// Calculate time remaining for boost/spotlight
function getTimeRemaining(expiresAt) {
  if (!expiresAt) return null
  
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diffMs = expiry - now
  
  if (diffMs <= 0) return null
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Format timestamp for display
function formatRelativeTime(dateString) {
  if (!dateString) return 'JUST NOW';

  let date;
  if (typeof dateString === 'string') {
    if (dateString.includes('T') && !dateString.endsWith('Z')) {
      date = new Date(dateString + 'Z'); 
    } else {
      date = new Date(dateString);
    }
  } else {
    date = new Date(dateString);
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 10) return 'JUST NOW';
  if (diffInSeconds < 60) return `${diffInSeconds} SEC AGO`;
  
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes} MIN AGO`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} HR AGO`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} DAYS AGO`;
  
  return date.toLocaleDateString(); 
}

export default function ConfessionCard({ 
  confession, 
  onReaction, 
  onGiftClick, 
  onCreditsUpdate,
  currentUserId,
  isPremium,
  premiumData,
  style 
}) {
  // State
  const [activeReactions, setActiveReactions] = useState({})
  const [pressTimer, setPressTimer] = useState(null)
  const [isLongPress, setIsLongPress] = useState(false)
  const [longPressType, setLongPressType] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasViewed, setHasViewed] = useState(false)
  
  const audioRef = useRef(null)
  const cardRef = useRef(null)
  const reactionDebounceRef = useRef({})

  const isOwner = currentUserId === confession.user_id
  const isSpotlightActive = confession.spotlight_expires_at && new Date(confession.spotlight_expires_at) > new Date()
  const isBoostActive = confession.boost_expires_at && new Date(confession.boost_expires_at) > new Date()

  const displayTime = confession.created_at 
    ? formatRelativeTime(confession.created_at)
    : (confession.timestamp || 'JUST NOW');

  // Track view when card becomes visible
  useEffect(() => {
    if (!cardRef.current || hasViewed) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasViewed) {
            setHasViewed(true)
            trackView()
          }
        })
      },
      { threshold: 0.5 }
    )
    
    observer.observe(cardRef.current)
    
    return () => observer.disconnect()
  }, [hasViewed])

  const trackView = async () => {
    try {
      await fetch(`${API_URL}/api/confessions/${confession.id}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
    } catch (error) {
      console.error('Failed to track view:', error)
    }
  }

  // Cleanup audio
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Audio Toggle
  const toggleAudio = (e) => {
    e.stopPropagation()
    if (!audioRef.current) {
      audioRef.current = new Audio(confession.audio_url)
      audioRef.current.onended = () => setIsPlaying(false)
    }
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  // Delete Handler
  const handleDelete = async (confessionId) => {
    try {
      const response = await fetch(`${API_URL}/api/confessions/${confessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Confession deleted! 5 credits refunded.')
        window.location.reload()
      } else {
        alert('❌ ' + data.error)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('❌ Failed to delete')
    }
  }
// --- SUSTAINED CONFETTI LOGIC ---
// --- POP & FLOAT LOGIC (100 Particles) ---
  const triggerEmojiBurst = (reactionType, originX, originY) => {
    const emojiMap = {
      heart: ['💖','💗','💕','💞','💓','❤️‍🔥','❤️'],
      like: ['👍','👏','🫰','💪','🙌','✌️','🤩'],
      cry: ['😢','😭','💧','🥺','😞','😔','💦'],
      laugh: ['😂','😆','🤣','😹','😁','😜','😄']
    }
    
    const emojis = emojiMap[reactionType] || ['✨']
    const container = document.body 
    
    // 60 Particles for a dense cloud
    for (let i = 0; i < 60; i++) { 
      const emoji = document.createElement('span')
      emoji.className = 'floating-heart'
      emoji.textContent = emojis[i % emojis.length]
      
      // Start at button center
      emoji.style.left = `${originX}px`
      emoji.style.top = `${originY}px`
      
      // TARGET COORDINATES (Where they float TO)
      // Spread X: Randomly float left (-150px) or right (+150px)
      const targetX = (Math.random() - 0.5) * 300; 
      // Spread Y: Float UPWARDS significantly (-200px to -500px)
      const targetY = -200 - Math.random() * 300; 
      
      const rotate = (Math.random() - 0.5) * 40; // Subtle wobble

      emoji.style.setProperty('--x', `${targetX}px`)
      emoji.style.setProperty('--y', `${targetY}px`)
      emoji.style.setProperty('--rot', `${rotate}deg`)
      
      // Random Size (Variable)
      emoji.style.fontSize = `${1.0 + Math.random() * 1.5}rem`
      
      container.appendChild(emoji)
      
      // Remove after 5 seconds
      setTimeout(() => emoji.remove(), 5000)
    }
  }
  // Reaction Handlers
  const handleReactionPress = (reactionType, e) => {
    e.preventDefault() 
    setIsLongPress(false)
    setLongPressType(reactionType)
    const timer = setTimeout(() => {
      setIsLongPress(true)
      handleLongPress(reactionType)
    }, 800)
    setPressTimer(timer)
  }

  const handleReactionRelease = (reactionType, e) => {
    e.preventDefault() 
    if (pressTimer) clearTimeout(pressTimer)
    
    if (!isLongPress) handleClick(reactionType, e)
    
    setIsLongPress(false)
    setLongPressType(null)
    setPressTimer(null)
  }
  
  const handleCancel = () => {
    if (pressTimer) clearTimeout(pressTimer)
    setIsLongPress(false)
    setLongPressType(null)
    setPressTimer(null)
  }

  const handleClick = (reactionType, e) => {
    const key = `${confession.id}-${reactionType}`
    
    let centerX = 0;
    let centerY = 0;

    if (e && e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        centerX = rect.left + (rect.width / 2);
        centerY = rect.top + (rect.height / 2);
    } else if (e && e.clientX) {
        centerX = e.clientX;
        centerY = e.clientY;
    }

    triggerEmojiBurst(reactionType, centerX, centerY)

    if (reactionDebounceRef.current[key]) {
      clearTimeout(reactionDebounceRef.current[key])
    }
    
    reactionDebounceRef.current[key] = setTimeout(() => {
      onReaction(confession.id, reactionType, 'add')
      delete reactionDebounceRef.current[key]
    }, 200)
    
    setActiveReactions({ ...activeReactions, [reactionType]: true })
    setTimeout(() => {
      setActiveReactions({ ...activeReactions, [reactionType]: false })
    }, 300)
  }

  const handleLongPress = (reactionType) => {
    if (navigator.vibrate) navigator.vibrate(100)
    if (window.confirm(`🗑️ Remove ALL ${reactionType} reactions?\n\n⚠️ NO CREDITS REFUNDED!`)) {
      onReaction(confession.id, reactionType, 'remove_all')
    }
  }

  const totalReactions = confession.reactions 
    ? Object.values(confession.reactions).reduce((a, b) => a + b, 0)
    : 0
  const isPopular = totalReactions > 50
  
  const avatarLetter = confession.username ? confession.username.charAt(0).toUpperCase() : '?'

  return (
    <div 
      ref={cardRef}
      className={`confession-card ${isSpotlightActive ? 'spotlight-active' : ''} ${confession.premium ? 'premium' : ''} typing-animation`}
      style={style}
    >
      {/* Spotlight Badge */}
      {isSpotlightActive && isOwner && (
        <div className="spotlight-badge-container">
          <div className="spotlight-badge">
            <i className="fas fa-star"></i> SPOTLIGHT
          </div>
          <button 
            className="info-btn"
            onClick={(e) => {
              e.stopPropagation()
              const remaining = getTimeRemaining(confession.spotlight_expires_at)
              if (remaining) {
                alert(`⭐ SPOTLIGHT ACTIVE\n\nTime Remaining: ${remaining}\n\nYour confession is pinned at the top!`)
              }
            }}
            title="View time remaining"
          >
            <i className="fas fa-info-circle"></i>
          </button>
        </div>
      )}

      {/* Boost Badge */}
      {isBoostActive && isOwner && (
        <div className="boost-badge-container">
          <div className="boost-indicator" title={`Boosted ${confession.boost_multiplier}x`}>
            <i className="fas fa-rocket"></i> {confession.boost_multiplier}x
          </div>
          <button 
            className="info-btn"
            onClick={(e) => {
              e.stopPropagation()
              const remaining = getTimeRemaining(confession.boost_expires_at)
              if (remaining) {
                alert(`🚀 BOOST ACTIVE\n\nMultiplier: ${confession.boost_multiplier}x\nTime Remaining: ${remaining}\n\nYour confession has increased visibility!`)
              }
            }}
            title="View time remaining"
          >
            <i className="fas fa-info-circle"></i>
          </button>
        </div>
      )}

      {/* Mood Sticker */}
      <div className={`mood-sticker ${confession.mood_zone.replace(' ', '')}`}>
        <span className="sticker-icon">{MOOD_ICONS[confession.mood_zone]}</span>
        <span className="sticker-text">{confession.mood_zone.toUpperCase()}</span>
      </div>

      {/* Header */}
      <div className="card-header-row" style={{ position: 'relative' }}>
        <div className="user-profile-group">
          <div className="user-avatar-circle">
            {avatarLetter}
          </div>
          <div className="user-text-info">
            <div className="user-name-row">
              <span className="username">
                {confession.username || 'Anonymous'}
              </span>
              {confession.is_premium_user && (
                <span className="premium-badge-inline" title="Premium User">⭐</span>
              )}
            </div>
            <span className="user-number">
              {confession.user_number ? `#${confession.user_number}` : ''}
            </span>
          </div>
        </div>

        <div className="header-meta-group" style={{ marginRight: '40px' }}>
          <div className="confession-timestamp">
            {displayTime}
            {isPopular && <span className="fire-effect" title="Popular!">🔥</span>}
          </div>
        </div>

        {/* Absolute Menu Button */}
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          zIndex: 10
        }}>
          <button 
            className="confession-menu-btn"
            onClick={() => setShowMenu(!showMenu)}
            title="Options"
            style={{ padding: '5px' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          
          {showMenu && (
            <div style={{
              position: 'absolute',
              right: '0',
              top: '100%',
              marginTop: '5px',
              zIndex: 100
            }}>
              <ConfessionMenu 
                confessionId={confession.id}
                isOwner={isOwner}
                onClose={() => setShowMenu(false)}
                onDelete={handleDelete}
                currentUserId={currentUserId}
                confessionUserId={confession.user_id}
                isPremium={isPremium}
                spotlightRemaining={premiumData?.spotlight_12h_remaining || 0}
                boostRemaining={premiumData?.boost_12h_remaining || 0}
                isAdmin={confession.is_current_user_admin}
                allowUserDelete={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="confession-content">{confession.content}</div>

      {/* Audio Player */}
      {confession.audio_url && (
        <div className={`neo-audio-capsule ${isPlaying ? 'playing' : ''}`}>
          <div className="capsule-icon">
            <i className={`fas ${isPlaying ? 'fa-compact-disc fa-spin' : 'fa-microphone'}`} style={{ animationDuration: '2s' }}></i>
          </div>
          
          <div className="capsule-track">
            <div className="wave-bar"></div>
            <div className="wave-bar tall"></div>
            <div className="wave-bar short"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar tall"></div>
            <div className="wave-bar medium"></div>
            <div className="wave-bar short"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar tall"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar medium"></div>
            <span className="capsule-status">{isPlaying ? 'PLAYING...' : 'VOICE NOTE'}</span>
          </div>

          <button 
            className="capsule-play-btn"
            onClick={toggleAudio}
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="confession-footer">
        <div className="confession-stats-row">
          <span className="views-stat">
            <i className="fas fa-eye"></i> {confession.total_impressions || 0}
          </span>
        </div>
        
        <div className="action-row">
          <div className="reactions-group">
            {['heart', 'like', 'cry', 'laugh'].map(type => (
              <button
                key={type}
                className={`reaction-pill ${activeReactions[type] ? 'active' : ''} ${longPressType === type ? 'pressing' : ''}`}
                onPointerDown={(e) => handleReactionPress(type, e)}
                onPointerUp={(e) => handleReactionRelease(type, e)}
                onPointerCancel={handleCancel}
                onPointerLeave={handleCancel}
              >
                <i className={`fas fa-${type === 'like' ? 'thumbs-up' : type === 'cry' ? 'sad-tear' : type}`}></i>
                <span>{confession.reactions[type]}</span>
              </button>
            ))}
          </div>

          <button className="gift-action-btn" onClick={() => onGiftClick(confession.id)}>
            <i className="fas fa-gift"></i> GIFT
          </button>
        </div>

        <RepliesSection 
          confessionId={confession.id}
          onCreditsUpdate={onCreditsUpdate}
        />
      </div>
    </div>
  )
}
