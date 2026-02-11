import { useState, useEffect, useRef } from 'react'
import './RepliesSection.css'
import { API_URL } from '../../services/api';

const QUICK_EMOJIS = ['❤️', '😂', '🔥', '😍', '😭', '😮', '👏', '👀', '💯', '✨', '💀', '🤡']

export default function RepliesSection({ confessionId, onCreditsUpdate }) {
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [posting, setPosting] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  const feedRef = useRef(null)

  useEffect(() => {
    if (showReplies && replies.length === 0) {
      loadReplies()
    }
  }, [showReplies])

  // Auto-scroll to bottom
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [replies.length, showReplies])

  const loadReplies = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/replies/confession/${confessionId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      })
      const data = await response.json()
      if (data.success) setReplies(data.replies)
    } catch (error) {
      console.error('Failed to load replies:', error)
    } finally {
      setLoading(false)
    }
  }

  // --- ONE CLICK ACTIVATE ---
  const handleInputFocus = () => {
    if (!showReplies) {
      setShowReplies(true)
    }
    // Don't auto-show emoji picker, just show the button
  }

  const handlePostReply = async () => {
    const content = replyText.trim()
    if (!content) return

    // 1. OPTIMISTIC UPDATE
    setReplyText('')
    setShowEmojiPicker(false)

    const tempId = Date.now()
    const optimisticReply = {
      id: tempId,
      content: content,
      username: localStorage.getItem('username') || 'Me', 
      user_number: localStorage.getItem('user_number') || '', 
      created_at: new Date().toISOString(),
      likes_count: 0,
      user_has_liked: false,
      user_id: localStorage.getItem('user_id'),
      isOptimistic: true
    }

    setReplies(prev => [...prev, optimisticReply])

    // 2. BACKGROUND SYNC
    try {
      const response = await fetch(`${API_URL}/api/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confession_id: confessionId, content: content })
      })

      const data = await response.json()

      if (data.success) {
        setReplies(prev => prev.map(r => r.id === tempId ? data.reply : r))
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Failed to post reply:', error)
      setReplies(prev => prev.filter(r => r.id !== tempId))
      setReplyText(content)
      alert('❌ Failed to post.')
    }
  }

  const handleEmojiClick = (emoji) => {
    setReplyText(prev => prev + emoji)
  }

  const handleLikeReply = async (replyId) => {
    setReplies(replies.map(r => 
      r.id === replyId 
        ? { ...r, likes_count: r.user_has_liked ? r.likes_count - 1 : r.likes_count + 1, user_has_liked: !r.user_has_liked }
        : r
    ))

    try {
      await fetch(`${API_URL}/api/replies/${replyId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      })
    } catch (error) {
      console.error('Like failed', error)
    }
  }

  const handleDeleteReply = async (replyId) => {
    if (!confirm('Delete this reply?')) return
    
    const previousReplies = [...replies]
    setReplies(replies.filter(r => r.id !== replyId))

    try {
      const response = await fetch(`${API_URL}/api/replies/${replyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      })
      if (!response.ok) throw new Error('Delete failed')
    } catch (error) {
      setReplies(previousReplies)
    }
  }

  // --- FIXED TIMESTAMP LOGIC ---
  const formatTime = (dateString) => {
    if (!dateString) return 'Just now';

    // Force UTC interpretation
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
    const diff = Math.floor((now - date) / 1000); // Difference in seconds

    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s`;
    
    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  return (
    <div className="replies-wrapper">

      {/* 1. EXPANDED CONTENT */}
      {showReplies && (
        <div className="replies-content slide-down">
          
          <div className="replies-header-actions">
             <span className="comments-title">
               Comments {replies.length > 0 ? `(${replies.length})` : ''}
             </span>
             <button className="hide-comments-btn" onClick={() => setShowReplies(false)}>
               Hide <i className="fas fa-chevron-up"></i>
             </button>
          </div>

          <div className="replies-feed" ref={feedRef}>
            {loading ? (
              <div className="loading-text">Loading...</div>
            ) : replies.length === 0 ? (
              <div className="empty-text">No comments yet. Start the conversation! 👇</div>
            ) : (
              replies.map(reply => (
                <div key={reply.id} className={`reply-row ${reply.isOptimistic ? 'optimistic' : ''}`}>
                  <div className="reply-avatar-sm">
                    {reply.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="reply-body-container">
                    <div className="reply-header-line">
                      <span className="reply-user">{reply.username}</span>
                      <span className="reply-time">
                        {reply.isOptimistic ? 'Posting...' : formatTime(reply.created_at)}
                      </span>
                    </div>
                    <div className="reply-text-content">
                      {reply.content}
                    </div>
                    {!reply.isOptimistic && (
                      <div className="reply-footer-actions">
                        {reply.likes_count > 0 && (
                          <span className="reply-likes-count">{reply.likes_count} likes</span>
                        )}
                        {reply.user_id === localStorage.getItem('user_id') && (
                          <button className="text-delete-btn" onClick={() => handleDeleteReply(reply.id)}>
                            delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <button 
                    className={`small-heart-btn ${reply.user_has_liked ? 'liked' : ''}`}
                    onClick={() => !reply.isOptimistic && handleLikeReply(reply.id)}
                    disabled={reply.isOptimistic}
                  >
                    <i className={`fas fa-heart`}></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. INPUT BAR */}
      <div className="reply-composer-clean">
        
        {/* Emoji Toggle - ONLY VISIBLE WHEN REPLIES ARE OPEN */}
        {showReplies && (
          <button 
            className="emoji-toggle-btn slide-in-left"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <i className="far fa-smile"></i>
          </button>
        )}

        {/* Emoji Mini Tab */}
        {showReplies && showEmojiPicker && (
          <div className="emoji-mini-tab">
            {QUICK_EMOJIS.map(emoji => (
              <button 
                key={emoji} 
                className="quick-emoji-btn"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <input
          type="text"
          className="clean-input"
          placeholder="Add a comment..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onFocus={handleInputFocus}
          maxLength={500}
        />
        
        <button 
          className="post-text-btn"
          onClick={handlePostReply}
          disabled={!replyText.trim() || posting}
        >
          Post
        </button>
      </div>

    </div>
  )
}
