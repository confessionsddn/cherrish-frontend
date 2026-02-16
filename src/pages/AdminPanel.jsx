// frontend/src/pages/AdminPanel.jsx - COMPLETE WORKING VERSION
import { useState, useEffect } from 'react'
import './AdminPanel.css'
import { API_URL } from '../services/api';

export default function AdminPanel() {
  // State variables
  const [stats, setStats] = useState(null)
  const [pendingRequests, setPendingRequests] = useState([])
  const [codes, setCodes] = useState([])
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [pendingConfessions, setPendingConfessions] = useState([])
  const [reports, setReports] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [conversations, setConversations] = useState([])

  // Load data on mount
  useEffect(() => {
    console.log('🚀 Admin Panel mounted')
    loadStats()
    loadPendingRequests()
    loadCodes()
    loadUsers()
    loadPendingConfessions()
    loadReports()
  }, [])

  // Auth headers helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Load functions
  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPendingRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/pending-requests`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      if (data.success) {
        setPendingRequests(data.requests)
      }
    } catch (error) {
      console.error('Failed to load pending requests:', error)
    }
  }

  const loadCodes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/codes`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      if (data.success) {
        setCodes(data.codes)
      }
    } catch (error) {
      console.error('Failed to load codes:', error)
    }
  }

  const loadUsers = async (searchTerm = '') => {
    try {
      const url = searchTerm 
        ? `${API_URL}/api/admin/users?search=${encodeURIComponent(searchTerm)}`
        : `${API_URL}/api/admin/users`
        
      console.log('📡 Fetching users from:', url)
        
      const response = await fetch(url, {
        headers: getAuthHeaders()
      })
      
      console.log('📡 Response status:', response.status)
      
      const data = await response.json()
      
      console.log('📡 Users data:', data)
      
      if (data.success) {
        setUsers(data.users)
        console.log('✅ Users loaded:', data.users.length)
      } else {
        console.error('❌ Failed to load users:', data.error)
      }
    } catch (error) {
      console.error('❌ Load users error:', error)
    }
  }

  const loadPendingConfessions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/confessions/pending`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      if (data.success) {
        setPendingConfessions(data.confessions)
      }
    } catch (error) {
      console.error('Failed to load pending confessions:', error)
    }
  }

  const loadReports = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/reports`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      if (data.success) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error('Failed to load reports:', error)
    }
  }

  const loadActivityLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/activity-logs?limit=100`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      if (data.success) {
        setActivityLogs(data.logs)
      }
    } catch (error) {
      console.error('Failed to load activity logs:', error)
    }
  }

  const loadConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/messages/conversations`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      if (data.success) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  // Action handlers
  const handleApprove = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/approve-request/${id}`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      const data = await response.json()
      
      if (data.success) {
        showNotification(`✅ Approved! Code: ${data.code}`, 'success')
        loadPendingRequests()
        loadStats()
      } else {
        showNotification('❌ ' + data.error, 'error')
      }
    } catch (error) {
      console.error('Approve error:', error)
      showNotification('❌ Failed to approve request', 'error')
    }
  }

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to reject this request?')) return
    
    try {
      const response = await fetch(`${API_URL}/api/admin/reject-request/${id}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason: 'Not verified' })
      })
      const data = await response.json()
      
      if (data.success) {
        showNotification('❌ Request rejected', 'success')
        loadPendingRequests()
        loadStats()
      }
    } catch (error) {
      console.error('Reject error:', error)
      showNotification('❌ Failed to reject request', 'error')
    }
  }

  const handleGenerateCodes = async () => {
    const count = prompt('How many codes to generate? (1-100)', '10')
    if (!count) return
    
    try {
      const response = await fetch(`${API_URL}/api/admin/generate-codes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ count: parseInt(count) })
      })
      const data = await response.json()
      
      if (data.success) {
        showNotification(`✅ Generated ${count} codes!`, 'success')
        loadCodes()
        loadStats()
      }
    } catch (error) {
      console.error('Generate codes error:', error)
      showNotification('❌ Failed to generate codes', 'error')
    }
  }

  const handleDownloadCSV = () => {
    const csv = codes.map(c => 
      `${c.code},${c.is_used ? 'Used' : 'Unused'},${c.username || 'N/A'},${c.email || 'N/A'}`
    ).join('\n')
    
    const blob = new Blob(['Code,Status,Username,Email\n' + csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `access-codes-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    showNotification('📥 CSV downloaded!', 'success')
  }

  const handleBanUser = async (userId, banned, duration = 'permanent') => {
    if (banned && !confirm(`Ban this user${duration === 'permanent' ? ' permanently' : ` for ${duration} days`}?`)) {
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ banned, duration })
      })
      const data = await response.json()
      
      if (data.success) {
        showNotification(banned ? `🚫 User banned ${duration === 'permanent' ? 'permanently' : `for ${duration} days`}` : '✅ User unbanned', 'success')
        loadUsers()
      }
    } catch (error) {
      console.error('Ban user error:', error)
      showNotification('❌ Failed to update user', 'error')
    }
  }

  const handleViewUserDetails = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/stats`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      
      if (data.success) {
        alert(`
User Stats:
- Reactions Given: ${data.stats.reactions_given}
- Recent Confessions: ${data.stats.recent_confessions.length}

Recent Activity:
${data.stats.recent_confessions.map(c => 
  `- ${c.content.substring(0, 50)}... (${c.total_reactions} reactions)`
).join('\n')}
        `)
      }
    } catch (error) {
      console.error('Failed to get user details:', error)
      showNotification('❌ Failed to load user details', 'error')
    }
  }

  const handleApproveConfession = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/confessions/${id}/approve`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      const data = await response.json()
      
      if (data.success) {
        showNotification('✅ Confession approved!', 'success')
        loadPendingConfessions()
        loadStats()
      }
    } catch (error) {
      console.error('Approve confession error:', error)
      showNotification('❌ Failed to approve', 'error')
    }
  }

  const handleRejectConfession = async (id) => {
    const reason = prompt('Rejection reason (optional):')
    
    try {
      const response = await fetch(`${API_URL}/api/admin/confessions/${id}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      })
      const data = await response.json()
      
      if (data.success) {
        showNotification('❌ Confession rejected', 'success')
        loadPendingConfessions()
        loadStats()
      }
    } catch (error) {
      console.error('Reject confession error:', error)
      showNotification('❌ Failed to reject', 'error')
    }
  }

  const handleResolveReport = async (reportId, action) => {
    if (action === 'remove_confession' && !confirm('Remove this confession permanently?')) {
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action })
      })
      const data = await response.json()
      
      if (data.success) {
        showNotification(data.message, 'success')
        loadReports()
      }
    } catch (error) {
      console.error('Resolve report error:', error)
      showNotification('❌ Failed to resolve report', 'error')
    }
  }

  // Utility functions
  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} min ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const formatLastOnline = (lastActivity) => {
    if (!lastActivity) return 'Never'
    
    const now = new Date()
    const lastSeen = new Date(lastActivity)
    const diffMs = now - lastSeen
    const diffMins = Math.floor(diffMs / 60000)
    
    // Online if activity within 5 minutes
    if (diffMins < 5) return '🟢 ONLINE NOW'
    
    // Minutes
    if (diffMins < 60) return `⚫ ${diffMins} min ago`
    
    // Hours
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `⚫ ${diffHours}h ago`
    
    // Days
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `⚫ ${diffDays}d ago`
    
    // Weeks
    const diffWeeks = Math.floor(diffDays / 7)
    return `⚫ ${diffWeeks}w ago`
  }

  if (loading) {
    return <div className="admin-loading">LOADING ADMIN PANEL...</div>
  }

  return (
    <div className="admin-panel">
      {notification && (
        <div className={`admin-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="admin-header">
        <h1><i className="fas fa-shield-alt"></i> ADMIN PANEL</h1>
        <button className="btn btn--outline" onClick={() => window.location.href = '/'}>
          <i className="fas fa-arrow-left"></i> Back to Site
        </button>
      </div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <i className="fas fa-chart-line"></i> Dashboard
        </button>
        
        <button 
          className={`admin-tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <i className="fas fa-inbox"></i> Requests ({pendingRequests.length})
        </button>
        
        <button 
          className={`admin-tab ${activeTab === 'codes' ? 'active' : ''}`}
          onClick={() => setActiveTab('codes')}
        >
          <i className="fas fa-ticket-alt"></i> Codes
        </button>
        
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <i className="fas fa-users"></i> Users
        </button>
        
        <button 
          className={`admin-tab ${activeTab === 'moderation' ? 'active' : ''}`}
          onClick={() => setActiveTab('moderation')}
        >
          <i className="fas fa-shield-alt"></i> Moderation ({pendingConfessions.length})
        </button>
        
        <button 
          className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <i className="fas fa-flag"></i> Reports ({reports.length})
        </button>
        
        <button 
          className={`admin-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('activity')
            loadActivityLogs()
          }}
        >
          <i className="fas fa-history"></i> Activity
        </button>
        
        <button 
          className={`admin-tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('messages')
            loadConversations()
          }}
        >
          <i className="fas fa-envelope"></i> Messages
        </button>
      </div>

      <div className="admin-content">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <div className="stats-grid">
              <div className="stat-card">
                <i className="fas fa-inbox"></i>
                <h3>{stats?.pendingRequests || 0}</h3>
                <p>Pending Requests</p>
              </div>
              <div className="stat-card">
                <i className="fas fa-users"></i>
                <h3>{stats?.totalUsers || 0}</h3>
                <p>Total Users</p>
              </div>
              <div className="stat-card">
                <i className="fas fa-ticket-alt"></i>
                <h3>{stats?.unusedCodes || 0}</h3>
                <p>Unused Codes</p>
              </div>
              <div className="stat-card">
                <i className="fas fa-comment"></i>
                <h3>{stats?.totalConfessions || 0}</h3>
                <p>Total Confessions</p>
              </div>
            </div>

            <div className="recent-activity">
              <h2>Recent Pending Requests</h2>
              {pendingRequests.slice(0, 5).map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-info">
                    <strong>{request.email}</strong>
                    <span>@{request.instagram_handle}</span>
                    <small>{formatDate(request.requested_at)}</small>
                  </div>
                  <div className="request-actions">
                    <button 
                      className="btn btn--small btn--success"
                      onClick={() => handleApprove(request.id)}
                    >
                      ✅ Approve
                    </button>
                    <button 
                      className="btn btn--small btn--danger"
                      onClick={() => handleReject(request.id)}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
              {pendingRequests.length === 0 && (
                <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No pending requests
                </p>
              )}
            </div>
          </div>
        )}

        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="requests-tab">
            <h2>All Pending Requests ({pendingRequests.length})</h2>
            {pendingRequests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-info">
                  <strong>{request.email}</strong>
                  <span>@{request.instagram_handle}</span>
                  <small>{formatDate(request.requested_at)}</small>
                </div>
                <div className="request-actions">
                  <button 
                    className="btn btn--success"
                    onClick={() => handleApprove(request.id)}
                  >
                    ✅ Approve
                  </button>
                  <button 
                    className="btn btn--danger"
                    onClick={() => handleReject(request.id)}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No pending requests! 🎉
              </p>
            )}
          </div>
        )}

        {/* CODES TAB */}
        {activeTab === 'codes' && (
          <div className="codes-tab">
            <div className="codes-header">
              <h2>Access Codes ({codes.length})</h2>
              <div>
                <button className="btn btn--primary" onClick={handleGenerateCodes}>
                  <i className="fas fa-plus"></i> Generate Codes
                </button>
                <button className="btn btn--secondary" onClick={handleDownloadCSV}>
                  <i className="fas fa-download"></i> Download CSV
                </button>
              </div>
            </div>
            <div className="codes-list">
              {codes.map(code => (
                <div key={code.id} className={`code-card ${code.is_used ? 'used' : 'unused'}`}>
                  <div className="code-text">{code.code}</div>
                  <div className="code-status">
                    {code.is_used ? (
                      <>
                        <span className="status-badge used">✅ Used</span>
                        <span>{code.username} #{code.user_number}</span>
                        <small>{code.email}</small>
                      </>
                    ) : (
                      <span className="status-badge unused">⏳ Unused</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="users-tab">
            <div className="users-header">
              <h2>Registered Users ({users.length})</h2>
              <div className="search-box">
                <input 
                  type="text" 
                  placeholder="Search: username, email, or #batch" 
                  className="search-input"
                  onChange={(e) => {
                    const searchValue = e.target.value.trim()
                    clearTimeout(window.searchTimeout)
                    window.searchTimeout = setTimeout(() => {
                      console.log('🔍 Searching for:', searchValue)
                      loadUsers(searchValue)
                    }, 500)
                  }}
                />
              </div>
            </div>

            <div className="users-table">
              <div className="table-header">
                <div className="th">User</div>
                <div className="th">Instagram</div>
                <div className="th">Joined</div>
                <div className="th">Confessions</div>
                <div className="th">Reactions</div>
                <div className="th">Credits</div>
                <div className="th">Actions</div>
              </div>

              {users.map(user => (
                <div key={user.id} className="table-row">
                  <div className="td user-cell">
                    <div className="user-details">
                      <strong>{user.username} #{user.user_number}</strong>
                      <small>{user.email}</small>
                      {user.is_admin && <span className="badge-admin">👑 ADMIN</span>}
                      {user.is_premium && <span className="badge-premium">⭐ PREMIUM</span>}
                      {user.is_banned && <span className="badge-banned">🚫 BANNED</span>}
                    </div>
                  </div>

                  <div className="td">
                    {user.instagram_handle ? (
                      <a 
                        href={`https://instagram.com/${user.instagram_handle}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="instagram-link"
                      >
                        @{user.instagram_handle}
                      </a>
                    ) : (
                      <span className="no-data">N/A</span>
                    )}
                  </div>

                  <div className="td">
                    <small>{formatDate(user.created_at)}</small>
                    {user.last_activity && (
                      <small style={{ display: 'block', color: '#999', marginTop: '4px' }}>
                        {formatLastOnline(user.last_activity)}
                      </small>
                    )}
                  </div>

                  <div className="td stat-cell">
                    <strong>{user.total_confessions || 0}</strong>
                    <small>posts</small>
                  </div>

                  <div className="td stat-cell">
                    <strong>{user.total_reactions_received || 0}</strong>
                    <small>received</small>
                  </div>

                  <div className="td stat-cell">
                    <strong>{user.credits}</strong>
                    <small>credits</small>
                  </div>

                  <div className="td actions-cell">
                    {!user.is_admin && (
                      <>
                        {!user.is_banned ? (
                          <button 
                            className="btn btn--small btn--danger"
                            onClick={() => {
                              const duration = prompt('Ban duration:\n1. Enter "3" for 3 days\n2. Enter "7" for 7 days\n3. Enter "permanent" for permanent ban')
                              if (duration) {
                                handleBanUser(user.id, true, duration)
                              }
                            }}
                            title="Ban user"
                          >
                            🚫 BAN
                          </button>
                        ) : (
                          <button 
                            className="btn btn--small btn--success"
                            onClick={() => handleBanUser(user.id, false)}
                            title="Unban user"
                          >
                            ✅ UNBAN
                          </button>
                        )}
                        <button 
                          className="btn btn--small btn--secondary"
                          onClick={() => handleViewUserDetails(user.id)}
                          title="View details"
                        >
                          👁️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="no-data-message">
                  <p>No users found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODERATION TAB */}
        {activeTab === 'moderation' && (
          <div className="moderation-tab">
            <h2>Pending Confessions ({pendingConfessions.length})</h2>
            <p className="tab-description">Review and approve confessions before they appear in the feed</p>
            
            <div className="confessions-moderation-list">
              {pendingConfessions.map(confession => (
                <div key={confession.id} className="confession-mod-card">
                  <div className="confession-mod-header">
                    <div className="confession-meta">
                      <span className="mood-badge" style={{
                        background: confession.mood_zone === 'Crush' ? '#FFB3BA' :
                                   confession.mood_zone === 'Heartbreak' ? '#BAE1FF' :
                                   confession.mood_zone === 'Secret Admirer' ? '#FFD4E5' : '#FFFFBA'
                      }}>
                        {confession.mood_zone}
                      </span>
                      <span className="user-info">
                        {confession.username} #{confession.user_number}
                      </span>
                      <small>{confession.email}</small>
                    </div>
                    <div className="confession-time">
                      {formatDate(confession.created_at)}
                    </div>
                  </div>
                  
                  <div className="confession-content">
                    <p>{confession.content}</p>
                    {confession.audio_url && (
                      <div className="audio-indicator">
                        <i className="fas fa-microphone"></i> Has voice note
                      </div>
                    )}
                  </div>
                  
                  <div className="confession-mod-actions">
                    <button 
                      className="btn btn--success"
                      onClick={() => handleApproveConfession(confession.id)}
                    >
                      ✅ APPROVE
                    </button>
                    <button 
                      className="btn btn--danger"
                      onClick={() => handleRejectConfession(confession.id)}
                    >
                      ❌ REJECT
                    </button>
                  </div>
                </div>
              ))}
              
              {pendingConfessions.length === 0 && (
                <div className="empty-state">
                  <i className="fas fa-check-circle" style={{ fontSize: '3rem', color: '#4CAF50' }}></i>
                  <h3>All caught up! 🎉</h3>
                  <p>No confessions pending moderation</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="reports-tab">
            <h2>Reported Confessions ({reports.length})</h2>
            <p className="tab-description">Review user reports and take action</p>
            
            <div className="reports-list">
              {reports.map(report => (
                <div key={report.id} className="report-card">
                  <div className="report-header">
                    <span className="report-reason-badge">{report.reason.replace('_', ' ').toUpperCase()}</span>
                    <small>Reported {formatDate(report.created_at)} by {report.reporter_username}</small>
                  </div>
                  
                  <div className="report-body">
                    <div className="reported-confession">
                      <strong>Confession:</strong>
                      <p>{report.confession_content}</p>
                      <span className="mood-badge-small">{report.mood_zone}</span>
                    </div>
                    
                    {report.details && (
                      <div className="report-details">
                        <strong>Reporter's note:</strong>
                        <p>{report.details}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="report-actions">
                    <button 
                      className="btn btn--danger"
                      onClick={() => handleResolveReport(report.id, 'remove_confession')}
                    >
                      🗑️ REMOVE CONFESSION
                    </button>
                    <button 
                      className="btn btn--secondary"
                      onClick={() => handleResolveReport(report.id, 'dismiss')}
                    >
                      ✓ DISMISS REPORT
                    </button>
                  </div>
                </div>
              ))}
              
              {reports.length === 0 && (
                <div className="empty-state">
                  <i className="fas fa-shield-alt" style={{ fontSize: '3rem', color: '#2196F3' }}></i>
                  <h3>No reports! 🛡️</h3>
                  <p>No confessions have been flagged</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTIVITY LOGS TAB */}
        {activeTab === 'activity' && (
          <div className="activity-tab">
            <h2>Activity Logs ({activityLogs.length})</h2>
            <p className="tab-description">Real-time user actions and events</p>
            
            <div className="activity-logs-list">
              {activityLogs.map(log => (
                <div key={log.id} className="activity-log-card">
                  <div className="log-header">
                    <div className="log-user">
                      <strong>{log.username} #{log.user_number}</strong>
                      <small>{log.email}</small>
                    </div>
                    <div className="log-time">
                      {formatDate(log.created_at)}
                    </div>
                  </div>
                  
                  <div className="log-body">
                    <span className={`log-action-badge ${log.action_type}`}>
                      {log.action_type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    
                    {log.credits_change !== 0 && (
                      <span className={`credits-change ${log.credits_change > 0 ? 'positive' : 'negative'}`}>
                        {log.credits_change > 0 ? '+' : ''}{log.credits_change} credits
                      </span>
                    )}
                    
                    {log.action_details && (
                      <div className="log-details">
                        <pre>{JSON.stringify(JSON.parse(log.action_details), null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {activityLogs.length === 0 && (
                <div className="empty-state">
                  <i className="fas fa-history" style={{ fontSize: '3rem', color: '#999' }}></i>
                  <h3>No Activity Yet</h3>
                  <p>User actions will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="messages-tab">
            <h2>User Messages ({conversations.length})</h2>
            <p className="tab-description">Admin-User conversations</p>
            
            <div className="conversations-list">
              {conversations.map(conv => (
                <div key={conv.user_id} className="conversation-card">
                  <div className="conv-header">
                    <div className="conv-user">
                      <strong>{conv.username} #{conv.user_number}</strong>
                      <small>{conv.email}</small>
                      <span className="online-status">
                        {formatLastOnline(conv.last_activity)}
                      </span>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="conv-unread-badge">{conv.unread_count} new</span>
                    )}
                  </div>
                  
                  <div className="conv-preview">
                    <span className="conv-sender">{conv.last_sender === 'user' ? 'User' : 'You'}:</span>
                    {conv.last_message}
                  </div>
                  
                  <div className="conv-actions">
                    <button 
                      className="btn btn--primary"
                      onClick={() => window.location.href = `/admin-chat?user=${conv.user_id}`}
                    >
                      <i className="fas fa-reply"></i> REPLY
                    </button>
                  </div>
                </div>
              ))}
              
              {conversations.length === 0 && (
                <div className="empty-state">
                  <i className="fas fa-envelope" style={{ fontSize: '3rem', color: '#999' }}></i>
                  <h3>No Messages</h3>
                  <p>User messages will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
